from pathlib import Path
from app.knowledge.parsers.legacy import parse_legacy
from app.knowledge.parsers.pdf_parser import parse_pdf
from app.knowledge.parsers.pptx_parser import parse_pptx
from app.knowledge.parsers.xlsx_parser import parse_xlsx
from app.knowledge.schemas import DocumentChunk

SUPPORTED_SUFFIXES = {".pptx", ".xlsx", ".pdf", ".ppt", ".xls"}


def parse_document(path: Path, relative_path: str, enable_legacy_conversion: bool = False) -> list[DocumentChunk]:
    suffix = path.suffix.lower()
    if suffix == ".pptx":
        return parse_pptx(path, relative_path)
    if suffix == ".xlsx":
        return parse_xlsx(path, relative_path)
    if suffix == ".pdf":
        return parse_pdf(path, relative_path)
    if suffix in {".ppt", ".xls"}:
        return parse_legacy(path, relative_path, enable_legacy_conversion)
    raise ValueError(f"Unsupported file extension: {suffix or '(none)'}")
