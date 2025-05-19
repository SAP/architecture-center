import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { JSX } from 'react';
import HeroSection from '../sections/HeroSection';
import CommunitySection from '../sections/Community';
import ExploreArchitectureSection from '../sections/ExploreArchitectureSection';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title='Create reference architectures'
            description={siteConfig.tagline}
            metadata={[
                { property: 'og:title', content: 'Create reference architectures' },
                { property: 'og:description', content: siteConfig.tagline },
                { property: 'og:type', content: 'website' },
                { property: 'og:url', content: 'https://architecture.learning.sap.com/' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'Create reference architectures' },
                { name: 'twitter:description', content: siteConfig.tagline },
            ]}
        >
            <main>
                <HeroSection />
                <ExploreArchitectureSection />
                <CommunitySection />
            </main>
        </Layout>
    );
}
