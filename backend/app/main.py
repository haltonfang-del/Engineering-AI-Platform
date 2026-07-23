from fastapi import FastAPI

from app.api.v1.router import router as api_router
from app.core.settings import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Engineering AI Platform Backend",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
    }


@app.get("/config")
def config():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "provider": settings.DEFAULT_LLM_PROVIDER,
        "model": settings.DEFAULT_MODEL,
    }