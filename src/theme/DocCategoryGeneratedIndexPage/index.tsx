import React, { useState, useEffect, useMemo, useCallback, JSX } from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { Title } from '@ui5/webcomponents-react';
import { PageMetadata } from '@docusaurus/theme-common';
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import type { Props } from '@theme/DocCategoryGeneratedIndexPage';
import { useColorMode } from '@docusaurus/theme-common';

import jsonSchema from '@site/src/_scripts/_generatedIndexCategories.json';

import styles from './styles.module.css';
import { IoMdRefresh } from 'react-icons/io';

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

    const [selectStyles, setSelectStyles] = useState<StylesConfig<{ value: string; label: string }, true>>();

    useEffect(() => {
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
                    {isExplorePage &&
                        selectStyles && ( // switch from Select's default style to ours causes visual flash, prevent this
                            <aside className={styles.filters}>
                                <div className={styles.filterRow}>
                                    <div className={styles.filterGroup}>
                                        <Title style={{ marginBottom: 6 }}>Technology Domains</Title>
                                        <Select
                                            isMulti
                                            options={techDomains}
                                            value={selectedTechDomains}
                                            onChange={handleTechDomainsChange}
                                            placeholder="Select Technology Domains..."
                                            styles={selectStyles}
                                        />
                                    </div>

                                    <div className={styles.filterGroup}>
                                        <Title style={{ marginBottom: 6 }}>Technology Partners</Title>
                                        <Select
                                            isMulti
                                            options={partners}
                                            value={selectedPartners}
                                            onChange={handlePartnersChange}
                                            placeholder="Select Technology Partners..."
                                            styles={selectStyles}
                                        />
                                    </div>

                                    <div className={styles.resetIconWrapper}>
                                        <IoMdRefresh
                                            className={`${styles.resetIcon} ${isResetEnabled ? '' : styles.resetDisabled}`}
                                            data-tip="Reset Filters"
                                            onClick={isResetEnabled ? resetFilters : undefined}
                                            style={{ cursor: isResetEnabled ? 'pointer' : 'not-allowed' }}
                                        />
                                    </div>
                                </div>
                            </aside>
                        )}

                    <main className={styles.mainContent} style={{ width: '100%' }}>
                        <DocCardList items={filteredItems} className={styles.list} />
                        <DocPaginator
                            previous={categoryGeneratedIndex.navigation.previous}
                            next={categoryGeneratedIndex.navigation.next}
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
