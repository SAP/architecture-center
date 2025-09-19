import React, { JSX } from 'react';
import { Card, Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './NavigationCard.module.css';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface CustomButtonProps {
    title: string;
    subtitle?: string;
    icon?: string;
    logoLight?: string;
    logoDark?: string;
    link: string;
    disabled?: boolean;
    alwaysShowLock?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export default function NavigationCard({
    title,
    subtitle,
    icon,
    logoLight,
    logoDark,
    link,
    disabled = false,
    alwaysShowLock = false,
    onMouseEnter,
    onMouseLeave,
}: CustomButtonProps): JSX.Element {
    const { colorMode } = useColorMode();
    const { user } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const { backendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    const resolvedLogo = colorMode === 'dark' && logoDark ? logoDark : logoLight;
    const requiredProvider = authProviders?.[link];

    const isLoggedInWithWrongProvider = user && requiredProvider && user.provider !== requiredProvider;
    const isLoggedOutAndProtected = !user && requiredProvider;

    const shouldAppearDisabled = alwaysShowLock || isLoggedInWithWrongProvider;
    const isFunctionallyDisabled = disabled || isLoggedInWithWrongProvider;

    const cardContent = (
        <Card
            className={`${styles.default} ${shouldAppearDisabled ? styles.disabled : ''}`}
            onMouseEnter={isFunctionallyDisabled ? undefined : onMouseEnter}
            onMouseLeave={isFunctionallyDisabled ? undefined : onMouseLeave}
        >
            {shouldAppearDisabled && (
                <Icon className={styles.lockIcon} name="sap-icon://locked" title="Authentication Required" />
            )}
            <span className={styles.inline}>
                {resolvedLogo ? (
                    <img src={resolvedLogo} alt={`${title} logo`} className={styles.logo} />
                ) : (
                    <Icon className={styles.icon} name={icon} />
                )}
                {subtitle ? (
                    <div className={styles.spacing}>
                        <div>{title}</div>
                        <div className={styles.subtitle}>{subtitle}</div>
                    </div>
                ) : (
                    <div>{title}</div>
                )}
            </span>
        </Card>
    );

    if (isFunctionallyDisabled) {
        const tooltip = isLoggedInWithWrongProvider
            ? `Requires ${requiredProvider.toUpperCase()} login. You are logged in with ${user.provider.toUpperCase()}.`
            : 'This feature is currently disabled.';

        return (
            <div className={`${styles.cardLink} ${styles.disabledLink}`} title={tooltip}>
                {cardContent}
            </div>
        );
    }

    if (isLoggedOutAndProtected) {
        const loginUrl = `${backendUrl}/user/login?origin_uri=${encodeURIComponent(link)}&provider=${requiredProvider}`;
        return (
            <a href={loginUrl} className={styles.cardLink}>
                {cardContent}
            </a>
        );
    }

    return (
        <Link to={link} className={styles.cardLink}>
            {cardContent}
        </Link>
    );
}
