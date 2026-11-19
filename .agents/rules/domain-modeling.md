---
trigger: always_on
---

# Domain Modeling & Architecture Decisions

This repository uses explicit domain modeling and architecture decision records to eliminate confusion and token waste.

1. **Before Exploring or Implementing**:
   - Check `GLOSSARY.md` at root for ubiquitous domain vocabulary.
   - Check `docs/adr/` for recorded architecture decisions.
   - If files are empty or absent, proceed silently without lecturing the user; populate them lazily via `/domain-modeling` when real domain concepts or decisions emerge.
2. **Use Domain Vocabulary**:
   - When naming files, functions, variables, database columns, and tickets, use terms as defined in `GLOSSARY.md`.
   - Never invent synonyms for existing domain terms.
3. **Flag ADR Conflicts**:
   - If a proposed implementation contradicts an existing ADR, explicitly surface the conflict rather than silently violating it.
