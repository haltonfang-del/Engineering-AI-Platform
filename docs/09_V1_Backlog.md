# V1 Development Backlog

## Sprint 1 — Search UI + API vertical slice
- [x] Establish a separate feature branch.
- [x] Add a React search workspace with result and evidence panels.
- [x] Connect UI to the existing keyword search endpoint.
- [x] Add demo data mode for interface review without company documents.
- [ ] Confirm frontend build and backend regression tests in CI.

## Sprint 2 — Company document server connection
- [ ] RD confirms the approved folder path(s) and document scope with MIS.
- [ ] MIS confirms protocol (SMB/Windows share, NFS, or approved API) and application-host network access.
- [ ] MIS provisions a dedicated read-only service identity or approved equivalent.
- [ ] Confirm folder-level access groups and permission-filtering requirements.
- [ ] Configure the server share through environment/secret configuration; no real paths or credentials in Git.
- [ ] Add read-only recursive scanner, change detection, deletion reconciliation in the index, and indexing status.
- [ ] Add DOCX parser and source metadata tests.

## Sprint 3 — Engineering evidence and answer retrieval
- [ ] Preserve document page/slide/sheet/cell references and extract image/page previews.
- [ ] Add hybrid keyword + semantic retrieval after selecting an approved embedding runtime.
- [ ] Implement evidence-grounded answer API only after model/data approval.
- [ ] Add explicit “not found in approved sources” behavior and citations.

## Sprint 4 — Enterprise controls
- [ ] Integrate AD/LDAP/SSO or the MIS-approved identity provider.
- [ ] Apply ACL filtering before search and model context construction.
- [ ] Add audit events and admin document status view.
- [ ] Conduct 50-user load and security tests.
