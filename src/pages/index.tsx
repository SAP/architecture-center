import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';
import React, { JSX } from 'react';
import HeroSection from '../sections/HeroSection';
import CommunitySection from '../sections/Community';
import ExploreArchitectureSection from '../sections/ExploreArchitectureSection';
// import GuidanceFrameworkSection from '../sections/GuidanceFrameworkSection';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="header_text">
                    {siteConfig.title}
                </Heading>
                <ThemedImage
                    alt="SAP Architecture Center"
                    sources={{
                        light: useBaseUrl('img/btp-Spot-Tools.png'),
                        dark: useBaseUrl('img/btp-Spot-Tools.png'),
                    }}
                />
                <p className="hero_body">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" color="blue" to="/docs/intro">
                        Start now 🚀
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={`${siteConfig.title}`} description="Description will go into a meta tag in <head />">
            <main>
                <HeroSection />
                <ExploreArchitectureSection />
                <CommunitySection />
                {/* <GuidanceFrameworkSection /> */}
            </main>
        </Layout>
    );
}
