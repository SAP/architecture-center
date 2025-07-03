import React, { useState, useEffect, useRef, useMemo, useCallback, JSX } from 'react';
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

function getSelectStyles(isDarkMode: boolean): StylesConfig<{ value: string; label: string }, true> {
    return {
        control: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
            borderColor: isDarkMode ? '#444' : '#ccc',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }),
        option: (provided, { isFocused }) => ({
            ...provided,
            backgroundColor: isFocused ? 'var(--ifm-dropdown-hover-background-color)' : isDarkMode ? '#2a2a2a' : '#fff',
            ':active': {
                backgroundColor: 'var(--ifm-dropdown-hover-background-color)',
            },
            color: 'var(--ifm-font-color-base)',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: 'var(--ifm-dropdown-hover-background-color)',
            color: 'var(--ifm-font-color-base)', // targets color of cross to remove a selection
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'var(--ifm-font-color-base)',
        }),
    };
}

function DocCategoryGeneratedIndexPageContent({ categoryGeneratedIndex }: Props): JSX.Element {
    const { colorMode } = useColorMode();

    const category = useCurrentSidebarCategory();
    const isExplorePage = category?.customProps?.id === 'exploreallrefarch';
    const carouselRef = useRef<any>(null);

    const [isHydrated, setIsHydrated] = useState(false);
    const [selectStyles, setSelectStyles] = useState<StylesConfig<{ value: string; label: string }, true>>(
        getSelectStyles(false) // SSR-safe default (light mode)
    );

    useEffect(() => {
        setIsHydrated(true);
        setSelectStyles(getSelectStyles(colorMode === 'dark'));
    }, [colorMode]);

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

    function chunkItems(items, chunkSize) {
        const chunks = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize));
        }
        return chunks;
    }
    const groupedItems = chunkItems(filteredItems, 3); // 3 = 3x1 row

    useEffect(() => {
         if (carouselRef.current && typeof carouselRef.current.slickGoTo === 'function') {
            carouselRef.current.slickGoTo(0, true); // Go to first slide, don't animate
        }
        window.dispatchEvent(new Event('resize'));
    }, [groupedItems.length, categoryGeneratedIndex.title]);

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
                    {isExplorePage && isHydrated && selectStyles && (
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
                    )}

                    <main className={styles.mainContent} style={{ width: '100%' }}>
                        <ReactCarousel
                            ref={carouselRef}
                            items={groupedItems}
                            renderItem={(group, idx) => {
                                const isLastGroup = idx === groupedItems.length - 1;
                                const paddedGroup = isLastGroup
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
                            showHeader={true}
                            vertical={true}
                            verticalSwiping={true}
                            className={carouselStyles.carouselContainer}
                            slidesToShow={Math.min(3, groupedItems.length)}
                            slidesToScroll={1}
                            infinite={true}
                            arrows={false}
                            responsive={[
                                {
                                    breakpoint: 996,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1,
                                    },
                                },
                            ]}
                        />
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
