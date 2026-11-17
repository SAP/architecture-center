# Landing Page Backup — SAP TechEd 2026 (temporary anniversary page)

**Created:** 2026-11-02
**Branch at time of backup:** `dev`
**Purpose:** Preserve the SAP TechEd 2026 anniversary landing page so it can be
restored later. The original pre-TechEd page is kept separately in
[`../original-landing-page/`](../original-landing-page/).

This folder holds a verbatim snapshot of the **TechEd 2026** hero section and
the two new components it depends on, taken from the live state on `dev`.

---

## What is in this folder

| File | What it is |
| --- | --- |
| [`HeroSection.tsx`](HeroSection.tsx) | TechEd hero section (three.js dot-grid background + anniversary sticker) |
| [`HeroSection.module.css`](HeroSection.module.css) | TechEd hero styles |
| [`components/AnniversarySticker/`](components/AnniversarySticker/) | Anniversary sticker component (self-contained, only its own CSS) |
| [`components/ThreeWave/`](components/ThreeWave/) | Animated three.js dot-grid background component (+ `CONFIG.md`) |
| `README.md` | This document |

> The landing page shell, [`src/pages/index.tsx`](../../src/pages/index.tsx),
> is **not** copied here — it composes the same five sections regardless of
> which hero is live. Only the hero and its two helper components are
> TechEd-specific.

---

## Where the live files live

| Live file | Role |
| --- | --- |
| [`src/pages/index.tsx`](../../src/pages/index.tsx) | Landing page shell (unchanged) |
| [`src/sections/HeroSection.tsx`](../../src/sections/HeroSection.tsx) | TechEd hero section |
| [`src/sections/HeroSection.module.css`](../../src/sections/HeroSection.module.css) | TechEd hero styles |
| [`src/components/AnniversarySticker/`](../../src/components/AnniversarySticker/) | Anniversary sticker |
| [`src/components/ThreeWave/`](../../src/components/ThreeWave/) | Animated three.js dot-grid background |

**Dependency note:** `ThreeWave` imports `three` (`await import('three')`), so
`three` and `@types/three` must be present in
[`package.json`](../../package.json) for this hero to work. They are a matched
pair — do not restore `ThreeWave.tsx` without the `three` dependency.

---

## How to restore the TechEd 2026 landing page

From the repository root:

```bash
# 1. Restore the TechEd hero files
cp landing-page-backup/teched2026-landing-page/HeroSection.tsx        src/sections/HeroSection.tsx
cp landing-page-backup/teched2026-landing-page/HeroSection.module.css src/sections/HeroSection.module.css

# 2. Restore the two components the hero depends on
mkdir -p src/components/AnniversarySticker src/components/ThreeWave
cp landing-page-backup/teched2026-landing-page/components/AnniversarySticker/* src/components/AnniversarySticker/
cp landing-page-backup/teched2026-landing-page/components/ThreeWave/*          src/components/ThreeWave/

# 3. Ensure "three" and "@types/three" are in package.json, then:
npm install

# 4. Clear the Docusaurus cache and verify locally
npm run clear && npm start
```

Confirm the hero shows the three.js dot-grid background, the anniversary
sticker at the top, the typewriter "SAP Architecture Center" title, and the two
call-to-action buttons.
