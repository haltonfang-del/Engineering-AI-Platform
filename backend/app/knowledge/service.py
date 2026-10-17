import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

from app.knowledge.parsers.dispatcher import SUPPORTED_SUFFIXES, parse_document
from app.knowledge.schemas import DocumentChunk, SearchResult


class KnowledgeService:
    def __init__(self, knowledge_root: Path, index_path: Path, enable_legacy_conversion: bool = False):
        self.knowledge_root = knowledge_root.expanduser().resolve()
        self.index_path = index_path.expanduser().resolve()
        self.enable_legacy_conversion = enable_legacy_conversion

    def resolve_source(self, relative_path: str) -> Path:
        requested = Path(relative_path)
        if requested.is_absolute():
            raise ValueError("Path must be relative to the configured knowledge root.")
        candidate = (self.knowledge_root / requested).resolve(strict=True)
        if not candidate.is_relative_to(self.knowledge_root):
            raise ValueError("Path is outside the configured knowledge root.")
        if not candidate.is_file():
            raise ValueError("The requested path is not a file.")
        if candidate.suffix.lower() not in SUPPORTED_SUFFIXES:
            raise ValueError(f"Unsupported file extension: {candidate.suffix or '(none)'}")
        return candidate

    def _read_index(self) -> list[dict]:
        if not self.index_path.exists():
            return []
        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Cannot read local knowledge index: {exc}") from exc
        if not isinstance(data, list):
            raise RuntimeError("Local knowledge index has an invalid format.")
        return data

    def index_file(self, relative_path: str) -> int:
        source = self.resolve_source(relative_path)
        normalized_path = source.relative_to(self.knowledge_root).as_posix()
        chunks = parse_document(source, normalized_path, self.enable_legacy_conversion)
        records = [chunk.model_dump() for chunk in chunks]
        existing = [item for item in self._read_index() if item.get("source_path") != normalized_path]
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", encoding="utf-8", dir=self.index_path.parent, delete=False) as temporary:
            json.dump(existing + records, temporary, ensure_ascii=False, indent=2)
            temporary_path = Path(temporary.name)
        os.replace(temporary_path, self.index_path)
        return len(records)

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        normalized_query = query.strip().casefold()
        if not normalized_query:
            raise ValueError("Search query must not be empty.")
        results: list[SearchResult] = []
        for item in self._read_index():
            content = str(item.get("content", ""))
            count = content.casefold().count(normalized_query)
            if count:
                results.append(SearchResult(
                    content=content,
                    source_name=item["source_name"],
                    source_path=item["source_path"],
                    file_type=item["file_type"],
                    page_number=item.get("page_number"),
                    slide_number=item.get("slide_number"),
                    sheet_name=item.get("sheet_name"),
                    cell_reference=item.get("cell_reference"),
                    match_count=count,
                ))
        results.sort(key=lambda result: (-result.match_count, result.source_path))
        return results[:max(1, min(limit, 100))]
