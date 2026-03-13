import React, { JSX, useRef, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Title, Text } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './TrustedTecPartnersSection.module.css';
import { useHistory } from '@docusaurus/router';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';

const logos = [
    {
        name: 'NVIDIA',
        lightImg: 'AC_nvidia_logo_light.webp',
        darkImg: 'AC_nvidia_logo_dark.webp',
        filter: { partners: ['nvidia'] },
    },
    {
        name: 'Microsoft',
        lightImg: 'AC_microsoft_logo.webp',
        filter: { partners: ['azure'] },
    },
    {
        name: 'IBM',
        lightImg: 'AC_ibm_logo.webp',
        filter: { partners: ['ibm'] },
    },
    {
        name: 'Google',
        lightImg: 'AC_google_logo.webp',
        filter: { partners: ['gcp'] },
    },
    {
        name: 'Databricks',
        lightImg: 'AC_databricks_logo_light.webp',
        darkImg: 'AC_databricks_logo_dark.webp',
        filter: { partners: ['databricks'] },
    },
    {
        name: 'Amazon',
        lightImg: 'AC_amazon_logo_light.webp',
        darkImg: 'AC_amazon_logo_dark.webp',
        filter: { partners: ['aws'] },
    },
    {
        name: 'Snowflake',
        lightImg: 'AC_snowflake_logo_light.webp',
        darkImg: 'AC_snowflake_logo_dark.webp',
        filter: { partners: ['snowflake'] },
    },
];

export default function TrustedTecPartnersSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);
    const docsUrl = useBaseUrl('/docs');
    const trackRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const setPartners = useSidebarFilterStore((state) => state.setPartners);
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);

    function renderLogo(item, idx, isDuplicate = false) {
        const imgSrc = getImg(colorMode === 'dark' && item.darkImg ? item.darkImg : item.lightImg);
        const handleClick = (e) => {
            e.preventDefault();

            const partners = item.filter?.partners ?? [];
            const techDomains = item.filter?.techDomains ?? [];

            // Set the global store
            if (partners.length) setPartners(partners);
            if (techDomains.length) setTechDomains(techDomains);

            // Build query string
            const params = new URLSearchParams();
            if (partners.length) params.set('partners', partners.join(','));
            if (techDomains.length) params.set('techDomains', techDomains.join(','));

            history.push(`${docsUrl}?${params.toString()}`);
        };

        return (
            <div key={`logo-${idx}-${isDuplicate ? 'dup' : 'orig'}`} className={styles.logoWrapper}>
                <a
                    href={item.url}
                    onClick={handleClick}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={imgSrc} alt={item.name} className={styles.logoImg} />
                </a>
            </div>
        );
    }

    // Smooth infinite scroll animation using CSS
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let animationId: number;
        let isPaused = false;
        
        // Pause on hover
        const handleMouseEnter = () => {
            isPaused = true;
            track.style.animationPlayState = 'paused';
        };

        const handleMouseLeave = () => {
            isPaused = false;
            track.style.animationPlayState = 'running';
        };

        track.addEventListener('mouseenter', handleMouseEnter);
        track.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            track.removeEventListener('mouseenter', handleMouseEnter);
            track.removeEventListener('mouseleave', handleMouseLeave);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <section className={styles.trustedTecPartnersSection}>
            <div className={styles.innerWrapper}>
                <Title className={styles.title}>Trusted Technology Partners</Title>
                <Text className={styles.subtitle}>Empowering Innovation Together</Text>

                <div className={styles.carouselLogo}>
                    <div className={styles.carouselTrack} ref={trackRef}>
                        {/* Render logos three times for seamless infinite scroll */}
                        {logos.map((logo, idx) => renderLogo(logo, idx, false))}
                        {logos.map((logo, idx) => renderLogo(logo, idx, true))}
                        {logos.map((logo, idx) => renderLogo(logo, idx + 100, true))}
                    </div>
                </div>

                {/* Static vertical list (mobile) */}
                <div className={styles.logoList}>{logos.map((logo, idx) => renderLogo(logo, idx))}</div>
            </div>
        </section>
    );
}