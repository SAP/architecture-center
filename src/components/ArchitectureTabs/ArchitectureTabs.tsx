import React, { useState, useRef, useEffect, JSX } from 'react';
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
    image?: string;
}

interface ArchitectureTabsProps {
    tabs: TabItem[];
}

export default function ArchitectureTabs({ tabs }: ArchitectureTabsProps): JSX.Element | null {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const { backendUrl, expressBackendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        expressBackendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    // Move useEffect BEFORE any conditional returns (React hooks rule)
    useEffect(() => {
        if (!tabs || tabs.length === 0) return;

        const updateIndicator = () => {
            const activeTab = tabRefs.current[activeIndex];
            if (activeTab) {
                const tabList = activeTab.parentElement;
                if (tabList) {
                    const tabListRect = tabList.getBoundingClientRect();
                    const activeTabRect = activeTab.getBoundingClientRect();
                    setIndicatorStyle({
                        left: activeTabRect.left - tabListRect.left - 6,
                        width: activeTabRect.width,
                    });
                }
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeIndex, tabs]);

    // Early return AFTER all hooks
    if (!tabs || tabs.length === 0) {
        return null;
    }

    const { title, subtitle, icon, link, isNew, image } = tabs[activeIndex];
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
        return provider === 'btp' ? 'SAP' : 'GitHub';
    };

    const handleTabChange = (newIndex: number) => {
        if (newIndex === activeIndex || isTransitioning) return;

        setIsTransitioning(true);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 200);
    };

    return (
        <div className={styles.tabsContainer}>
            {/* Tab Header/Buttons */}
            <div className={styles.tabListWrapper}>
                <div className={styles.tabList} role="tablist">
                    <div
                        className={styles.slidingBackground}
                        style={{
                            transform: `translateX(${indicatorStyle.left}px)`,
                            width: `${indicatorStyle.width}px`,
                        }}
                    />
                    {tabs.map((tab, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <button
                                key={index}
                                ref={(el) => (tabRefs.current[index] = el)}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${index}`}
                                id={`tab-${index}`}
                                tabIndex={isActive ? 0 : -1}
                                className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                onClick={() => handleTabChange(index)}
                            >
                                {tab.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content Panel */}
            <div
                className={`${styles.tabPanel} ${isTransitioning ? styles.fadeOut : ''}`}
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
                {!needsAuth && requiredProvider && isLoggedInWithRequiredProvider && (
                    <div className={styles.authenticatedBadge}>
                        <ui5-icon name="unlocked" class={styles.lockIcon}></ui5-icon>
                        Authenticated with {getProviderDisplayName(requiredProvider)}
                    </div>
                )}
                <div className={styles.contentLayout}>
                    <div className={styles.topRow}>
                        <div className={styles.iconContainer}>
                            <ui5-icon class={styles.icon} name={icon?.replace('sap-icon://', '') || 'initiative'}></ui5-icon>
                        </div>
                        <div className={styles.titleWrapper}>
                            <h3 className={styles.title}>{title}</h3>
                            {isNew && <span className={styles.newBadge}>NEW</span>}
                        </div>
                    </div>
                    
                    <div className={styles.mainContent}>
                        <div className={styles.leftContent}>
                            <p className={styles.subtitle}>{subtitle}</p>
                            <div className={styles.actionWrapper}>
                                {needsAuth && requiredProvider ? (
                                    <button 
                                        className={styles.actionButton} 
                                        onClick={handleButtonClick}
                                    >
                                        {title === 'Quick Start' || title === 'Architecture Validator' ? 'Launch' : 'Explore'} {title}
                                    </button>
                                ) : (
                                    <Link to={link} className={styles.actionButton}>
                                        {title === 'Quick Start' || title === 'Architecture Validator' ? 'Launch' : 'Explore'} {title}
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className={styles.imagePlaceholder}>
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className={styles.tabImage}
                                />
                            ) : (
                                <>
                                    <p>Image Placeholder</p>
                                    <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>4:3 Aspect Ratio</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
