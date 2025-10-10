import React, { JSX, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Title, Text } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './TrustedTecPartnersSection.module.css';
import ReactCarousel from '@site/src/components/ReactCarousel';
import Slider from 'react-slick';
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
];

export default function TrustedTecPartnersSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);
    const docsUrl = useBaseUrl('/docs');
    const sliderRef = useRef<Slider>(null);
    const history = useHistory();
    const setPartners = useSidebarFilterStore((state) => state.setPartners);
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);

    function renderLogo(item, idx) {
        const imgSrc = getImg(colorMode === 'dark' && item.darkImg ? item.darkImg : item.lightImg);
        const handleClick = (e) => {
            e.preventDefault();

            if (item.filter?.partners) {
                setPartners(item.filter.partners);
            }
            if (item.filter?.techDomains) {
                setTechDomains(item.filter.techDomains);
            }

            if (item.filter) {
                // internal navigation → docs page with sidebar filters
                history.push(docsUrl);
            } else if (item.url) {
                // external navigation fallback
                window.open(item.url, '_blank', 'noopener,noreferrer');
            }
        };

        return (
            <div className={styles.logoWrapper}>
                <a
                    href={item.url}
                    onClick={handleClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => {
                        if (sliderRef.current) {
                            sliderRef.current.slickPause();
                            const track = sliderRef.current.innerSlider?.list?.querySelector(
                                '.slick-track'
                            ) as HTMLElement | null;
                            if (track) {
                                const computed = window.getComputedStyle(track).transform;
                                track.style.transform = computed;
                                track.style.transition = 'none';
                            }
                        }
                    }}
                    onMouseLeave={() => {
                        if (sliderRef.current) {
                            const track = sliderRef.current.innerSlider?.list?.querySelector(
                                '.slick-track'
                            ) as HTMLElement | null;
                            if (track) {
                                track.style.transition = ''; // reset
                            }
                            sliderRef.current.slickPlay(); // resume
                        }
                    }}
                >
                    <img src={imgSrc} alt={item.name} className={styles.logoImg} />
                </a>
            </div>
        );
    }

    return (
        <section className={styles.trustedTecPartnersSection}>
            <div className={styles.innerWrapper}>
                <Title className={styles.title}>Trusted Technology Partners</Title>
                <Text className={styles.subtitle}>Empowering Innovation Together</Text>

                <div className={styles.carouselLogo}>
                    <ReactCarousel
                        ref={sliderRef}
                        items={[...logos, ...logos]}
                        renderItem={renderLogo}
                        slidesToShow={5}
                        infinite={true}
                        autoplay={true}
                        speed={4000}
                        autoplaySpeed={10}
                        showHeader={false}
                        pauseOnHover={false}
                        cssEase="linear"
                        centerPadding="40px"
                        centerMode={true}
                        responsive={[
                            {
                                breakpoint: 1200, // e.g. iPad landscape
                                settings: { slidesToShow: 4 },
                            },
                            {
                                breakpoint: 1024, // iPad portrait
                                settings: { slidesToShow: 4 },
                            },
                            {
                                breakpoint: 768, // smaller tablets
                                settings: { slidesToShow: 3 },
                            },
                            {
                                breakpoint: 600, // mobile -> already handled by logoList
                                settings: 'unslick', // disables carousel
                            },
                        ]}
                    />
                </div>

                {/* Static vertical list (mobile) */}
                <div className={styles.logoList}>{logos.map((logo, idx) => renderLogo(logo, idx))}</div>
            </div>
        </section>
    );
}
