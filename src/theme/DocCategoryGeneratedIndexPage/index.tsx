import React, { useState, useEffect, useRef, useMemo, useCallback, JSX } from 'react';
import { useWindowSize } from '@docusaurus/theme-common';
import { MultiValue, StylesConfig } from 'react-select';
import { PageMetadata } from '@docusaurus/theme-common';
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
// @ts-ignore
import DocVersionBanner from '@theme/DocVersionBanner';
// @ts-ignore
import DocVersionBadge from '@theme/DocVersionBadge';
// @ts-ignore
import DocCard from '@theme/DocCard';
// @ts-ignore
import Heading from '@theme/Heading';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import type { Props } from '@theme/DocCategoryGeneratedIndexPage';
import { useColorMode } from '@docusaurus/theme-common';
import ReactCarousel from '@site/src/components/ReactCarousel';
import FilterBar from '@site/src/components/FilterBar';

import jsonSchema from '@site/src/_scripts/_generatedIndexCategories.json';

import styles from './styles.module.css';
import carouselStyles from '@site/src/components/ReactCarousel/ReactCarousel.module.css';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'ui5-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                name?: string;
                interactive?: boolean;
            };
        }
    }
}

function DocCategoryGeneratedIndexPageMetadata({ categoryGeneratedIndex }: Props): JSX.Element {
    return (
        <PageMetadata
            title={categoryGeneratedIndex.title}
            description={categoryGeneratedIndex.description}
            keywords={categoryGeneratedIndex.keywords}
            image={useBaseUrl(categoryGeneratedIndex.image)}
        />
    );
}

