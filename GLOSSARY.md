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

**Activity**:
A distinct life pursuit or subject of study (e.g., Reading, Running, Coding) to which time is logged. Accumulates total hours that never decrease.
_Avoid_: Category, subject, habit

**Time Log**:
A record of a completed session of an Activity, containing duration (minutes/hours), timestamp, and optional notes.
_Avoid_: Session, punch, check-in

**Skill**:
An RPG-style capability attribute (e.g., Intellect, Endurance) tied to one or more Activities, having a calculated Level and XP derived from accumulated hours.
_Avoid_: Stat, perk, proficiency

**Achievement**:
A permanent badge awarded for reaching specific milestones (e.g., total hours, first completed task, skill level). Strictly cumulative with no degradation or expiration.
_Avoid_: Trophy, reward, badge, award

**Quest**:
An actionable To-Do item with completion criteria, optional due date, and an optional link to an Activity/Skill to reward progress upon completion.
_Avoid_: Task, todo, chore

**Pantheon Tier**:
A Greek mythology-themed status bracket (Mortal, Hero, Demigod, Titan, Olympian, Ascendant God) reflecting high-level mastery based on cumulative levels and hours.
_Avoid_: Rank, league, division
