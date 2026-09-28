# xun's studio

Personal site of Xun Wang — a scroll story told through one white model:
Design → Build → City → Evaluate → Reconstruct → Embody, then an index of works.

Next.js (App Router, static export) · React Three Fiber · Drei · GSAP ScrollTrigger · Lenis.

Handoff plan for the asset-based rebuild (Chinese): [`docs/HANDOFF.md`](docs/HANDOFF.md).

## Develop

```bash
npm install
npm run dev          # http://localhost:3000 → /en
npm run build        # static export to ./out
npm start            # serve ./out on :3000
npm run lint && npm run typecheck
```

Useful query flags on the home page: `?q=high|mid|low` (render tier), `?motion=reduce`
(reduced-motion path), `?capture` (frozen clock for scripted capture).

## Structure

```
app/[lang]/                 /en and /zh (static params); home, works, works/[slug], about
app/(root)/page.tsx         "/" → saved language or /en
content/i18n/{en,zh}.json   every UI string, keyed identically
content/works/<slug>/index.{en,zh}.mdx   one folder per project (missing language falls back)
lib/scroll/                 ScrollBus + driver (Lenis → ScrollTrigger → bus, once per frame)
lib/director/               story cursor → scene state (camera keys, stages, scale jump, HUD)
components/three/           Canvas, lights, materials, room, site (canopy, robot, city), index stage
components/home/            DOM titles, HUD, index section
scripts/capture.mjs         deterministic headless capture (screenshots / video frames)
```

### One scroll source, one frame

Lenis runs without its own rAF. While the Canvas is mounted, R3F's `addEffect` calls
`tick()` → `lenis.raf()` → `ScrollTrigger.update` → `bus` snapshot → `derive()` (scene
state) → DOM listeners (titles, HUD). R3F then renders the WebGL frame from the same
snapshot, so DOM and WebGL never drift by a frame. Act ranges come from ScrollTrigger
measurements of the spacer sections, so resize/refresh is handled by GSAP.

### Adding a work

Create `content/works/<slug>/index.en.mdx` (and optionally `index.zh.mdx`):

```yaml
---
title: DeepArch
year: Ongoing
category: evaluate   # design | build | city | evaluate | reconstruct | embody
role: Lead & creator
featured: true       # appears in the home index
order: 2
---
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes `out/` to GitHub Pages on every push
to `master`. In the repository settings, set **Pages → Source** to **GitHub Actions**.

All data and analysis visuals on the site are illustrative.
