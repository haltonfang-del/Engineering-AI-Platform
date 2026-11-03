import json
import os
import math
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile

from app.knowledge.parsers.dispatcher import SUPPORTED_SUFFIXES, parse_document
from app.knowledge.schemas import DocumentChunk, SearchResult

CJK_RUN = re.compile(r"[\u3400-\u9fff]+")
LATIN_TOKEN = re.compile(r"[a-z0-9]+", re.IGNORECASE)


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

    def _read_index(self) -> dict[str, dict]:
        if not self.index_path.exists():
            return {}
        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Cannot read local knowledge index: {exc}") from exc
        if isinstance(data, dict) and isinstance(data.get("documents"), dict):
            return data["documents"]
        if not isinstance(data, list):
            raise RuntimeError("Local knowledge index has an invalid format.")
        # Read the prototype's original flat index and migrate it on the next write.
        documents: dict[str, dict] = {}
        for item in data:
            source_path = item.get("source_path")
            if not source_path:
                continue
            document = documents.setdefault(source_path, {"chunks": []})
            document["chunks"].append(item)
        return documents

    def _write_index(self, documents: dict[str, dict]) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", encoding="utf-8", dir=self.index_path.parent, delete=False) as temporary:
            json.dump({"version": 1, "documents": documents}, temporary, ensure_ascii=False, indent=2)
            temporary_path = Path(temporary.name)
        try:
            os.replace(temporary_path, self.index_path)
        finally:
            temporary_path.unlink(missing_ok=True)

    def _index_path(self, source: Path) -> tuple[str, dict]:
        relative_path = source.relative_to(self.knowledge_root).as_posix()
        stat = source.stat()
        chunks = parse_document(source, relative_path, self.enable_legacy_conversion)
        modified_at = datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()
        for chunk in chunks:
            chunk.source_modified_at = modified_at
        return relative_path, {
            "modified_ns": stat.st_mtime_ns,
            "size": stat.st_size,
            "chunks": [chunk.model_dump() for chunk in chunks],
        }

    def index_file(self, relative_path: str) -> int:
        source = self.resolve_source(relative_path)
        normalized_path, record = self._index_path(source)
        documents = self._read_index()
        documents[normalized_path] = record
        self._write_index(documents)
        return len(record["chunks"])

    def scan(self) -> dict[str, int]:
        supported = SUPPORTED_SUFFIXES - ({".ppt", ".xls"} if not self.enable_legacy_conversion else set())
        sources = sorted(
            (path for path in self.knowledge_root.rglob("*")
             if path.is_file() and path.suffix.lower() in supported),
            key=lambda path: path.as_posix().casefold(),
        )
        existing = self._read_index()
        scanned: dict[str, dict] = {}
        unchanged = 0
        indexed = 0
        chunks_indexed = 0
        for candidate in sources:
            source = self.resolve_source(candidate.relative_to(self.knowledge_root).as_posix())
            relative_path = source.relative_to(self.knowledge_root).as_posix()
            stat = source.stat()
            previous = existing.get(relative_path, {})
            if previous.get("modified_ns") == stat.st_mtime_ns and previous.get("size") == stat.st_size:
                scanned[relative_path] = previous
                unchanged += 1
                continue
            _, record = self._index_path(source)
            scanned[relative_path] = record
            indexed += 1
            chunks_indexed += len(record["chunks"])

        removed = len(set(existing) - set(scanned))
        self._write_index(scanned)
        return {
            "files_scanned": len(sources),
            "files_indexed": indexed,
            "files_unchanged": unchanged,
            "files_removed": removed,
            "chunks_indexed": chunks_indexed,
        }

    def search(self, query: str, limit: int = 10, sort_by: str = "relevance") -> list[SearchResult]:
        normalized_query = unicodedata.normalize("NFKC", query).strip().casefold()
        if not normalized_query:
            raise ValueError("Search query must not be empty.")
        if sort_by not in {"relevance", "recent"}:
            raise ValueError("sort_by must be 'relevance' or 'recent'.")
        terms: list[str] = []
        for match in CJK_RUN.finditer(normalized_query):
            run = match.group(0)
            terms.extend(run[index:index + 2] for index in range(len(run) - 1) if len(run) > 1)
            if len(run) == 1:
                terms.append(run)
        terms.extend(match.group(0) for match in LATIN_TOKEN.finditer(normalized_query))
        terms = list(dict.fromkeys(terms))
        minimum_term_hits = max(1, math.ceil(len(terms) / 2))
        results: list[tuple[int, SearchResult]] = []
        for document in self._read_index().values():
            for item in document.get("chunks", []):
                content = unicodedata.normalize("NFKC", str(item.get("content", ""))).casefold()
                exact_count = content.count(normalized_query)
                matched_terms = sum(1 for term in terms if term in content)
                if exact_count or matched_terms >= minimum_term_hits:
                    score = exact_count * (len(terms) + 1) + matched_terms
                    results.append((score, SearchResult(
                        content=content,
                        source_name=item["source_name"],
                        source_path=item["source_path"],
                        file_type=item["file_type"],
                        page_number=item.get("page_number"),
                        slide_number=item.get("slide_number"),
                        sheet_name=item.get("sheet_name"),
                        cell_reference=item.get("cell_reference"),
                        section_name=item.get("section_name"),
                        paragraph_number=item.get("paragraph_number"),
                        table_number=item.get("table_number"),
                        source_modified_at=item.get("source_modified_at"),
                        match_count=exact_count + matched_terms,
                    )))
        if sort_by == "recent":
            results.sort(
                key=lambda item: (
                    item[1].source_modified_at or "",
                    item[0],
                    item[1].source_path,
                ),
                reverse=True,
            )
        else:
            results.sort(key=lambda item: (-item[0], item[1].source_path))
        return [result for _, result in results[:max(1, min(limit, 100))]]
