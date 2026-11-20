# 08: Celebratory micro-interactions, confetti, and Web Audio effects

**What to build:** An audio-visual celebration feedback system rewarding milestones and quest completions. Completing a quest or leveling up triggers a vibrant gold-themed confetti explosion via `canvas-confetti` and plays an elegant synthesized sound effect via Web Audio API (zero external sound files needed, 100% offline, zero latency). A sound toggle button in the header allows users to mute/unmute audio effects with state persisted locally.

**Blocked by:** 07: GitHub-style Activity Heatmap Calendar

**Status:** resolved

- [x] Synthesized Web Audio API sound generator implemented with harmonic chimes for quest completion and triumphant fanfare for level-up.
- [x] Gold-tinted confetti burst triggered upon quest completion and level advancement.
- [x] Sound toggle button in header with mute/unmute state remembered across sessions.
- [x] Graceful fallback for browsers or autoplay policy blocking audio.
- [x] Automated tests verify sound generator seam, mute state persistence, and level-up transition detection.
