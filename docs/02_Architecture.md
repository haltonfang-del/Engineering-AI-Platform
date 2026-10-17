# System Architecture

## Overview
Engineering AI Platform follows a documentation-first, modular architecture. The first knowledge-search implementation is provider-independent and processes documents locally.

## Backend
FastAPI exposes the existing root/configuration endpoints and versioned API routes. The API router includes health and knowledge-search endpoints.

## Knowledge layer (Sprint 002)
- Parsers extract text from PPTX slides, XLSX cells, and text-based PDF pages.
- Legacy PPT/XLS conversion is optional and requires LibreOffice plus explicit configuration.
- A local JSON index stores extracted text and source metadata.
- Case-insensitive keyword search returns snippets and source references.
- No database, vector store, OCR, or external AI provider is required for this phase.

## Source traceability
Each indexed chunk records its source path and filename, file type, and where available slide number, PDF page number, worksheet name, and cell coordinate. Excel formulas are recorded as formula text; cached values are included when available. Formulas are not recalculated and source workbooks are not modified.

## Storage and security
The knowledge root and index path are configurable with `KNOWLEDGE_ROOT` and `KNOWLEDGE_INDEX_PATH`. Indexing rejects absolute paths, traversal outside the configured root, and unsupported extensions. Source files, generated index files, and secrets must not be committed. Company documents must only be processed in an approved internal environment.

## Deferred
OCR for scanned PDFs, image and chart interpretation, semantic/vector search, LLM-generated answers, authentication/authorization, and production deployment controls are not part of this first implementation.
