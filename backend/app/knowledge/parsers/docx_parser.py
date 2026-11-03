from pathlib import Path

from docx import Document

from app.knowledge.schemas import DocumentChunk


def parse_docx(path: Path, relative_path: str) -> list[DocumentChunk]:
    document = Document(str(path))
    chunks: list[DocumentChunk] = []

    heading = ""
    paragraph_number = 0
    for paragraph in document.paragraphs:
        text = paragraph.text.strip()
        if not text:
            continue
        paragraph_number += 1
        if paragraph.style and paragraph.style.name.startswith("Heading"):
            heading = text
        chunks.append(DocumentChunk(
            source_name=path.name,
            source_path=relative_path,
            file_type=path.suffix.lower(),
            content=(f"Section: {heading}\n{text}" if heading else text),
            section_name=heading or None,
            paragraph_number=paragraph_number,
        ))

    for table_number, table in enumerate(document.tables, start=1):
        for row_number, row in enumerate(table.rows, start=1):
            values = [cell.text.strip().replace("\n", " ") for cell in row.cells]
            if any(values):
                chunks.append(DocumentChunk(
                    source_name=path.name,
                    source_path=relative_path,
                    file_type=path.suffix.lower(),
                    content=f"Table {table_number}, row {row_number}: " + " | ".join(values),
                    table_number=table_number,
                    paragraph_number=row_number,
                ))

    return chunks
