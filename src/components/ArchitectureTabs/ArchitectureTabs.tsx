import React, { useState, JSX } from 'react';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './ArchitectureTabs.module.css';
import { useAuth } from '../../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface TabItem {
    title: string;
    subtitle: string;
    icon: string;
    link: string;
    disabled?: boolean;
    isNew?: boolean;
}

interface ArchitectureTabsProps {
    tabs: TabItem[];
}

export default function ArchitectureTabs({ tabs }: ArchitectureTabsProps): JSX.Element {
    const [activeIndex, setActiveIndex] = useState(0);
    const { user, users } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const { backendUrl, expressBackendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        expressBackendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    if (!tabs || tabs.length === 0) {
        return null; // Don't render if no tabs
    }

    const { title, subtitle, icon, link, disabled, isNew } = tabs[activeIndex];
    const requiredProvider = authProviders?.[link];
    const isLoggedInWithRequiredProvider = requiredProvider ? users[requiredProvider] !== null : true;
    const needsAuth = requiredProvider && !isLoggedInWithRequiredProvider;

    const handleLogin = (provider: 'btp' | 'github', destinationLink: string) => {
        const baseUrl = window.location.origin;
        const originUri = encodeURIComponent(baseUrl + destinationLink);

        if (provider === 'github') {
            window.location.href = `${expressBackendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        } else {
            window.location.href = `${backendUrl}/user/login?origin_uri=${originUri}&provider=${provider}`;
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        if (needsAuth && requiredProvider) {
            e.preventDefault();
            handleLogin(requiredProvider, link);
        }
    };

    const getProviderDisplayName = (provider: 'btp' | 'github') => {
        return provider === 'btp' ? 'SAP' : 'GITHUB';
    };

    return (
        <div className={styles.tabsContainer}>
            {/* Tab Header/Buttons */}
            <div className={styles.tabListWrapper}>
                <div className={styles.tabList} role="tablist">
                    {tabs.map((tab, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <button
                                key={index}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${index}`}
                                id={`tab-${index}`}
                                tabIndex={isActive ? 0 : -1}
                                className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                {tab.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content Panel */}
            <div
                className={styles.tabPanel}
                role="tabpanel"
                id={`panel-${activeIndex}`}
                aria-labelledby={`tab-${activeIndex}`}
            >
                {needsAuth && requiredProvider && (
                    <div className={styles.loginBadge}>
                        <ui5-icon name="locked" class={styles.lockIcon}></ui5-icon>
                        Requires {getProviderDisplayName(requiredProvider)} Login
                    </div>
                )}
                <div className={styles.contentLayout}>
                    <div className={styles.iconContainer}>
                        <ui5-icon class={styles.icon} name={icon?.replace('sap-icon://', '') || 'initiative'}></ui5-icon>
                    </div>
                    <div className={styles.textContent}>
                        <div className={styles.titleWrapper}>
                            <h3 className={styles.title}>{title}</h3>
                            {isNew && <span className={styles.newBadge}>NEW</span>}
                        </div>
                        <p className={styles.subtitle}>{subtitle}</p>
                        <div className={styles.actionWrapper}>
                            {needsAuth && requiredProvider ? (
                                <button 
                                    className={styles.actionButton} 
                                    onClick={handleButtonClick}
                                >
                                    Explore {title}
                                </button>
                            ) : (
                                <Link to={link} className={styles.actionButton}>
                                    Explore {title}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
