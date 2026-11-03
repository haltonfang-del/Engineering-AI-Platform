# Engineering Design Guide Search Platform V1

## Scope

- Audience: 10–50 RD engineers on the company intranet.
- Source of truth: company NAS/shared folder. The application account must be read-only.
- V1: document ingestion, keyword search, source/page traceability, and a search-first answer workspace. AI-generated answers remain disabled until the company approves the model/runtime and data-processing boundary.
- Supported initial formats: PDF, PPTX, XLSX. DOCX is planned for the first parser expansion. Scanned PDF OCR and CAD are out of scope for V1.

## Architecture

Browser (React/Vite) -> FastAPI -> Knowledge service -> local index metadata. The knowledge service reads a configured NAS mount path; it never writes to the source folder. A scheduled scanner can be added after the first manual indexing workflow is validated. Original files stay on NAS.

## V1 implementation slices

1. Search UI and API integration.
2. Index approved files from a configured local/NAS-mounted root.
3. Keyword retrieval with file type and page/slide/sheet/cell source references.
4. Answer workspace that presents retrieved evidence and citations without inventing engineering requirements.
5. Add authentication/AD group permission filtering before company-wide rollout.

## Security requirements

- Do not commit company documents, extracted text, embeddings, indexes, credentials, or NAS paths containing sensitive identifiers.
- Configure NAS as a read-only mount/service account.
- Keep the API bound to the intranet interface and behind company authentication before real deployment.
- Enforce document permissions before retrieval and before sending context to any model.
- No external LLM provider may receive company content until explicitly approved by IT/security.

## Acceptance targets

- Search API returns source name/path and page/slide/sheet/cell metadata.
- Search UI supports keyword entry, result list, and evidence panel.
- Empty and malformed queries return clear validation messages.
- Search P95 target < 3 seconds on the agreed pilot corpus (measure during pilot; not yet verified).
- A 50-user concurrency test is required before production rollout.

## Known limitations

- Current parser/index is a local prototype, not yet a NAS watcher or enterprise permission system.
- Current retrieval is keyword-based; semantic/vector search and model-backed RAG are later increments.
- Image extraction, diagram understanding, OCR, version approval workflow, AD/LDAP, and production deployment remain pending.
