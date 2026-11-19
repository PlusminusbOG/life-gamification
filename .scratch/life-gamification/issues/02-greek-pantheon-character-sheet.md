# 02: Greek pantheon progression engine and hero character sheet

**What to build:** The RPG leveling and Greek mythology progression layer. When the user logs time in any Activity, the app computes experience points and assigns an Activity Level and overall Hero Level based on the high-density power curve ($L = 1 + \lfloor h^{0.6} \times 3.0 \rfloor$). The user sees the Variant B Hero Character Sheet: an avatar in a gilded Greek frame, current Pantheon Tier (*Mortal, Hero of Hellas, Demigod, Titan of Will, Olympian, Ascendant God*), evocative Greek mythological title (e.g. "Argonaut", "Heir of Heracles"), and an animated progress bar indicating exact minutes earned and remaining until the next level.

**Blocked by:** 01: Project scaffolding, local database, and manual activity time logging

**Status:** ready-for-agent

- [ ] Pure `GreekProgressionModule` implemented according to validated prototype formula: $\text{Level} = 1 + \lfloor (\text{totalMinutes} / 60)^{0.60} \times 3.0 \rfloor$.
- [ ] Greek Pantheon tiers and mythological titles accurately map across levels 1 through 100+:
  - Mortal (1–10: Wanderer of Ithaca, Spartan Hoplite, Seeker of the Golden Fleece)
  - Hero of Hellas (11–30: Argonaut, Spartan Warrior, Slayer of the Minotaur, Hero of Troy)
  - Demigod (31–55: Chosen of the Oracle, Slayer of the Gorgon, Heir of Heracles)
  - Titan of Will (56–80: Bearer of the Heavens, Bringer of Fire, Master of Time)
  - Olympian (81–99: Guardian of Olympus, Messenger Hermes, Light of Apollo, Wisdom of Athena)
  - Ascendant God (100+: Ruler of Olympus / Zeus)
- [ ] Variant B Hero Character Sheet UI component displays avatar, Pantheon Tier, Level, Title, and total lifetime hours.
- [ ] XP Progress Bar accurately shows percentage progress, minutes earned in current level, and minutes remaining to next level.
- [ ] Automated tests verify mathematical curve boundaries, early level speed (Level 2 at ~20 min, Level 12 at 10h), and smooth tier transitions.
