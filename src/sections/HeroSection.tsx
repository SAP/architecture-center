import React, { JSX } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import HeroSectionAurora from './HeroSectionAurora';
import HeroSectionParticles from './HeroSectionParticles';

/**
 * The landing-page hero is theme-specific:
 *  - dark theme  → the CSS aurora-blob + parallax-dot background (HeroSectionAurora)
 *  - light theme → the original particles.js background (HeroSectionParticles)
 *
 * The site default is dark (docusaurus.config colorMode.defaultMode), so SSR and
 * the first client render both produce the aurora hero — no hydration mismatch.
 * Visitors with light stored get the particles hero after mount. Toggling the
 * theme unmounts one hero and mounts the other; each cleans up its own effects.
 */
export default function HeroSection(): JSX.Element {
    const { colorMode } = useColorMode();
    return colorMode === 'light' ? <HeroSectionParticles /> : <HeroSectionAurora />;
}
