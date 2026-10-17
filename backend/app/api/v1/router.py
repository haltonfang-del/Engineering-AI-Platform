from fastapi import APIRouter

from app.api.v1.knowledge import router as knowledge_router

router = APIRouter()

router.include_router(knowledge_router)


@router.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
