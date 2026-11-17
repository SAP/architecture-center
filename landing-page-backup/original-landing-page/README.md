# Landing Page Backup — Original (pre-TechEd 2026)

**Created:** 2026-10-24 (README added 2026-11-02)
**Branch at time of backup:** `experimental-landing-page`
**Source commit:** `0d15015` (state just before the TechEd experiment began)
**Purpose:** Preserve the original landing page so it can be restored after the
temporary SAP TechEd 2026 anniversary page comes down. The TechEd page is kept
separately in [`../teched2026-landing-page/`](../teched2026-landing-page/).

This folder holds a verbatim snapshot of the **original** hero section (the
particles.js background, no anniversary sticker) plus the particles config it
needs to run.

---

## What is in this folder

| File | What it is |
| --- | --- |
| [`HeroSection.tsx`](HeroSection.tsx) | Original hero section (particles.js background, typewriter title, two buttons) |
| [`HeroSection.module.css`](HeroSection.module.css) | Original hero styles |
| [`static/particlesjs-config.json`](static/particlesjs-config.json) | Config for the particles.js background |
| [`utils/logger.ts`](utils/logger.ts) | Shared logger util the hero imports (`@site/src/utils/logger`) |
| `README.md` | This document |

> **Note on the background:** the original hero has no bespoke background
> component (unlike TechEd's `ThreeWave`). Its animated background is the
> `particles.js` **npm package**, loaded at runtime via
> `await import('particles.js')` and driven by `static/particlesjs-config.json`.
> So there is no local component to back up — only the config and the shared
> `logger` util. `logger.ts` is a repo-wide utility and is not removed when the
> landing page changes; it is included here only for self-containment.

> The landing page shell, [`src/pages/index.tsx`](../../src/pages/index.tsx),
> is **not** copied here — it composes the same five sections regardless of
> which hero is live. Only the hero is version-specific.

---

## Where the live files live

| Live file | Role |
| --- | --- |
| [`src/pages/index.tsx`](../../src/pages/index.tsx) | Landing page shell (unchanged) |
| [`src/sections/HeroSection.tsx`](../../src/sections/HeroSection.tsx) | Hero section |
| [`src/sections/HeroSection.module.css`](../../src/sections/HeroSection.module.css) | Hero styles |
| [`static/particlesjs-config.json`](../../static/particlesjs-config.json) | Particles background config |

**Dependency note:** the original hero imports `particles.js`
(`await import('particles.js')`), so `particles.js` must be present in
[`package.json`](../../package.json). It is currently installed (and was kept
through the TechEd experiment), so a restore normally needs no `npm install`.

---

## How to restore the original landing page

From the repository root:

```bash
# 1. Restore the original hero files
cp landing-page-backup/original-landing-page/HeroSection.tsx        src/sections/HeroSection.tsx
cp landing-page-backup/original-landing-page/HeroSection.module.css src/sections/HeroSection.module.css

# 2. Restore the particles config (only if static/particlesjs-config.json is missing)
cp landing-page-backup/original-landing-page/static/particlesjs-config.json static/particlesjs-config.json

# 3. Ensure "particles.js" is in package.json (it normally already is), then:
npm install   # only needed if the dependency was removed

# 4. Clear the Docusaurus cache and verify locally
npm run clear && npm start
```

Confirm the hero shows the particles.js background, the typewriter
"SAP Architecture Center" title, and the two call-to-action buttons — and that
the anniversary sticker is gone.

### Optional cleanup — remove the now-unused TechEd parts

`ThreeWave` imports `three` (`await import('three')`), and `three` is used by
nothing else. `AnniversarySticker` is self-contained. So the TechEd components
and the `three` dependency are a matched pair — remove them together, or not at
all:

```bash
# Remove the now-unused TechEd components
rm -rf src/components/AnniversarySticker src/components/ThreeWave

# Remove the "three" and "@types/three" lines from package.json, then:
npm install && npm run clear && npm start
```

> **Do not remove the `three` dependency while leaving `ThreeWave.tsx`.** That
> leaves a file importing a missing module — it won't fail `npm run build`
> (Docusaurus transpiles without type-checking), but it breaks IDE
> type-checking and any manual `tsc`.

### Alternative — restore straight from git history

```bash
git checkout 0d15015 -- src/sections/HeroSection.tsx src/sections/HeroSection.module.css
```
