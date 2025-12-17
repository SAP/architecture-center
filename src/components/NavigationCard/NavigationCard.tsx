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
    const { user, users } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const { backendUrl, expressBackendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        expressBackendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    const resolvedLogo = colorMode === 'dark' && logoDark ? logoDark : logoLight;
    const requiredProvider = authProviders?.[link];

    // Check if user is logged in with the required provider using the users object
    const isLoggedInWithRequiredProvider = requiredProvider ? users[requiredProvider] !== null : true;
    const isLoggedInWithWrongProvider = user && requiredProvider && !isLoggedInWithRequiredProvider;
    const isLoggedOutAndProtected = !user && requiredProvider;

    const shouldShowLockIcon = alwaysShowLock || isLoggedInWithWrongProvider || isLoggedOutAndProtected;

    const handleLogin = (provider: 'btp' | 'github', destinationLink: string) => {
        const baseUrl = window.location.origin;
        const originUri = encodeURIComponent(baseUrl + destinationLink);

        if (provider === 'github') {
            window.location.href = `${expressBackendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        } else {
            window.location.href = `${backendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        }
    };

    const cardContent = (
        <Card className={styles.default} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {shouldShowLockIcon && (
                <Icon className={styles.lockIcon} name="sap-icon://locked" title="Authentication Required" />
            )}
            {!shouldShowLockIcon && requiredProvider && (
                <Icon className={styles.lockIcon} name="sap-icon://unlocked" title="Unlocked" />
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

    // Always show lock icon and handle authentication flow when needed
    if (requiredProvider) {
        if (!user || user.provider !== requiredProvider) {
            // User is either not logged in or logged in with wrong provider
            const providerDisplayName = requiredProvider === 'btp' ? 'SAP' : 'GITHUB';
            const currentProviderDisplayName = user?.provider === 'btp' ? 'SAP' : 'GITHUB';

            const tooltip = !user
                ? `Requires ${providerDisplayName} login. Click to login.`
                : `Requires ${providerDisplayName} login. You are logged in with ${currentProviderDisplayName}. Click to switch.`;

            return (
                <div
                    className={styles.cardLink}
                    title={tooltip}
                    onClick={() => handleLogin(requiredProvider, link)}
                    style={{ cursor: 'pointer' }}
                >
                    {cardContent}
                </div>
            );
        }
    }

    return (
        <Link to={link} className={styles.cardLink}>
            {cardContent}
        </Link>
    );
}