// Memoized select styles to prevent recreation on every render
const lightSelectStyles: StylesConfig<{ value: string; label: string }, true> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: '#ccc',
        minHeight: '38px',
        boxShadow: state.isFocused ? '0 0 0 1px #ccc' : 'none',
        '&:hover': { borderColor: '#999' },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
    }),
    option: (provided, { isFocused, isSelected }) => ({
        ...provided,
        backgroundColor: isSelected 
            ? 'var(--ifm-color-primary)' 
            : isFocused 
                ? 'var(--ifm-dropdown-hover-background-color)' 
                : '#fff',
        color: isSelected ? '#fff' : 'var(--ifm-font-color-base)',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'var(--ifm-dropdown-hover-background-color)',
        border: '1px solid #ccc',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: 'var(--ifm-font-color-base)',
        fontSize: '14px',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: 'var(--ifm-font-color-base)',
        ':hover': { backgroundColor: '#ddd' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#666', fontSize: '14px' }),
    singleValue: (provided) => ({ ...provided, color: 'var(--ifm-font-color-base)' }),
    input: (provided) => ({ ...provided, color: 'var(--ifm-font-color-base)' }),
    indicatorSeparator: (provided) => ({ ...provided, backgroundColor: '#ccc' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#666', ':hover': { color: '#333' } }),
};

const darkSelectStyles: StylesConfig<{ value: string; label: string }, true> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#1e1e1e',
        borderColor: '#444',
        minHeight: '38px',
        boxShadow: state.isFocused ? '0 0 0 1px #444' : 'none',
        '&:hover': { borderColor: '#666' },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
    }),
    option: (provided, { isFocused, isSelected }) => ({
        ...provided,
        backgroundColor: isSelected 
            ? 'var(--ifm-color-primary)' 
            : isFocused 
                ? 'var(--ifm-dropdown-hover-background-color)' 
                : '#2a2a2a',
        color: isSelected ? '#fff' : 'var(--ifm-font-color-base)',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'var(--ifm-dropdown-hover-background-color)',
        border: '1px solid #444',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: 'var(--ifm-font-color-base)',
        fontSize: '14px',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: 'var(--ifm-font-color-base)',
        ':hover': { backgroundColor: '#444' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#888', fontSize: '14px' }),
    singleValue: (provided) => ({ ...provided, color: 'var(--ifm-font-color-base)' }),
    input: (provided) => ({ ...provided, color: 'var(--ifm-font-color-base)' }),
    indicatorSeparator: (provided) => ({ ...provided, backgroundColor: '#444' }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#888', ':hover': { color: '#aaa' } }),
};

function DocCategoryGeneratedIndexPageContent({ categoryGeneratedIndex }: Props): JSX.Element {
    const { colorMode } = useColorMode();
    const windowSize = useWindowSize();

    const category = useCurrentSidebarCategory();
    const isExplorePage = category?.customProps?.id === 'exploreallrefarch';
    const carouselRef = useRef<any>(null);

    // Use memoized styles to prevent recreation and reduce JS blocking
    const selectStyles = useMemo(() => 
        colorMode === 'dark' ? darkSelectStyles : lightSelectStyles, 
        [colorMode]
    );
    const [isHydrated, setIsHydrated] = useState(false);
    const [isContentLoading, setIsContentLoading] = useState(true);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const categories = useMemo(
        () =>
            jsonSchema.generatedIndexes.map((cat) => ({
                value: cat.customProps.id ?? 'unknown',
                label: cat.label,
            })),
        []
    );

    const partners = useMemo(() => categories.slice(0, 3), [categories]);
    const techDomains = useMemo(() => categories.slice(-5), [categories]);

    const [selectedPartners, setSelectedPartners] = useState<{ value: string; label: string }[]>([]);
    const [selectedTechDomains, setSelectedTechDomains] = useState<{ value: string; label: string }[]>([]);

    const resetFilters = useCallback(() => {
        setSelectedPartners([]);
        setSelectedTechDomains([]);
    }, []);

    const isResetEnabled = selectedPartners.length > 0 || selectedTechDomains.length > 0;

    const preFilteredItems = useMemo(
        () =>
            category.items.filter((item) => {
                const categoryIndex = Array.isArray(item.customProps?.category_index)
                    ? item.customProps.category_index
                    : [];

                return categories.some((cat: { value: string; label: string }) => categoryIndex.includes(cat.value));
            }),
        [category.items, categories]
    );

    const filteredItems = useMemo(() => {
        if (!isExplorePage || !isResetEnabled) {
            return preFilteredItems;
        }

        return preFilteredItems.filter((item) => {
            const categoryIndex = Array.isArray(item.customProps?.category_index)
                ? item.customProps.category_index
                : [];

            return (
                (selectedPartners.length === 0 ||
                    selectedPartners.every((partner) => categoryIndex.includes(partner.value))) &&
                (selectedTechDomains.length === 0 ||
                    selectedTechDomains.every((domain) => categoryIndex.includes(domain.value)))
            );
        });
    }, [isExplorePage, isResetEnabled, preFilteredItems, selectedPartners, selectedTechDomains]);

    const handlePartnersChange = useCallback((newValue: MultiValue<{ value: string; label: string }>) => {
        setSelectedPartners(newValue as { value: string; label: string }[]);
    }, []);

    const handleTechDomainsChange = useCallback((newValue: MultiValue<{ value: string; label: string }>) => {
        setSelectedTechDomains(newValue as { value: string; label: string }[]);
    }, []);

    // Responsive chunking logic with hydration-safe defaults
    const [chunkSize, setChunkSize] = useState(3); // SSR-safe default

    useEffect(() => {
        if (!isHydrated) return; // Only run after hydration

        const calculateChunkSize = () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth <= 996) {
                    return 1; // 1x1 grid for tablet and mobile (996px and below)
                }
            }
            return 3; // 3x1 grid for desktop (above 996px)
        };

        setChunkSize(calculateChunkSize());
    }, [windowSize, isHydrated]);

    const getChunkSize = chunkSize;

    function chunkItems(items, chunkSize) {
        const chunks = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize));
        }
        return chunks;
    }

    const groupedItems = useMemo(() => {
        return chunkItems(filteredItems, getChunkSize);
    }, [filteredItems, getChunkSize]);

    const slidesToShow = Math.min(getChunkSize === 1 ? 3 : 3, groupedItems.length);

    // Optimize carousel initialization to prevent CLS
    useEffect(() => {
        if (!isHydrated) return; // Only run after hydration
        
        if (carouselRef.current && typeof carouselRef.current.slickGoTo === 'function') {
            carouselRef.current.slickGoTo(0, false); // Use false to prevent animation during init
        }
    }, [groupedItems.length, categoryGeneratedIndex.title, isHydrated]);

    // Simplified content loading state - remove setTimeout to reduce blocking
    useEffect(() => {
        if (isHydrated && groupedItems.length > 0) {
            setIsContentLoading(false);
        }
    }, [isHydrated, groupedItems.length]);

    // Simplified skeleton loader - memoized to prevent recreation
    const skeletonContent = useMemo(() => (
        <div className={styles.skeletonContainer}>
            <div className={carouselStyles.gridContainer}>
                {Array(3).fill(null).map((_, i) => (
                    <div key={i} className={carouselStyles.gridCardContainer}>
                        <div className={styles.skeletonCard}>
                            <div className={styles.skeletonHeader}></div>
                            <div className={styles.skeletonContent}>
                                <div className={styles.skeletonLine}></div>
                                <div className={styles.skeletonLine}></div>
                                <div className={styles.skeletonLineShort}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ), []);

    return (
        <div>
            <DocVersionBanner />
            <DocBreadcrumbs />
            <DocVersionBadge />

            <div className={styles.generatedIndexPageContainer}>
                <header className={styles.pageHeader}>
                    <Heading as="h1" className={styles.title}>
                        {categoryGeneratedIndex.title}
                    </Heading>
                    {categoryGeneratedIndex.description && <p>{categoryGeneratedIndex.description}</p>}
                </header>

                <div className={styles.contentWrapper}>
                    <div className={`${styles.filterBarContainer} ${isExplorePage ? styles.filterBarContainerWithHeight : ''}`}>
                        {isExplorePage ? (
                            <FilterBar
                                techDomains={techDomains}
                                partners={partners}
                                selectedTechDomains={selectedTechDomains}
                                selectedPartners={selectedPartners}
                                onTechDomainsChange={handleTechDomainsChange}
                                onPartnersChange={handlePartnersChange}
                                resetFilters={resetFilters}
                                isResetEnabled={isResetEnabled}
                                selectStyles={selectStyles}
                            />
                        ) : null}
                    </div>

                    <main className={styles.mainContent} style={{ width: '100%' }}>
                        {isContentLoading ? (
                            skeletonContent
                        ) : (
                            <ReactCarousel
                                ref={carouselRef}
                                items={groupedItems}
                                renderItem={(group, idx) => {
                                    // For mobile (1x1), no padding needed. For desktop (3x1), pad incomplete groups
                                    const isLastGroup = idx === groupedItems.length - 1;
                                    const paddedGroup = getChunkSize === 3 && isLastGroup
                                        ? [...group, ...Array(3 - group.length).fill(null)]
                                        : group;
                                    return (
                                        <div className={carouselStyles.gridContainer}>
                                            {paddedGroup.map((item, i) => (
                                                <div key={i} className={carouselStyles.gridCardContainer}>
                                                    {item ? <DocCard item={item} /> : null}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }}
                                arrowOrientation="V"
                                vertical={true}
                                verticalSwiping={true}
                                className={carouselStyles.carouselContainer}
                                slidesToShow={slidesToShow}
                                slidesToScroll={1}
                                infinite={true}
                                arrows={false}
                                responsive={[
                                    {
                                        breakpoint: 996,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 1,
                                        },
                                    },
                                    {
                                        breakpoint: 600,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 1,
                                        },
                                    },
                                    {
                                        breakpoint: 430,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 1,
                                        },
                                    },
                                ]}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function DocCategoryGeneratedIndexPage(props: Props): JSX.Element {
    return (
        <>
            <DocCategoryGeneratedIndexPageMetadata {...props} />
            <DocCategoryGeneratedIndexPageContent {...props} />
        </>
    );
}
