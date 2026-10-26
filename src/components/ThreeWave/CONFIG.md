# ThreeWave animation configuration

Tunable parameters for the `ThreeWave` component (`ThreeWave.tsx`). Most are
hardcoded constants today and can be lifted into props if runtime control is
needed. Line numbers are approximate and may drift as the file changes.

## Grid / layout

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| `COLS` x `ROWS` | top of file | 32 x 32 (1024 spheres) | Density of the field. Higher means denser but more GPU cost, since color and matrix are updated per sphere per frame. |
| `SPACING` | top of file | 2.4 | Gap between spheres. Larger means sparser, wider field. |

## Wave motion

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| `WAVE` | top of file | 3.8 | Vertical amplitude of the base wave. Also the color normalization range. |
| Wave frequency | tick loop, `i*0.38`, `j*0.38` | 0.38 | Spatial tightness. Higher means more ripples across the grid. |
| Wave speed | tick loop, `t*1.1`, `t*0.9` | 1.1 / 0.9 | How fast the wave animates. |

## Mouse ripple

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| Falloff | tick loop, `-dist*0.045` | 0.045 | How far the cursor influence reaches. Smaller means wider. |
| Ring spacing | tick loop, `dist*0.55` | 0.55 | Spacing of the concentric ripples. |
| Ripple speed | tick loop, `-t*3.5` | 3.5 | How fast rings radiate out. |
| Ripple height | tick loop, `*2.2` | 2.2 | Strength of the cursor bump. |

## Colors

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| `C_A` / `C_B` / `C_C` | palette block | blue / violet / magenta | Gradient stops: top, mid, bottom. |
| Lightness jitter | jitter block, `*0.08` | plus or minus 0.04 | Per-sphere brightness variation for texture. |

Color is driven by height: blue at the wave peaks, magenta at the troughs,
through violet in between.

## Glow / spheres

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| Core size | core geometry | 0.17 radius | Size of the bright dots. |
| Halo size | halo geometry | 0.50 radius | Size of the glow sphere. |
| Halo opacity | halo material | 0.07 | Glow intensity. This is the main "too strong / too faint" knob. |

## Camera

| Param | Location | Current | Effect |
|-------|----------|---------|--------|
| FOV | camera setup | 55 | Perspective strength. |
| Position | camera setup | (0, 18, 50) | Viewing height and distance, which sets the tilt of the field. |
| Drift | tick loop, `sin(t*0.035)*10` | speed 0.035, range plus or minus 10 | Slow lateral sway that gives the 3D feel. |

## Page-side settings (not in the component)

These live in the hero that hosts the animation,
`src/sections/HeroSection.module.css`:

- Mask / fade position: `.canvasWrapper` mask-image, controls the lower-third fade.
- Background gradient: `.background`.
