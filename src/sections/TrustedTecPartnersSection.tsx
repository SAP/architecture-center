import React, { JSX } from 'react';
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
    url: 'https://www.nvidia.com'
  },
  { 
    name: 'Microsoft',
    lightImg: 'AC_microsoft_logo.webp',
    filter: { partners: ['azure'] }
  },
  { 
    name: 'IBM',
    lightImg: 'AC_ibm_logo.webp',
    url: 'https://www.ibm.com'
  },
  { 
    name: 'Google',
    lightImg: 'AC_google_logo.webp',
    filter: { partners: ['gcp'] }
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
    filter: { partners: ['aws'] }
  }
];

export default function TrustedTecPartnersSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);
    const history = useHistory();
    const setPartners = useSidebarFilterStore((state: any) => state.setPartners);
    const setTechDomains = useSidebarFilterStore((state: any) => state.setTechDomains);

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
        history.push('/docs');
      } else if (item.url) {
        // external navigation fallback
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div className={styles.logoWrapper} key={idx}>
        <a href={item.url} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        <img
            src={imgSrc}
            alt={item.name}
            className={styles.logoImg}
        />
        </a>
      </div>
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
          <div className={styles.logoScroller}>
            {/* First set of logos */}
            {logos.map((logo, idx) => renderLogo(logo, idx))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo, idx) => renderLogo(logo, idx + logos.length))}
          </div>
        </div>

        {/* Static vertical list (mobile) */}
        <div className={styles.logoList}>
          {logos.map((logo, idx) => renderLogo(logo, idx))}
        </div>
      </div>
    </section>
  );
}
