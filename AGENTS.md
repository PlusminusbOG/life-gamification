# Real Engineering Project Guidelines (Matt Pocock Skills)

This project follows the **Skills for Real Engineers** engineering system created by Matt Pocock: composable, disciplined practices focused on alignment, test-driven development, deep modules, and two-axis code reviews.

## Agent skills

### Issue tracker

Local markdown issue tracker under `.scratch/` (or GitHub / GitLab CLI when configured with a remote). See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context domain modeling via `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

---

## Core Engineering Directives

1. **Alignment First**: Before jumping into major code changes, run a grilling session (`/grill-me` or `/grill-with-docs`) to resolve ambiguity, edge cases, and domain vocabulary.
2. **Fresh Subagent Contexts**: When dispatching subagents (e.g. `standards-reviewer`, `spec-reviewer`, `implementer`, `researcher`, `codebase-architect`, `decision-explorer`), always provide a fresh context window. Do not inherit bloated parent histories.
3. **Red-Green-Refactor Loop (`/tdd`)**: All bug fixes and feature development must start with a failing automated test, followed by minimal passing code, followed by refactoring against Fowler code smells.
4. **Deep Modules (`/codebase-design`)**: Design deep interfaces—simple, clean public surfaces that hide extensive implementation complexity.
5. **Two-Axis Review (`/code-review`)**: Evaluate diffs independently for Standards adherence (conventions & Fowler smells) and Spec fidelity (requirements & scope creep).
6. **Ubiquitous Language**: Strictly use terms established in `GLOSSARY.md`.
