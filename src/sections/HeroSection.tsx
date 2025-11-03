import React, { JSX, useEffect, useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { navigationCardsData } from '../constant/constants';
import NavigationCard from '../components/NavigationCard/NavigationCard';
import '@ui5/webcomponents-icons/dist/AllIcons';
import ReactCarousel from '@site/src/components/ReactCarousel';
import styles from './HeroSection.module.css';
import { Icon } from '@ui5/webcomponents-react';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function HeroSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);

    const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);

    const getVisibleNavigationCards = () => {
        const { authProviders } = siteConfig.customFields as {
            authProviders: Record<string, 'btp' | 'github'>;
        };

        return navigationCardsData.map((card) => {
            const requiredProvider = authProviders?.[card.link];
            let disabled = false;

            if (requiredProvider) {
                // Check if user is logged in with the required provider
                const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
                disabled = !isLoggedInWithRequiredProvider;
            } else if (card.requiresAuth) {
                // Fallback to general auth requirement (either provider)
                const isLoggedIn = users.github || users.btp;
                disabled = !isLoggedIn;
            }

            return {
                ...card,
                disabled,
            };
        });
    };

    const slides = [
        {
            lightImg: 'architecture_center_hero_banner_1440x424_light.webp',
            darkImg: 'architecture_center_hero_banner_1440x424_light.webp',
            title: 'SAP Architecture Center',
            subtitle: '',
            body: 'Put AI, data, and applications to work with SAP’s comprehensive solution architectures. They are designed to address your business needs today and built to scale, adapt, and extend seamlessly as your organization grows.',
        },
        {
            lightImg: 'architecture_validator_hero_banner_1140x424_light.webp',
            darkImg: 'architecture_validator_hero_banner_1140x424_light.webp',
            title: 'Architecture Validator',
            subtitle: '',
            body: 'Ensure your solution diagrams follow a consistent framework with rules developed by our architects, maintaining quality, improving collaboration, and aligning technical accuracy with business needs.',
        },
        {
            lightImg: 'community_of_practice_hero_banner_1140x424_light.webp',
            darkImg: 'community_of_practice_hero_banner_1140x424_light.webp',
            title: 'Community of Practice',
            subtitle: '',
            body: 'Our mission is to create a common, collaborative, environment where all SAP experts can co-create, maintain, and enhance reference architectures for every flavor of SAP cloud, on-premises, and partner implementation.',
        },
        {
            lightImg: 'solution_diagram_guidelines_hero_banner_1140x424_light.webp',
            darkImg: 'solution_diagram_guidelines_hero_banner_1140x424_light.webp',
            title: 'Solution Diagram Guidelines',
            subtitle: '',
            body: 'The single source of truth for architects provides the latest updates, best practices, and ready-to-use templates to help you create clear, consistent, and high-quality diagrams of architectural landscapes.',
        },
        {
            lightImg: 'whats_new_hero_banner_1140x424_light.webp',
            darkImg: 'whats_new_hero_banner_1140x424_light.webp',
            title: "What's New",
            subtitle: '',
            body: 'Stay informed about the latest features and releases from our platform. Discover new tools, capabilities, and enhancements that empower you to design, build, and run smarter, more scalable, and future-ready solutions.',
        },
    ];

    const carouselRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isHoveringCard, setIsHoveringCard] = useState(false);

    // When selectedIndex changes, move carousel to the corresponding banner
    useEffect(() => {
        if (carouselRef.current && typeof carouselRef.current.slickGoTo === 'function') {
            carouselRef.current.slickGoTo(selectedIndex);
        }
    }, [selectedIndex]);

    // Pause / play logic using carousel methods
    useEffect(() => {
        if (carouselRef.current && typeof carouselRef.current.innerSlider !== 'undefined') {
            if (isHoveringCard) {
                // Pause autoplay on hover
                carouselRef.current.slickPause();
            } else {
                // Resume autoplay when hover ends
                carouselRef.current.slickPlay();
            }
        }
    }, [isHoveringCard]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            handleResize();

            window.addEventListener('resize', handleResize);

            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const handleCardHover = (index) => {
        setSelectedIndex(index);
        setIsHoveringCard(true);
    };

    const handleCardLeave = () => {
        setIsHoveringCard(false);
    };

    function renderHeroSlide(slide, index) {
        const imgSrc = getImg(colorMode === 'dark' ? slide.darkImg : slide.lightImg);
        return (
            <div className={styles.heroSlide}>
                <img src={imgSrc} alt={slide.title} width={1440} height={424} />
                <div className={styles.heroSlideOverlay}>
                    <h1>{slide.title}</h1>
                    {slide.subtitle && <h3 className={styles.heroSlideSubtitle}>{slide.subtitle}</h3>}
                    <p className={styles.heroSlideBody}>{slide.body}</p>
                </div>
            </div>
        );
    }

    return (
        <section className={styles.section}>
            {/* Carousel */}
            <div className={styles.heroCarousel}>
                <ReactCarousel
                    ref={carouselRef}
                    items={slides}
                    renderItem={renderHeroSlide}
                    slidesToShow={1}
                    dots={true}
                    infinite={true}
                    autoplay={true}
                    autoplaySpeed={5000}
                    showHeader={false}
                    fade={true}
                />
            </div>
            {/* Navigation Cards */}
            <div className={styles.cardsGrid}>
                {getVisibleNavigationCards().map((item, index) => {
                    const isSmallScreen = windowWidth && windowWidth < 1380;
                    const isExcludedCard = item.title === 'Architecture Validator' || item.title === 'Quick Start';

                    if (isSmallScreen && isExcludedCard) {
                        return null;
                    }

                    return (
                        <NavigationCard
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            link={item.link}
                            disabled={item.disabled}
                            onMouseEnter={() => handleCardHover(index)}
                            onMouseLeave={handleCardLeave}
                        />
                    );
                })}
            </div>
        </section>
    );
}
