---
trigger: always_on
---

# Subagents Discipline

When dispatching or coordinating subagents in this repository:

1. **Fresh Context Window**: Always launch subagents with a fresh, clean context window rather than forking bloated conversation history.
2. **Clear & Actionable Briefs**: Provide the subagent with everything it needs in its initial brief (files, diffs, specs, constraints) and a crisp definition of "done".
3. **Focused Roles**: Use specialized subagents:
   - `standards-reviewer`: Code smells and repo conventions.
   - `spec-reviewer`: Requirements fidelity and scope-creep detection.
   - `implementer`: Vertical slice TDD implementation in an isolated branch/worktree.
   - `researcher`: Primary-source technical research.
   - `codebase-architect`: Deep module and interface design.
   - `decision-explorer`: Background codebase facts and exploration.
4. **No Recursive Loops**: Subagents should focus on their atomic mandate and return findings to the parent coordinator.
