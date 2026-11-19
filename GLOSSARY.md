# Project Domain Glossary

This document defines the ubiquitous domain language for this project. All issues, specifications, commit messages, types, functions, and tests should strictly adhere to these definitions.

## Language

**Spec**:
A specification document outlining requirements, boundaries, edge cases, and acceptance criteria for a feature or refactoring effort.
_Avoid_: Requirement doc, proposal, plan

**Tracer Bullet**:
A complete end-to-end vertical slice of functionality through all architectural layers that establishes a working baseline.
_Avoid_: Prototype, spike, scaffold

**Seam**:
A clean boundary between modules where behavior can be varied or intercepted without editing the module itself.
_Avoid_: Hook, interface point, abstraction

**Frontier**:
The set of ready, unblocked tickets in a task dependency graph that can be implemented concurrently.
_Avoid_: Backlog, active tasks, queue
