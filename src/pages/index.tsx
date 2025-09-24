import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { JSX, useEffect } from 'react';
import HeroSection from '../sections/HeroSection';
import DomainSection from '../sections/TechnologyDomainSection';
import AdditionalResSection from '../sections/AdditionalResSection';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://71ab10dc.eu12.sapdas-staging.cloud.sap/resources/public/webclient/bootstrap.js'; // Replace with actual URL
        script.setAttribute('data-bot-name', 'architecture_validation'); // Replace with your bot name
        script.setAttribute('data-expander-type', 'DEFAULT');
        script.setAttribute(
            'data-expander-preferences',
            'JTdCJTIyb25ib2FyZGluZ01lc3NhZ2UlMjIlM0ElMjJDb21lJTIwc3BlYWslMjB0byUyMG1lJTIxJTIyJTJDJTIyZXhwYW5kZXJUaXRsZSUyMiUzQSUyMiUyMiUyQyUyMmV4cGFuZGVyTG9nbyUyMiUzQSUyMkNVWF9BdmF0YXIuc3ZnJTIyJTJDJTIydGhlbWUlMjIlM0ElMjJzYXBfaG9yaXpvbiUyMiU3RA=='
        );
        document.body.appendChild(script);
    }, []);
    return (
        <Layout
            // @ts-expect-error
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
            <main>
                <HeroSection />
                <DomainSection />
                <AdditionalResSection />
            </main>
        </Layout>
    );
}
