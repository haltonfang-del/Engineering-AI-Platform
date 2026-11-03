# Engineering Design Guide Search Platform V1

## Scope

- Audience: 10–50 RD engineers on the company intranet.
- Source of truth: the company's existing engineering document server. Do not create a duplicate document repository.
- V1: document ingestion, keyword search, source/page traceability, and a search-first evidence workspace. AI-generated answers remain disabled until the company approves the model/runtime and data-processing boundary.
- Initial formats: PDF, PPTX, XLSX. DOCX is planned for the first parser expansion. Scanned PDF OCR and CAD are out of scope for the first pilot.

## Architecture

Browser (React/Vite) -> FastAPI -> Knowledge service -> local searchable index. The Knowledge service reads from a configured server share path exposed to the application host. The source server remains the system of record and is never modified by this application.

The exact server protocol and path are not yet confirmed. Support should be selected after MIS confirms whether the share is SMB/Windows file share, NFS, or another managed interface. Do not hardcode a server address or share path in source code.

## MIS access prerequisites

1. RD identifies the approved document folder(s) and provides the existing path to MIS through company-approved channels.
2. MIS confirms the access protocol, network location, service-host connectivity, and whether the application host is allowed to reach the share.
3. MIS provisions a dedicated read-only service identity or approved equivalent. Do not use a personal account, shared password in configuration, or administrator credentials.
4. MIS confirms which RD groups may search which folders. Search must not expose documents beyond the caller's existing access rights.
5. Credentials must be injected through the company's approved secret store or service identity mechanism. Never commit credentials or real server paths to Git.
6. If MIS cannot approve service-account access, the pilot must use a sanctioned export/snapshot folder with the same access controls. Do not bypass server permissions.

## V1 implementation slices

1. Search UI and API integration.
2. Connect to the approved server share through a read-only mounted path or MIS-approved API.
3. Index approved files and record file metadata, source path, last-modified time, and source location (page/slide/sheet/cell).
4. Detect new/changed files and re-index them; reconcile removed files without deleting originals.
5. Present retrieved evidence and citations without inventing engineering requirements.
6. Enforce user/group document permissions before retrieval and before any future model context construction.

## Security requirements

- Do not commit company documents, extracted text, embeddings, indexes, credentials, real server paths, or sensitive identifiers.
- Source access must be read-only. The application must never rename, overwrite, move, or delete source documents.
- Keep the API on the company intranet and behind company authentication before real deployment.
- Apply source ACLs or an MIS-approved equivalent before search results are returned.
- No external LLM provider may receive company content until explicitly approved by IT/security.

## Acceptance targets

- Search API returns source name/path and page/slide/sheet/cell metadata.
- Search UI supports keyword entry, result list, and evidence panel.
- Empty and malformed queries return clear validation messages.
- Search P95 target < 3 seconds on the agreed pilot corpus (measure during pilot; not yet verified).
- A 50-user concurrency test is required before production rollout.
- Permission tests prove that a user cannot retrieve results from a folder they are not authorized to read.

## Known limitations

- Current parser/index is a local prototype, not yet connected to the company document server or its ACL system.
- Current retrieval is keyword-based; semantic/vector search and model-backed RAG are later increments.
- Image extraction, diagram understanding, OCR, version approval workflow, AD/LDAP/SSO, and production deployment remain pending.
