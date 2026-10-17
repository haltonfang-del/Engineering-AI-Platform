from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import ValidationError

from app.core.settings import settings
from app.knowledge.parsers.legacy import LegacyConversionError
from app.knowledge.schemas import IndexRequest, IndexResponse, SearchResponse
from app.knowledge.service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Knowledge Search"])


@lru_cache
def get_knowledge_service() -> KnowledgeService:
    return KnowledgeService(
        knowledge_root=Path(settings.KNOWLEDGE_ROOT),
        index_path=Path(settings.KNOWLEDGE_INDEX_PATH),
        enable_legacy_conversion=settings.ENABLE_LEGACY_CONVERSION,
    )


@router.post("/index", response_model=IndexResponse)
def index_document(request: IndexRequest):
    service = get_knowledge_service()
    try:
        count = service.index_file(request.path)
        source = service.resolve_source(request.path)
        return IndexResponse(indexed_path=source.relative_to(service.knowledge_root).as_posix(), chunks_indexed=count)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File was not found under the configured knowledge root.")
    except LegacyConversionError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/search", response_model=SearchResponse)
def search_knowledge(
    q: str = Query(min_length=1, description="Case-insensitive keyword query"),
    limit: int = Query(default=10, ge=1, le=100),
):
    try:
        results = get_knowledge_service().search(q, limit=limit)
        return SearchResponse(query=q, result_count=len(results), results=results)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
