# AI Context

## Project
Engineering AI Platform

## Current Phase
Sprint 002: Engineering Document Parsing and Keyword Search

## Development workflow
Specification -> Implementation -> Review

## Single Source of Truth
GitHub Repository

## Current implementation
- FastAPI backend with root and health endpoints.
- Local document parsing for PPTX, XLSX, and text-based PDF.
- Optional legacy PPT/XLS conversion using LibreOffice.
- Local JSON index and case-insensitive keyword search.
- Search results preserve source file and page/slide/sheet/cell metadata where applicable.
- Synthetic tests are present but runtime execution is pending.

## Coding and safety principles
- Documentation First, modular design, readable code, focused functions.
- Do not send source documents to external AI providers as part of local keyword search.
- Do not commit company documents, generated indexes, or secrets.
- OCR, image interpretation, semantic/vector search, and generated AI answers are deferred.
- Do not claim tests passed unless they have actually been executed.

## AI roles
- Technical Architect: architecture, specifications, documentation, review.
- Software Engineer: implementation, refactoring, unit tests.
- Reviewer: code, documentation, and architecture compliance.
