import React, { JSX, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Title, Text } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './TrustedTecPartnersSection.module.css';
import ReactCarousel from '@site/src/components/ReactCarousel';
import Slider from 'react-slick';

const logos = [
  { 
    name: 'Nvidia',
    lightImg: 'AC_nvidia_logo_light.webp',
    darkImg: 'AC_nvidia_logo_dark.webp',
    url: 'https://www.nvidia.com'
  },
  { 
    name: 'Microsoft',
    lightImg: 'AC_microsoft_logo.webp',
    url: 'https://www.microsoft.com'
  },
  { 
    name: 'IBM',
    lightImg: 'AC_ibm_logo.webp',
    url: 'https://www.ibm.com'
  },
  { 
    name: 'Google',
    lightImg: 'AC_google_logo.webp',
    url: 'https://cloud.google.com'
  },
  { 
    name: 'Databricks',
    lightImg: 'AC_databricks_logo_light.webp',
    darkImg: 'AC_databricks_logo_dark.webp',
    url: 'https://www.databricks.com'
  },
  { 
    name: 'Amazon',
    lightImg: 'AC_amazon_logo_light.webp',
    darkImg: 'AC_amazon_logo_dark.webp',
    url: 'https://aws.amazon.com'
  }
];

export default function TrustedTecPartnersSection(): JSX.Element {
  const { colorMode } = useColorMode();
  const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);
  const sliderRef = useRef<Slider>(null);

  function renderLogo(item, idx) {
  const imgSrc = getImg(colorMode === 'dark' && item.darkImg ? item.darkImg : item.lightImg);
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => {
          if (sliderRef.current) {
            sliderRef.current.slickPause();
            const track = sliderRef.current.innerSlider?.list?.querySelector('.slick-track') as HTMLElement | null;
            if (track) {
              const computed = window.getComputedStyle(track).transform; 
              track.style.transform = computed;
              track.style.transition = 'none';
            }
          }
        }}    
        onMouseLeave={() => {
          if (sliderRef.current) {
            const track = sliderRef.current.innerSlider?.list?.querySelector('.slick-track') as HTMLElement | null;
            if (track) {
              track.style.transition = ''; // reset
            }
            sliderRef.current.slickPlay(); // resume
          }
        }}
      >
      <img
          src={imgSrc}
          alt={item.name}
          className={styles.logoImg}
      />
      </a>
    );
  }

  return (
    <section className={styles.trustedTecPartnersSection}>
      <div className={styles.innerWrapper}>
        <Title className={styles.title}>
          Trusted Technology Partners
        </Title>
        <Text className={styles.subtitle}>
          Empowering Innovation Together
        </Text>     

        <div className={styles.carouselLogo}>
          <ReactCarousel
            ref={sliderRef}
            items={[...logos, ...logos]}
            renderItem={renderLogo}
            slidesToShow={6}
            infinite={true}
            autoplay={false}
            speed={4000}
            autoplaySpeed={10}
            showHeader={false}
            pauseOnHover={false}
            cssEase="linear"
          />
        </div>
      </div>
    </section>
  );
}
