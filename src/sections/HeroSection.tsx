import React, { JSX, useEffect, useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { navigationCardsData } from '../constant/constants';
import NavigationCard from '../components/NavigationCard/NavigationCard';
import '@ui5/webcomponents-icons/dist/AllIcons';
import ReactCarousel from '@site/src/components/ReactCarousel';

export default function HeroSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);

    const slides = [
        {
            lightImg: 'architecture_center_hero_banner_1440x424_light.webp',
            darkImg: 'architecture_center_hero_banner_1440x424_light.webp',
            title: 'SAP Architecture Center',
            subtitle: 'Give you the tools to shape the future',
            body: 'Put AI, data, and applications to work with comprehensive architectures of SAP solutions tailored to your needs — and ready to extend as you grow.',
        },
        {
            lightImg: 'community_of_practice_hero_banner_1140x424_light.webp',
            darkImg: 'community_of_practice_hero_banner_1140x424_light.webp',
            title: 'Explore Clean Core',
            subtitle: 'Give you the tools to shape the future',
            body: 'Build side-by-side extensions while keeping the core clean.',
        },
        {
            lightImg: 'banner_example_3_light.webp',
            darkImg: 'banner_example_3_dark.webp',
            title: 'AI in SAP Landscape',
            subtitle: 'Give you the tools to shape the future',
            body: 'Discover AI-driven enterprise strategies.',
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
            <div style={{ position: 'relative' }}>
                <img
                    src={imgSrc}
                    alt={slide.title}
                    width={1440}
                    height={424}
                    style={{ objectFit: 'cover', width: '100%', height: '424px' }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'left',
                        padding: '3rem',
                    }}
                >
                    <h1>{slide.title}</h1>
                    {slide.subtitle && <h3 style={{ fontWeight: 400, marginTop: '0.5rem' }}>{slide.subtitle}</h3>}
                    <p style={{ maxWidth: '600px' }}>{slide.body}</p>
                </div>
            </div>
        );
    }

    return (
        <section
            style={{
                marginTop: '65px',
                marginBottom: '70px',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {/* Carousel */}
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
                className="heroCarousel"
                containerClassName="heroSectionCarouselContainer"
            />
            {/* Navigation Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '45px',
                    width: '100%',
                    maxWidth: '1440px',
                    marginTop: '85px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingLeft: 'var(--container-padding)',
                    paddingRight: 'var(--container-padding)',
                    boxSizing: 'border-box',
                }}
            >
                {navigationCardsData.map((item, index) => (
                    <NavigationCard
                        key={index}
                        title={item.title}
                        icon={item.icon}
                        link={item.link}
                        onMouseEnter={() => handleCardHover(index)}
                        onMouseLeave={handleCardLeave}
                    />
                ))}
            </div>
        </section>
    );
}
