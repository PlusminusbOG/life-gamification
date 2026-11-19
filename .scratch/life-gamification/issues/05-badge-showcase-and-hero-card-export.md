# 05: Featured badge showcase and exportable hero card generator

**What to build:** The social pride and milestone export feature. A user can open the "Export Hero Card" modal, view their unlocked achievements, and manually select up to 5 favorite badges to showcase on their personalized Hero Card. The preview updates in real time, rendering an epic card in the Greek Pantheon color palette featuring their name, Greek tier, level, total lifetime hours, primary activity, and pinned badge icons. Clicking "Download Image" generates and downloads a high-resolution 1200x630 Retina PNG image for sharing or archiving.

**Blocked by:** 04: Declarative achievement engine and temple of achievements

**Status:** ready-for-agent

- [ ] Interactive Badge Showcase modal allows selecting up to 5 unlocked achievements to pin to the card.
- [ ] UI enforces maximum 5 badge selection limit with user feedback.
- [ ] Real-time card preview updates dynamically as badges are checked or unchecked.
- [ ] High-resolution PNG image generation (1200x630 Retina) implemented via HTML5 Canvas / `html-to-image`.
- [ ] One-click download button triggers instant image file download named `hero-card-<timestamp>.png`.
- [ ] Automated tests verify badge selection capping (max 5) and correct rendering payload generation.
