import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select"; // Import MultiValue
import { PageMetadata } from "@docusaurus/theme-common";
import { useCurrentSidebarCategory } from "@docusaurus/plugin-content-docs/client";
import useBaseUrl from "@docusaurus/useBaseUrl";
import DocCardList from "@theme/DocCardList";
import DocPaginator from "@theme/DocPaginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import Heading from "@theme/Heading";
import type { Props } from "@theme/DocCategoryGeneratedIndexPage";
import { useColorMode } from '@docusaurus/theme-common';

const jsonSchema = require("@site/src/_scripts/_generatedIndexCategories.json");

import styles from "./styles.module.css";
import { IoMdRefresh } from "react-icons/io";

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

function DocCategoryGeneratedIndexPageMetadata({
  categoryGeneratedIndex,
}: Props): JSX.Element {
  return (
    <PageMetadata
      title={categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

function DocCategoryGeneratedIndexPageContent({
  categoryGeneratedIndex,
}: Props): JSX.Element {
  const { colorMode } = useColorMode(); // Get current color mode
  const [isDarkMode, setIsDarkMode] = useState(colorMode === "dark");
  useEffect(() => {
    console.log(`The current theme is ${colorMode}`);
    setIsDarkMode(colorMode === "dark");
  }, [colorMode]);

  const category = useCurrentSidebarCategory();
  const isExplorePage = category?.customProps?.id === "explore";

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
      borderColor: isDarkMode ? "#444" : "#ccc",
      color: isDarkMode ? "#fff" : "#000",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? isDarkMode
          ? "#fff"
          : "#ddd"
        : isDarkMode
        ? "#2a2a2a"
        : "#fff",
      color: state.isFocused
        ? isDarkMode
          ? "#000"
          : "#000"
        : isDarkMode
        ? "#fff"
        : "#000",
    }),
  };

  const categories = jsonSchema.generatedIndexes.map((cat) => ({
    value: cat.customProps.id ?? "unknown",
    label: cat.label,
  }));

  const partners = categories.slice(0, 3);
  const techDomains = categories.slice(-5);

  const [selectedPartners, setSelectedPartners] = useState<{ value: string; label: string }[]>([]);
  const [selectedTechDomains, setSelectedTechDomains] = useState<{ value: string; label: string }[]>([]);

  const resetFilters = () => {
    setSelectedPartners([]);
    setSelectedTechDomains([]);
  };

  // Determine if the reset icon should be enabled
  const isResetEnabled = selectedPartners.length > 0 || selectedTechDomains.length > 0;

  const preFilteredItems = category.items.filter((item) => {
    const categoryIndex = Array.isArray(item.customProps?.category_index)
      ? item.customProps.category_index
      : [];

    return categories.some((cat) => categoryIndex.includes(cat.value));
  });

  const filteredItems =
    isExplorePage && isResetEnabled
      ? preFilteredItems.filter((item) => {
          const categoryIndex = Array.isArray(item.customProps?.category_index)
            ? item.customProps.category_index
            : [];

          return (
            (selectedPartners.length === 0 || selectedPartners.some((partner) => categoryIndex.includes(partner.value))) &&
            (selectedTechDomains.length === 0 || selectedTechDomains.some((domain) => categoryIndex.includes(domain.value)))
          );
        })
      : preFilteredItems;

  // Handle select changes correctly
  const handlePartnersChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    setSelectedPartners(newValue as { value: string; label: string }[]); // Type assertion
  };

  const handleTechDomainsChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    setSelectedTechDomains(newValue as { value: string; label: string }[]); // Type assertion
  };

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
          {isExplorePage && (
            <aside className={styles.filters}>
              <div className={styles.filterGroupReset}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupLabel}>Partners</h4>
                <Select
                  isMulti
                  options={partners}
                  value={selectedPartners}
                  onChange={handlePartnersChange} // Use the handler
                  placeholder="Select Partners..."
                  styles={selectStyles} 
                />
              </div>
              </div>

              <div className={styles.filterGroupReset}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupLabel}>Technology Domains</h4>
                <Select
                  isMulti
                  options={techDomains}
                  value={selectedTechDomains}
                  onChange={handleTechDomainsChange} // Use the handler
                  placeholder="Select Technology Domains..."
                  styles={selectStyles} 
                />
              </div>
              </div>

              {/* Reset Filters Icon */}
              <div className={styles.filterGroupReset}>
              <div className={styles.resetIconWrapper}>
              <IoMdRefresh 
                className={`${styles.resetIcon} ${isResetEnabled ? "" : styles.resetDisabled}`} 
                data-tip="Reset Filters" 
                onClick={isResetEnabled ? resetFilters : undefined} 
                style={{ cursor: isResetEnabled ? "pointer" : "not-allowed" }}
              />
              </div>
              </div>
            </aside>
          )}

          <main className={styles.mainContent}>
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