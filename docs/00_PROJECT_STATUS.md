# Project Status

## Current Sprint
Sprint 002: Engineering Document Parsing and Keyword Search

## Status
Implementation committed to main; runtime verification is pending.

## Completed in repository
- Approved specification in `docs/07_KnowledgeSearch_Specification.md`
- PPTX, XLSX, and text-based PDF parser modules
- Optional LibreOffice-based legacy PPT/XLS conversion, disabled by default
- Local JSON index and case-insensitive keyword search service
- Knowledge indexing and search API routes
- Synthetic test suite and dependency declarations
- README, architecture, AI context, environment example, and Git ignore updates

## Verification status
Tests have been authored but have not been executed in a live Codespaces runtime by the GitHub file-editing connector. Do not treat the implementation as runtime-verified until dependencies are installed and tests are run.

## Known limitations
- No OCR for scanned PDFs or embedded images/charts.
- XLSX formula results are read from cached values only; formulas are not recalculated.
- Legacy conversion requires LibreOffice installed and `ENABLE_LEGACY_CONVERSION=true`.
- Authentication, authorization, rate limiting, and production deployment controls are not included in this prototype.
- The GitHub repository is public; confidential engineering documents must not be committed.
