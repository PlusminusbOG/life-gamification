# 02: Dexie.js Schema and JSON Serialization

Type: research
Status: open
Blocked by: none

## Question

What is the optimal Dexie.js (IndexedDB) schema for Activities, Time Logs, Quests, Achievements, and User Profile?
Specifically:
- What indexes are required for instant queries of totals and date ranges?
- How should the JSON import/export format and schema migrations be structured to guarantee that user data can never be corrupted, lost, or trapped across updates?
