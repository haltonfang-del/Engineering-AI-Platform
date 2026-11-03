from datetime import datetime, timezone
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    source_name: str
    source_path: str
    file_type: str
    content: str
    page_number: int | None = None
    slide_number: int | None = None
    sheet_name: str | None = None
    cell_reference: str | None = None
    section_name: str | None = None
    paragraph_number: int | None = None
    table_number: int | None = None
    source_modified_at: str | None = None
    extracted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class IndexRequest(BaseModel):
    path: str = Field(min_length=1, description="Path relative to the configured knowledge root")


class IndexResponse(BaseModel):
    indexed_path: str
    chunks_indexed: int


class ScanResponse(BaseModel):
    files_scanned: int
    files_indexed: int
    files_unchanged: int
    files_removed: int
    chunks_indexed: int


class VisualAsset(BaseModel):
    filename: str
    content_type: str
    data_base64: str


class VisualsResponse(BaseModel):
    source_path: str
    location: str
    assets: list[VisualAsset]
    truncated: bool = False


class SearchResult(BaseModel):
    content: str
    source_name: str
    source_path: str
    file_type: str
    page_number: int | None = None
    slide_number: int | None = None
    sheet_name: str | None = None
    cell_reference: str | None = None
    section_name: str | None = None
    paragraph_number: int | None = None
    table_number: int | None = None
    source_modified_at: str | None = None
    match_count: int


class SearchResponse(BaseModel):
    query: str
    result_count: int
    results: list[SearchResult]
