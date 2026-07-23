# GitHub Copilot Instructions

## Project Overview

Engineering AI Platform follows a documentation-first development process.

GitHub Repository is the Single Source of Truth (SSOT).

All AI assistants must follow the approved specifications before generating code.

---

## Development Workflow

Every feature must follow this workflow:

1. Specification
2. Implementation
3. Review

Do not skip any step.

---

## Documentation Rules

Documentation has higher priority than implementation.

Whenever architecture changes:

- Update Architecture documentation.
- Update AI Context.
- Update Project Status.

---

## Coding Standards

- Keep code simple.
- Prefer readability over cleverness.
- Follow SOLID principles.
- Avoid duplicated logic.
- Write modular code.
- Minimize dependencies.
- Keep functions focused on one responsibility.

---

## Repository Structure

Expected folders include:

- docs/
- backend/
- frontend/
- prompts/
- knowledge/
- scripts/

Do not create unnecessary folders.

---

## Naming Convention

- Classes: PascalCase
- Python files: snake_case
- Functions: snake_case
- Constants: UPPER_CASE

Use descriptive English names.

---

## AI Coding Rules

Before writing code:

1. Read related documentation.
2. Follow the documented architecture.
3. Reuse existing modules.
4. Keep changes minimal.
5. Avoid breaking existing functionality.

Never assume undocumented requirements.

---

## Architecture Constraints

Do not introduce:

- New frameworks
- New databases
- New infrastructure

unless the Architecture document has been updated first.

---

## Pull Request Checklist

Before considering work complete:

- Specification approved
- Documentation updated
- Architecture respected
- Code reviewed
- No unnecessary complexity

---

## Single Source of Truth

This repository is the authoritative source for:

- Specifications
- Architecture
- AI Context
- Project Status
- Coding Standards

Chat history must never be treated as the primary project reference.