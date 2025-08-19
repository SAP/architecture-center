import React, { JSX, useEffect, useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { navigationCardsData } from '../constant/constants';
import NavigationCard from '../components/NavigationCard/NavigationCard';
import '@ui5/webcomponents-icons/dist/AllIcons';
import ReactCarousel from '@site/src/components/ReactCarousel';
import styles from './HeroSection.module.css';

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
    }
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
      <div className={styles.heroSlide}>
        <img
          src={imgSrc}
          alt={slide.title}
          width={1440}
          height={424}
        />
        <div className={styles.heroSlideOverlay}>
          <h1>{slide.title}</h1>
          {slide.subtitle && (
            <h3 className={styles.heroSlideSubtitle}>{slide.subtitle}</h3>
          )}
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
