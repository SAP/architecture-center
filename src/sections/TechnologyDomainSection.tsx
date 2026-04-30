import React, { JSX } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { techDomain } from '../constant/constants';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { FaBrain, FaCode, FaDatabase, FaNetworkWired, FaShieldAlt } from 'react-icons/fa';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import { useColorMode } from '@docusaurus/theme-common';
import { useHistory } from '@docusaurus/router';
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
    onNavigationStart: () => void;
}

function DomainCard({ domain, onNavigationStart }: DomainCardProps): JSX.Element {
    const docsUrl = useBaseUrl('/docs/ref-arch');
    const isHighlighted = domain.id === 'ai' || domain.id === 'data';

    const handlePointerDown = () => {
        onNavigationStart();
    };

    return (
        <Link
            to={`${docsUrl}?expanded=${domain.id}`}
            className={`${styles.domainCard} ${isHighlighted ? styles.highlighted : ''}`}
            onPointerDown={handlePointerDown}
        >
            <div className={styles.domainIcon}>
                {iconMap[domain.id] || <FaCode />}
            </div>
            <h3 className={styles.domainTitle}>{domain.title}</h3>
            <p className={styles.domainDescription}>
                Explore architectures and best practices for {domain.title.toLowerCase()}
            </p>
            <span className={styles.viewLink}>
                <span className={styles.viewLinkText}>View Architectures</span>
                <span className={styles.viewLinkArrow}>→</span>
            </span>
        </Link>
    );
}

interface LogoItem {
    name: string;
    lightImg: string;
    darkImg?: string;
    filter?: {
        partners?: string[];
        techDomains?: string[];
    };
}

const logos: LogoItem[] = [
    {
        name: 'NVIDIA',
        lightImg: 'AC_nvidia_logo_light.webp',
        darkImg: 'AC_nvidia_logo_dark.webp',
        filter: { partners: ['nvidia'] },
    },
    {
        name: 'Microsoft',
        lightImg: 'AC_microsoft_logo.webp',
        filter: { partners: ['azure'] },
    },
    {
        name: 'IBM',
        lightImg: 'AC_ibm_logo.webp',
        filter: { partners: ['ibm'] },
    },
    {
        name: 'Google',
        lightImg: 'AC_google_logo.webp',
        filter: { partners: ['gcp'] },
    },
    {
        name: 'Databricks',
        lightImg: 'AC_databricks_logo_light.webp',
        darkImg: 'AC_databricks_logo_dark.webp',
        filter: { partners: ['databricks'] },
    },
    {
        name: 'Amazon',
        lightImg: 'AC_amazon_logo_light.webp',
        darkImg: 'AC_amazon_logo_dark.webp',
        filter: { partners: ['aws'] },
    },
    {
        name: 'Snowflake',
        lightImg: 'AC_snowflake_logo_light.webp',
        darkImg: 'AC_snowflake_logo_dark.webp',
        filter: { partners: ['snowflake'] },
    },
];

export default function TechnologyDomainSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const docsUrl = useBaseUrl('/docs/ref-arch');
    const imgBaseUrl = useBaseUrl('/img/landingPage/');
    const history = useHistory();
    const setPartners = useSidebarFilterStore((state) => state.setPartners);
    const [isNavigating, setIsNavigating] = React.useState(false);

    // Disable scroll-snap when navigating to prevent interference
    React.useEffect(() => {
        if (isNavigating) {
            const originalHtmlSnap = document.documentElement.style.scrollSnapType;
            const originalBodySnap = document.body.style.scrollSnapType;

            document.documentElement.style.scrollSnapType = 'none';
            document.body.style.scrollSnapType = 'none';

            const timer = setTimeout(() => {
                document.documentElement.style.scrollSnapType = originalHtmlSnap;
                document.body.style.scrollSnapType = originalBodySnap;
                setIsNavigating(false);
            }, 300);

            return () => {
                clearTimeout(timer);
                document.documentElement.style.scrollSnapType = originalHtmlSnap;
                document.body.style.scrollSnapType = originalBodySnap;
            };
        }
    }, [isNavigating]);

    // Helper function to get image URL with baseUrl
    const getImg = (name: string) => `${imgBaseUrl}${name}`;

    function renderLogo(item: LogoItem, idx: number, isDuplicate = false) {
        const imgSrc = colorMode === 'dark' && item.darkImg ? getImg(item.darkImg) : getImg(item.lightImg);
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            const partners = item.filter?.partners ?? [];

            // Set the global store - only partners filter now
            if (partners.length) setPartners(partners);

            // Build query string - only partners
            const params = new URLSearchParams();
            if (partners.length) params.set('partners', partners.join(','));

            history.push(`${docsUrl}?${params.toString()}`);
        };

        return (
            <div key={`logo-${idx}-${isDuplicate ? 'dup' : 'orig'}`} className={styles.logoWrapper}>
                <a
                    href="#"
                    onClick={handleClick}
                >
                    <img src={imgSrc} alt={item.name} className={styles.logoImg} />
                </a>
            </div>
        );
    }

    return (
        <section id="technology-domains" className={styles.domainSection}>
            <div className={styles.container}>
                <Title level="H1" className={styles.title}>
                    Technology Domains
                </Title>
                <Text className={styles.subtitle}>Explore architectures for different technology domains</Text>

                <div className={styles.domainsGrid}>
                    {techDomain.map((domain) => (
                        <DomainCard
                            key={domain.id}
                            domain={domain}
                            onNavigationStart={() => setIsNavigating(true)}
                        />
                    ))}
                </div>

                {/* Trusted Technology Partners Section */}
                <div className={styles.partnersContainer}>
                    <Text className={styles.partnersTitle}>Innovating with trusted technology partners</Text>

                    <div className={styles.carouselLogo}>
                        <div className={styles.carouselTrack}>
                            {/* Render logos three times for seamless infinite scroll */}
                            {logos.map((logo, idx) => renderLogo(logo, idx, false))}
                            {logos.map((logo, idx) => renderLogo(logo, idx, true))}
                            {logos.map((logo, idx) => renderLogo(logo, idx + 100, true))}
                        </div>
                    </div>

                    {/* Static vertical list (mobile) */}
                    <div className={styles.logoList}>{logos.map((logo, idx) => renderLogo(logo, idx))}</div>
                </div>
            </div>
        </section>
    );
}