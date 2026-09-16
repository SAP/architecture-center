import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { JSX } from 'react';
import HeroSection from '../sections/HeroSection';
import FullPageSection from '../components/FullPageSection/FullPageSection';
import styles from './index.module.css';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            // @ts-expect-error - Docusaurus Layout component doesn't officially expose title prop in types, but it's supported
            title=""
            description={siteConfig.tagline}
            metadata={[
                { property: 'og:title', content: 'Welcome to the INTERNAL Architecture Center' },
                { property: 'og:description', content: siteConfig.tagline },
                { property: 'og:type', content: 'website' },
                { property: 'og:url', content: 'https://pages.github.tools.sap/OCTO/architecture-center/' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'Welcome to the INTERNAL Architecture Center' },
                { name: 'twitter:description', content: siteConfig.tagline },
            ]}
        >
            <main className={`homepage-main ${styles.fullPageContainer}`}>
                <FullPageSection showArrow={false}>
                    <HeroSection />
                </FullPageSection>
            </main>
        </Layout>
    );
}
