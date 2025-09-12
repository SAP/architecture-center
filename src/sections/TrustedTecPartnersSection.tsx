import React, { JSX } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Title, Text } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './TrustedTecPartnersSection.module.css';
import ReactCarousel from '@site/src/components/ReactCarousel';

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

    function renderLogo(item, idx) {
    const imgSrc = getImg(colorMode === 'dark' && item.darkImg ? item.darkImg : item.lightImg);
        return (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
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
            <div className={styles.container}>
                <Title className={styles.title}>
                    Trusted Technology Partners
                </Title>
                <Text className={styles.subtitle}>Empowering Innovation Together</Text>     
            </div>
            <div className={styles.carouselLogo}>
                <ReactCarousel
                    items={logos}
                    renderItem={renderLogo}
                    slidesToShow={4}
                    infinite={true}
                    autoplay={true}
                    speed={3000}
                    showHeader={false}
                    cssEase="linear" 
                    className={styles.logoCarousel}
                />
            </div>
        </section>
    );
}
