import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { JSX } from 'react';
import HeroSection from '../sections/HeroSection';
import ArchitectureTabsSection from '../sections/ArchitectureTabsSection';
import TechnologyDomainSection from '../sections/TechnologyDomainSection';
import NewsSection from '../sections/NewsSection';
import AdditionalResSection from '../sections/AdditionalResSection';
import FullPageSection from '../components/FullPageSection/FullPageSection';
import styles from './index.module.css';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            // @ts-expect-error - Docusaurus Layout component doesn't officially expose title prop in types, but it's supported
            title="Welcome"
            description={siteConfig.tagline}
            metadata={[
                { property: 'og:title', content: 'Welcome' },
                { property: 'og:description', content: siteConfig.tagline },
                { property: 'og:type', content: 'website' },
                { property: 'og:url', content: 'https://architecture.learning.sap.com/' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'Welcome' },
                { name: 'twitter:description', content: siteConfig.tagline },
            ]}
        >
            <main className={`homepage-main ${styles.fullPageContainer}`}>
                <FullPageSection>
                    <HeroSection />
                </FullPageSection>
                <FullPageSection>
                    <ArchitectureTabsSection />
                </FullPageSection>
                <FullPageSection>
                    <NewsSection />
                </FullPageSection>
                <FullPageSection>
                    <TechnologyDomainSection />
                </FullPageSection>
                <FullPageSection showArrow={false} isLast>
                    <AdditionalResSection />
                </FullPageSection>
            </main>
        </Layout>
    );
}
