# Engineering Document Parsing and Knowledge Search Specification

## Status
Approved for Sprint 002 implementation.

## Scope
The first implementation supports local parsing and keyword search for:
- PowerPoint .pptx
- Excel .xlsx
- PDF with extractable text
- Legacy PowerPoint .ppt and Excel .xls via optional LibreOffice conversion when available

OCR for embedded images, charts, scanned PDFs, and image-based drawings is out of scope for this sprint and reserved for a later phase.

## Goals
- Parse engineering documents without sending source files to external AI services.
- Preserve traceable source locations in search results.
- Provide deterministic keyword search before adding an LLM or vector database.
- Keep original documents unchanged.
- Store indexes locally and exclude document/index data from Git.

## Source metadata
Every extracted chunk should include:
- source filename and relative path
- file type
- text content
- page/slide number when applicable
- worksheet name and cell/range when applicable
- extraction timestamp where practical

## Parsing rules
- PPTX: extract slide text and table cell text; use 1-based slide numbers.
- XLSX: extract non-empty cells, sheet names, cell coordinates, formula text, and cached values when present. Do not recalculate formulas or modify workbooks.
- PDF: extract selectable text page by page and preserve 1-based page numbers.
- Legacy PPT/XLS: attempt conversion to supported formats using LibreOffice only if installed and explicitly configured. If conversion is unavailable or fails, return a clear unsupported/conversion error rather than silently skipping the file.
- OCR and image/chart interpretation are deferred.

## Index and search
- Use a local, file-based index for the initial implementation.
- Support case-insensitive keyword matching and return source metadata with each result.
- Do not require a database, vector store, or external AI provider.
- Index only files in a configured local knowledge directory.
- Do not commit source documents, generated index data, or secrets.

## API
- POST /api/v1/knowledge/index: index a single supported file under the configured knowledge root.
- GET /api/v1/knowledge/search?q=...: search the local index.
- Responses must include result text and source metadata.
- Reject paths outside the configured knowledge root and validate file extensions.
- Return clear client errors for missing query, missing file, unsupported format, or conversion/parser errors.

## Security
- Do not accept arbitrary filesystem paths outside the configured knowledge root.
- Do not send source documents to external providers.
- Do not log full document contents.
- Keep knowledge files and generated indexes out of Git.
- This implementation is a prototype and does not replace company authentication or access-control requirements.

## Acceptance tests
- PPTX parsing preserves slide numbers.
- XLSX parsing preserves sheet and cell coordinates, including formula text when present.
- Text PDF parsing preserves page numbers.
- Keyword search returns matching content and source metadata.
- Unsupported formats and unavailable legacy conversion fail with clear errors.
- API path traversal is rejected.
- Existing root and health endpoints continue to work.
- Tests use synthetic fixtures only; no confidential company documents are committed.
