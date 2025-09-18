// import React, { JSX } from 'react';
// import { Card, Icon } from '@ui5/webcomponents-react';
// import '@ui5/webcomponents-icons/dist/AllIcons';
// import styles from './NavigationCard.module.css';
// import Link from '@docusaurus/Link';
// import { useColorMode } from '@docusaurus/theme-common';

// interface CustomButtonProps {
//     title: string;
//     subtitle?: string;
//     icon?: string;
//     logoLight?: string;
//     logoDark?: string;
//     link: string;
//     disabled?: boolean;
//     requiresAuth?: boolean;
//     onMouseEnter?: () => void;
//     onMouseLeave?: () => void;
// }

// export default function NavigationCard({
//     title,
//     subtitle,
//     icon,
//     logoLight,
//     logoDark,
//     link,
//     disabled = false,
//     requiresAuth = false,
//     onMouseEnter,
//     onMouseLeave,
// }: CustomButtonProps): JSX.Element {
//     const { colorMode } = useColorMode();
//     const resolvedLogo = colorMode === 'dark' && logoDark ? logoDark : logoLight;

//     const handleClick = (e: React.MouseEvent) => {
//         if (disabled) {
//             e.preventDefault();
//             e.stopPropagation();
//         }
//     };

//     const cardContent = (
//         <Card
//             className={`${styles.default} ${disabled ? styles.disabled : ''}`}
//             onMouseEnter={disabled ? undefined : onMouseEnter}
//             onMouseLeave={disabled ? undefined : onMouseLeave}
//         >
//             {requiresAuth && disabled && (
//                 <Icon className={styles.lockIcon} name="sap-icon://locked" title="Authentication Required" />
//             )}
//             <span className={styles.inline}>
//                 {resolvedLogo ? (
//                     <img src={resolvedLogo} alt={`${title} logo`} className={styles.logo} />
//                 ) : (
//                     <Icon className={styles.icon} name={icon} />
//                 )}
//                 {subtitle ? (
//                     <div className={styles.spacing}>
//                         <div>{title}</div>
//                         <div className={styles.subtitle}>{subtitle}</div>
//                     </div>
//                 ) : (
//                     <div>{title}</div>
//                 )}
//             </span>
//         </Card>
//     );

//     if (disabled) {
//         return (
//             <div
//                 className={`${styles.cardLink} ${styles.disabledLink}`}
//                 onClick={handleClick}
//                 title={requiresAuth ? 'Authentication Required' : undefined}
//             >
//                 {cardContent}
//             </div>
//         );
//     }

//     return (
//         <Link to={link} className={styles.cardLink}>
//             {cardContent}
//         </Link>
//     );
// }

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

    const requiredProvider = authProviders[link];
    const needsLogin = requiredProvider && (!user || user.provider !== requiredProvider);

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const cardContent = (
        <Card
            className={`${styles.default} ${disabled || needsLogin ? styles.disabled : ''}`}
            onMouseEnter={disabled ? undefined : onMouseEnter}
            onMouseLeave={disabled ? undefined : onMouseLeave}
        >
            {needsLogin && (
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
            <div className={`${styles.cardLink} ${styles.disabledLink}`} onClick={handleClick}>
                {cardContent}
            </div>
        );
    }

    if (needsLogin) {
        const loginUrl = `${backendUrl}/api/auth/${requiredProvider}?redirect=${encodeURIComponent(link)}`;
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
