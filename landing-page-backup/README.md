# Landing Page Backup — Original (pre-TechEd 2026)

**Created:** 2026-10-24
**Branch at time of backup:** `experimental-landing-page`
**Purpose:** Preserve the original landing page so it can be restored after the
temporary SAP TechEd 2026 anniversary landing page comes down (planned to be
live for roughly one week).

This folder holds a verbatim snapshot of the **original** hero section, taken
from git commit `0d15015` (the state just before the TechEd experiment began).
These are the files to put back when the temporary page is retired.

The temporary TechEd page itself is **not** copied here — it lives on the
`experimental-landing-page` branch and in the commits listed below. If that
branch is ever deleted, the "Prompt to recreate" section further down rebuilds
it from the original.

---

## What is in this folder

| File | What it is |
| --- | --- |
| [`original-landing-page/HeroSection.tsx`](original-landing-page/HeroSection.tsx) | Original hero section (particles.js background, no anniversary sticker) |
| [`original-landing-page/HeroSection.module.css`](original-landing-page/HeroSection.module.css) | Original hero styles |
| `README.md` | This document |

> The landing page page shell, [`src/pages/index.tsx`](../src/pages/index.tsx),
> was **not** changed by the experiment — it still composes the same five
> sections. Only the hero section was swapped visually, so only the hero files
> need to be restored.

---

## Where the live files live

| Live file | Role |
| --- | --- |
| [`src/pages/index.tsx`](../src/pages/index.tsx) | Landing page shell (unchanged) |
| [`src/sections/HeroSection.tsx`](../src/sections/HeroSection.tsx) | Hero section — **modified** for TechEd |
| [`src/sections/HeroSection.module.css`](../src/sections/HeroSection.module.css) | Hero styles — **modified** for TechEd |
| [`src/components/AnniversarySticker/`](../src/components/AnniversarySticker/) | New — TechEd anniversary sticker |
| [`src/components/ThreeWave/`](../src/components/ThreeWave/) | New — animated three.js dot-grid background |
| [`static/particlesjs-config.json`](../static/particlesjs-config.json) | Config for the **original** particles background (still present) |

---

## What was changed for SAP TechEd 2026 (the temporary page)

The experiment lives on the `experimental-landing-page` branch. The hero
section was the only visual change:

1. **Replaced the particles.js background with a three.js animated dot-grid**
   (`ThreeWave`). The original full-screen `.particlesContainer` was replaced in
   CSS by a dark gradient `.background` plus a masked `.canvasWrapper` holding
   the three.js canvas, faded into the lower third of the viewport.
2. **Added an anniversary sticker** (`AnniversarySticker`) rendered at the top
   of the hero wrapper.
3. **Hero spacing tweak** — `.heroContainer` padding changed from `0 24px` to
   `10vh 24px 0`.
4. **Imports changed** in `HeroSection.tsx`: dropped `useRef`, `useBaseUrl`, and
   `logger` (particles plumbing); added `BrowserOnly` and `AnniversarySticker`,
   with `ThreeWave` loaded client-side via `require` inside `BrowserOnly`.
5. **Dependencies added** in [`package.json`](../package.json): `three` and
   `@types/three`. (`particles.js` was intentionally **kept**, so the original
   page still works.)

Relevant commits on `experimental-landing-page`:

- `59d0a23` feat: add three.js, @types/three, and katex dependencies
- `1bd8859` feat: add ThreeWave animated 3D dot-grid component
- `7c97907` feat: add AnniversarySticker component for SAP TechEd 2026
- `cdc2693` docs: add configuration reference for ThreeWave component
- `01f97a3` chore: remove unused katex dev dependency
- `f68231d` fix(ui): adjust hero section spacing and sticker position

---

## Prompt to recreate the TechEd 2026 landing page

If you ever want to rebuild the temporary anniversary page from the original,
this prompt captures what was done:

> Modify the landing page hero (`src/sections/HeroSection.tsx` and its
> `HeroSection.module.css`) for the SAP TechEd 2026 anniversary. Replace the
> particles.js background with an animated three.js dot-grid rendered by a new
> `src/components/ThreeWave/ThreeWave.tsx` component — a fixed full-viewport
> canvas, masked with a linear gradient so it fades in over the lower third of
> the screen, sitting on top of a dark diagonal gradient background
> (`#06061c → #100525 → #180420`). Load `ThreeWave` client-side only via
> Docusaurus `BrowserOnly` + `require`. Add a new
> `src/components/AnniversarySticker/AnniversarySticker.tsx` sticker at the top
> of the hero. Nudge the hero content down with `10vh` top padding on
> `.heroContainer`. Add `three` and `@types/three` to `package.json`. Keep the
> existing typewriter title, subtitle, and the two call-to-action buttons
> unchanged. See `src/components/ThreeWave/CONFIG.md` for the dot-grid
> configuration options.

---

## How to revert to the original landing page

Do this when the temporary TechEd page is retired.

### Option A — restore from this backup folder (simplest)

From the repository root:

```bash
# 1. Restore the original hero files (this is all that is required)
cp landing-page-backup/original-landing-page/HeroSection.tsx     src/sections/HeroSection.tsx
cp landing-page-backup/original-landing-page/HeroSection.module.css src/sections/HeroSection.module.css

# 2. Clear the Docusaurus cache and verify locally
npm run clear
npm start
```

Step 1 is all you need — the original page works even if the TechEd components
and the `three` dependency stay in the tree, because nothing imports them
anymore (they just become dead code that is never bundled).

#### Optional cleanup — remove both parts together, or neither

`ThreeWave` imports `three` (`await import('three')`), and `three` is used by
**nothing else** in the codebase. `AnniversarySticker` is self-contained (only
its own CSS). So the components and the dependency are a matched pair:

> **Do not remove the `three` dependency while leaving `ThreeWave.tsx`.** That
> leaves a file importing a missing module — it won't fail `npm run build`
> (Docusaurus transpiles without type-checking), but it will break IDE
> type-checking and any manual `tsc`, and leaves the tree in a confusing state.

If you want to clean up, remove the components **and** the dependencies
together:

```bash
# Remove the now-unused TechEd components
rm -rf src/components/AnniversarySticker src/components/ThreeWave

# Remove the "three" and "@types/three" lines from package.json, then:
npm install

npm run clear && npm start
```

### Option B — restore straight from git history

```bash
# Restore the original hero files from the pre-experiment commit
git checkout 0d15015 -- src/sections/HeroSection.tsx src/sections/HeroSection.module.css
```

### After restoring

- `particles.js` is still installed and `static/particlesjs-config.json` is
  present, so the original animated background renders with no further changes.
- Confirm the hero shows the particles background, the typewriter
  "SAP Architecture Center" title, and the two buttons — and that the anniversary
  sticker is gone.
- Run `npm run clear && npm start` and check the homepage in the browser.
