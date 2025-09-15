import React, { JSX } from 'react';
import { Card, Icon } from '@ui5/webcomponents-react';
import styles from './NavigationCard.module.css';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';

interface CustomButtonProps {
    title: string;
    subtitle?: string;
    icon?: string;
    logoLight?: string;
    logoDark?: string;
    link: string;
    disabled?: boolean;
    requiresAuth?: boolean;
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
    requiresAuth = false,
    onMouseEnter,
    onMouseLeave,
}: CustomButtonProps): JSX.Element {
    const { colorMode } = useColorMode();
    const resolvedLogo = colorMode === 'dark' && logoDark ? logoDark : logoLight;

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const cardContent = (
        <Card
            className={`${styles.default} ${disabled ? styles.disabled : ''}`}
            onMouseEnter={disabled ? undefined : onMouseEnter}
            onMouseLeave={disabled ? undefined : onMouseLeave}
        >
            {requiresAuth && disabled && (
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

    if (disabled) {
        return (
            <div
                className={`${styles.cardLink} ${styles.disabledLink}`}
                onClick={handleClick}
                title={requiresAuth ? 'Authentication Required' : undefined}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link to={link} className={styles.cardLink}>
            {cardContent}
        </Link>
    );
}
