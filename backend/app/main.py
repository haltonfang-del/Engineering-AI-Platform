from fastapi import FastAPI
from app.api.v1.router import router as api_router

app = FastAPI(
    title="Engineering AI Platform",
    version="0.1.0",
    description="Enterprise Engineering AI Platform Backend",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Engineering AI Platform API",
        "version": "0.1.0",
    }