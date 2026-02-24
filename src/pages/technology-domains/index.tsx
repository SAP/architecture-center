import React, { JSX } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { techDomain } from '@site/src/constant/constants';
import { Icon } from '@ui5/webcomponents-react';
import styles from './styles.module.css';

interface DomainCardProps {
    domain: {
        id: string;
        title: string;
        icon: string;
    };
}

function DomainCard({ domain }: DomainCardProps): JSX.Element {
    return (
        <Link to={`/docs?techDomains=${domain.id}`} className={styles.domainCard}>
            <div className={styles.domainIcon}>
                <Icon name={domain.icon} />
            </div>
            <h2 className={styles.domainTitle}>{domain.title}</h2>
            <p className={styles.domainDescription}>
                Explore architectures and best practices for {domain.title.toLowerCase()}
            </p>
            <span className={styles.viewLink}>View Architectures →</span>
        </Link>
    );
}

export default function TechnologyDomainsPage(): JSX.Element {
    return (
        <Layout>
            <main className={styles.mainContainer}>
                <div className={styles.heroSection}>
                    <h1 className={styles.pageTitle}>Technology Domains</h1>
                    <p className={styles.pageSubtitle}>
                        Discover reference architectures organized by technology domain. Each domain showcases
                        best practices, patterns, and solutions for specific technology areas.
                    </p>
                </div>

                <div className={styles.domainsGrid}>
                    {techDomain.map((domain) => (
                        <DomainCard key={domain.id} domain={domain} />
                    ))}
                </div>

                <div className={styles.ctaSection}>
                    <h2>Looking for something specific?</h2>
                    <p>Browse all architectures or use filters to find exactly what you need</p>
                    <Link to="/docs" className={styles.ctaButton}>
                        Browse All Architectures
                    </Link>
                </div>
            </main>
        </Layout>
    );
}