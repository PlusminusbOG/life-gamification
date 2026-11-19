---
trigger: always_on
---

# Real Engineering Principles (Matt Pocock Skills)

This project adheres to disciplined software engineering rather than unstructured vibe coding.

## Core Rules

1. **Deliberate Small Steps**: Never undertake tasks too large for one verifiable cycle. The rate of feedback is your speed limit.
2. **Feedback Loops First**: Before changing code, ensure a feedback loop exists (automated test, compiler check, type check, or runtime assertion).
3. **Keep Control**: Do not blindly accept mass generated code. Understand every line, keep diffs minimal, and verify each step.
4. **Shared Language**: Use ubiquitous domain language defined in `GLOSSARY.md`. Avoid vague, shifting terminology.
5. **Architectural Intent**: Keep modules deep (simple interface, powerful implementation) and record non-trivial decisions in `docs/adr/`.
