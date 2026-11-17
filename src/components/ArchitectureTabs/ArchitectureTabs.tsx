import React, { useState, useRef, useEffect, useId, JSX, ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Icon } from '@ui5/webcomponents-react';
import styles from './ArchitectureTabs.module.css';
import { useAuth } from '../../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface TabItem {
    title: string;
    tabLabel?: string;
    subtitle: string | ReactNode;
    icon: string;
    link: string;
    disabled?: boolean;
    isNew?: boolean;
    image?: string;
}

interface ArchitectureTabsProps {
    tabs: TabItem[];
    enableScrollActivation?: boolean;
    scrollActiveIndex?: number;
    onManualTabChange?: () => void;
}

export default function ArchitectureTabs({
    tabs,
    enableScrollActivation = false,
    scrollActiveIndex,
    onManualTabChange,
}: ArchitectureTabsProps): JSX.Element | null {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isVertical, setIsVertical] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const scrollTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tabTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tabGroupId = `architecture-tabs-${useId().replace(/:/g, '')}`;
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const { backendUrl, expressBackendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        expressBackendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    // Determine the effective active index
    // Use scrollActiveIndex if scroll activation is enabled, otherwise use internal state
    const effectiveActiveIndex =
        enableScrollActivation && scrollActiveIndex !== undefined ? scrollActiveIndex : activeIndex;

    // Sync internal state when scroll-controlled index changes
    useEffect(() => {
        if (enableScrollActivation && scrollActiveIndex !== undefined && scrollActiveIndex !== activeIndex) {
            setIsTransitioning(true);
            scrollTransitionTimeoutRef.current = setTimeout(() => {
                setActiveIndex(scrollActiveIndex);
                setIsTransitioning(false);
                scrollTransitionTimeoutRef.current = null;
            }, 150);
        }

        return () => {
            if (scrollTransitionTimeoutRef.current) {
                clearTimeout(scrollTransitionTimeoutRef.current);
                scrollTransitionTimeoutRef.current = null;
            }
        };
    }, [enableScrollActivation, scrollActiveIndex, activeIndex]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 700px)');
        const updateOrientation = () => setIsVertical(mediaQuery.matches);

        updateOrientation();
        mediaQuery.addEventListener('change', updateOrientation);
        return () => mediaQuery.removeEventListener('change', updateOrientation);
    }, []);

    useEffect(() => {
        return () => {
            if (tabTransitionTimeoutRef.current) {
                clearTimeout(tabTransitionTimeoutRef.current);
            }
        };
    }, []);

    // Move useEffect BEFORE any conditional returns (React hooks rule)
    useEffect(() => {
        if (!tabs || tabs.length === 0) return;

        const updateIndicator = () => {
            const activeTab = tabRefs.current[effectiveActiveIndex];
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
    }, [effectiveActiveIndex, tabs]);

    // Get image URL - must be called before conditional return (React hooks rule)
    const activeTab = tabs?.[effectiveActiveIndex];
    const imageUrl = useBaseUrl(activeTab?.image || '');

    // Early return AFTER all hooks
    if (!tabs || tabs.length === 0) {
        return null;
    }

    const { title, subtitle, icon, link, isNew, image } = tabs[effectiveActiveIndex];
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

    const handleTabChange = (newIndex: number, activateImmediately = false) => {
        if (newIndex === effectiveActiveIndex || (!activateImmediately && isTransitioning)) return;

        // Notify parent that user manually selected a tab
        if (onManualTabChange) {
            onManualTabChange();
        }

        // Keyboard selection follows focus immediately, as expected for an
        // automatically activated tab list. Pointer selection keeps the
        // existing visual transition.
        if (activateImmediately) {
            if (tabTransitionTimeoutRef.current) {
                clearTimeout(tabTransitionTimeoutRef.current);
                tabTransitionTimeoutRef.current = null;
            }
            if (scrollTransitionTimeoutRef.current) {
                clearTimeout(scrollTransitionTimeoutRef.current);
                scrollTransitionTimeoutRef.current = null;
            }
            setIsTransitioning(false);
            setActiveIndex(newIndex);
            return;
        }

        setIsTransitioning(true);
        tabTransitionTimeoutRef.current = setTimeout(() => {
            setActiveIndex(newIndex);
            setIsTransitioning(false);
            tabTransitionTimeoutRef.current = null;
        }, 200);
    };

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        let nextIndex: number | undefined;

        switch (event.key) {
            case 'ArrowLeft':
                if (isVertical) return;
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                break;
            case 'ArrowRight':
                if (isVertical) return;
                nextIndex = (currentIndex + 1) % tabs.length;
                break;
            case 'ArrowUp':
                if (!isVertical) return;
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                break;
            case 'ArrowDown':
                if (!isVertical) return;
                nextIndex = (currentIndex + 1) % tabs.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        tabRefs.current[nextIndex]?.focus();
        handleTabChange(nextIndex, true);
    };

    const subtitleTitle = typeof subtitle === 'string' && subtitle.length > 310 ? subtitle : undefined;
    const renderedSubtitle =
        typeof subtitle === 'string' && subtitle.length > 310
            ? `${subtitle.slice(0, 310).trimEnd()}…`
            : subtitle;

    return (
        <div className={styles.tabsContainer}>
            {/* Tab Header/Buttons */}
            <div className={styles.tabListWrapper}>
                <div
                    className={styles.tabList}
                    role="tablist"
                    aria-label="Architecture Center features"
                    aria-orientation={isVertical ? 'vertical' : 'horizontal'}
                >
                    <div
                        className={styles.slidingBackground}
                        aria-hidden="true"
                        style={{
                            transform: `translateX(${indicatorStyle.left}px)`,
                            width: `${indicatorStyle.width}px`,
                        }}
                    />
                    {tabs.map((tab, index) => {
                        const isActive = index === effectiveActiveIndex;
                        return (
                            <button
                                key={index}
                                type="button"
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`${tabGroupId}-panel`}
                                id={`${tabGroupId}-tab-${index}`}
                                tabIndex={isActive ? 0 : -1}
                                className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                                onClick={() => handleTabChange(index)}
                                onKeyDown={(event) => handleTabKeyDown(event, index)}
                            >
                                {tab.tabLabel || tab.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content Panel */}
            <div
                className={`${styles.tabPanel} ${isTransitioning ? styles.fadeOut : ''}`}
                role="tabpanel"
                id={`${tabGroupId}-panel`}
                aria-labelledby={`${tabGroupId}-tab-${effectiveActiveIndex}`}
            >
                {needsAuth && requiredProvider && (
                    <div className={styles.loginBadge}>
                        <Icon name="locked" className={styles.lockIcon} />
                        Requires {getProviderDisplayName(requiredProvider)} Login
                    </div>
                )}
                {!needsAuth && requiredProvider && isLoggedInWithRequiredProvider && (
                    <div className={styles.authenticatedBadge}>
                        <Icon name="unlocked" className={styles.lockIcon} />
                        Authenticated with {getProviderDisplayName(requiredProvider)}
                    </div>
                )}
                <div className={styles.contentLayout}>
                    <div className={styles.topRow}>
                        <div className={styles.iconContainer}>
                            <Icon
                                className={styles.icon}
                                name={icon?.replace('sap-icon://', '') || 'initiative'}
                            />
                        </div>
                        <div className={styles.titleWrapper}>
                            <h3 className={styles.title}>{title}</h3>
                            {isNew && <span className={styles.newBadge}>NEW</span>}
                        </div>
                    </div>
                    
                    <div className={styles.mainContent}>
                        <div className={styles.leftContent}>
                            <p
                                className={styles.subtitle}
                                title={subtitleTitle}
                            >
                                {renderedSubtitle}
                            </p>
                            <div className={styles.actionWrapper}>
                                {needsAuth && requiredProvider ? (
                                    <button
                                        type="button"
                                        className={styles.actionButton}
                                        onClick={handleButtonClick}
                                    >
                                        {title === 'Quick Start' || title === 'Architecture Validator' ? 'Launch' : 'Explore'} {title}
                                    </button>
                                ) : (
                                    <Link to={link} className={styles.actionButton}>
                                        {title === 'Latest Article'
                                            ? 'Read Latest Article'
                                            : title === 'Quick Start' || title === 'Architecture Validator'
                                                ? `Launch ${title}`
                                                : `Explore ${title}`}
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className={styles.imagePlaceholder}>
                            {image ? (
                                <img
                                    src={imageUrl}
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
