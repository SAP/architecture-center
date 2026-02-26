import React, { JSX } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { navigationCardsData } from '../constant/constants';
import NavigationCard from '../components/NavigationCard/NavigationCard';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function HeroSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);

    const getVisibleNavigationCards = () => {
        const { authProviders } = siteConfig.customFields as {
            authProviders: Record<string, 'btp' | 'github'>;
        };

        return navigationCardsData.map((card) => {
            const requiredProvider = authProviders?.[card.link];
            let disabled = false;

            if (requiredProvider) {
                const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
                disabled = !isLoggedInWithRequiredProvider;
            } else if (card.requiresAuth) {
                const isLoggedIn = users.github || users.btp;
                disabled = !isLoggedIn;
            }

            return {
                ...card,
                disabled,
            };
        });
    };

    return (
        <section className={styles.section}>
            {/* Modern Hero Banner */}
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>SAP Architecture Center</h1>
                    <p className={styles.heroSubtitle}>
                        Empowering architects and developers with best practices, reference architectures,
                        and community-driven guidance for designing, integrating, and optimizing SAP and
                        cloud solutions.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/docs" className={styles.primaryButton}>
                            Browse Architectures
                        </Link>
                        <a href="#technology-domains" className={styles.secondaryButton}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('technology-domains')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Explore Domains
                        </a>
                    </div>
                </div>
                <div className={styles.heroImage}>
                    <div className={styles.imagePlaceholder}>
                        <p>Image Placeholder</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>1440x424 px</p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className={styles.cardsGrid}>
                {getVisibleNavigationCards().map((item, index) => (
                    <NavigationCard
                        key={index}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        link={item.link}
                        disabled={item.disabled}
                    />
                ))}
            </div>
        </section>
    );
}