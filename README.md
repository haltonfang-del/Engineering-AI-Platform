# Engineering-AI-Platform

Enterprise AI Knowledge Platform for Engineering Design Guides.

## Current capability

The backend includes a local, keyword-based engineering document index with source references for PDF pages, PowerPoint slides, Excel worksheets/cells, and Word paragraphs/tables. Source documents are read-only; extracted text and the generated index stay local, and search does not call an external AI provider.

## Backend setup

Run commands from the `backend/` directory.

1. Create and activate a Python virtual environment.
2. Install dependencies: `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and adjust local paths as needed.
4. Set `KNOWLEDGE_ROOT` to an approved local, read-only source folder. Keep the absolute path in the ignored `backend/.env` file, never in source control.
5. Start the API: `uvicorn app.main:app --reload`.

The API docs are available at `/docs`. The root and `/api/v1/health` endpoints remain available.

## Knowledge API

- `POST /api/v1/knowledge/index` with JSON body `{"path":"sample.pptx"}` indexes a single file relative to `KNOWLEDGE_ROOT`.
- `POST /api/v1/knowledge/scan` recursively indexes supported files, skips unchanged files, and drops stale index entries when source files are removed.
- `GET /api/v1/knowledge/search?q=torque` returns keyword matches with source locations.
- `KNOWLEDGE_INDEX_PATH` controls the local JSON index path (default: `.knowledge_index/index.json`).

Supported formats: `.pdf`, `.pptx`, `.xlsx`, and `.docx`. Legacy `.ppt` and `.xls` conversion is disabled by default; to enable it, install LibreOffice and set `ENABLE_LEGACY_CONVERSION=true`. OCR and image/diagram interpretation are not included; results point back to the source document and extracted text locations.

Do not place confidential company documents in this public repository. Local knowledge files, indexes, and `.env` files are excluded from Git.
