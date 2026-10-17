from pathlib import Path
from pypdf import PdfReader
from app.knowledge.schemas import DocumentChunk


def parse_pdf(path: Path, relative_path: str) -> list[DocumentChunk]:
    reader = PdfReader(str(path))
    chunks: list[DocumentChunk] = []
    for page_number, page in enumerate(reader.pages, start=1):
        content = (page.extract_text() or "").strip()
        if content:
            chunks.append(DocumentChunk(
                source_name=path.name, source_path=relative_path, file_type=path.suffix.lower(),
                content=content, page_number=page_number,
            ))
    return chunks
