import React, { JSX } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { techDomain } from '../constant/constants';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { FaBrain, FaCode, FaDatabase, FaNetworkWired, FaShieldAlt } from 'react-icons/fa';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import styles from './TechnologyDomainSection.module.css';

const iconMap: Record<string, JSX.Element> = {
    'ai': <FaBrain />,
    'appdev': <FaCode />,
    'data': <FaDatabase />,
    'integration': <FaNetworkWired />,
    'opsec': <FaShieldAlt />,
};

interface DomainCardProps {
    domain: {
        id: string;
        title: string;
        icon: string;
    };
}

function DomainCard({ domain }: DomainCardProps): JSX.Element {
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);
    const docsUrl = useBaseUrl('/docs');
    const isHighlighted = domain.id === 'ai' || domain.id === 'data';

    const handleClick = () => {
        setTechDomains([domain.id]);
    };

    return (
        <Link
            to={`${docsUrl}?techDomains=${domain.id}`}
            className={`${styles.domainCard} ${isHighlighted ? styles.highlighted : ''}`}
            onClick={handleClick}
        >
            <div className={styles.domainIcon}>
                {iconMap[domain.id] || <FaCode />}
            </div>
            <h3 className={styles.domainTitle}>{domain.title}</h3>
            <p className={styles.domainDescription}>
                Explore architectures and best practices for {domain.title.toLowerCase()}
            </p>
            <span className={styles.viewLink}>View Architectures →</span>
        </Link>
    );
}

export default function TechnologyDomainSection(): JSX.Element {
    return (
        <section id="technology-domains" className={styles.domainSection}>
            <div className={styles.container}>
                <Title level="H1" className={styles.title}>
                    Technology Domains
                </Title>
                <Text className={styles.subtitle}>Explore architectures for different technology domains</Text>

                <div className={styles.domainsGrid}>
                    {techDomain.map((domain) => (
                        <DomainCard key={domain.id} domain={domain} />
                    ))}
                </div>
            </div>
        </section>
    );
}
