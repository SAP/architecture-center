import React, { JSX } from 'react';
import { Card, Icon } from '@ui5/webcomponents-react';
import styles from './NavigationCard.module.css';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common'

interface CustomButtonProps {
    title: string;
    subtitle?: string;
    icon?: string;
    logoLight?: string;
    logoDark?: string;
    link: string;
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
    onMouseEnter,
    onMouseLeave,
}: CustomButtonProps): JSX.Element {
    const { colorMode } = useColorMode();
    const resolvedLogo = colorMode === 'dark' && logoDark ? logoDark : logoLight;

    return (
        <Link to={link} className={styles.cardLink}>
            <Card className={styles.default} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
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
        </Link>
    );
}
