# Engineering-AI-Platform

Enterprise AI Knowledge Platform for Engineering Design Guides.

## Current capability

The backend includes a local, keyword-based engineering document index with source references for PowerPoint, Excel, and text-based PDF files. Source documents are processed locally; the search feature does not call an external AI provider.

## Backend setup

Run commands from the `backend/` directory.

1. Create and activate a Python virtual environment.
2. Install dependencies: `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and adjust local paths as needed.
4. Place approved test or engineering documents under the configured `KNOWLEDGE_ROOT` directory (default: `backend/knowledge`).
5. Start the API: `uvicorn app.main:app --reload`.

The API docs are available at `/docs`. The root and `/api/v1/health` endpoints remain available.

## Knowledge API

- `POST /api/v1/knowledge/index` with JSON body `{"path":"sample.pptx"}` indexes a single file relative to `KNOWLEDGE_ROOT`.
- `GET /api/v1/knowledge/search?q=torque` returns keyword matches with source locations.
- `KNOWLEDGE_INDEX_PATH` controls the local JSON index path (default: `.knowledge_index/index.json`).

Supported formats: `.pptx`, `.xlsx`, and text-based `.pdf`. Legacy `.ppt` and `.xls` conversion is disabled by default; to enable it, install LibreOffice and set `ENABLE_LEGACY_CONVERSION=true`. OCR for images, charts, and scanned PDFs is deferred.

Do not place confidential company documents in this public repository. Local knowledge files, indexes, and `.env` files are excluded from Git.
