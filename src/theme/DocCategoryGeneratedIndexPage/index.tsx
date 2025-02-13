import React, { useState } from "react";
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

const jsonSchema = require("@site/src/_scripts/_generatedIndexCategories.json");

import styles from "./styles.module.css";

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
  const category = useCurrentSidebarCategory();
  const isExplorePage = category?.customProps?.id === "explore";

  console.log("Loaded Explore Page:", isExplorePage);

  const [filters, setFilters] = useState<string[]>([]);

  const categories: { id: string; label: string }[] = jsonSchema.generatedIndexes.map(
    (cat: { customProps: { id?: string }; label: string }) => ({
      id: cat.customProps.id ?? "unknown",
      label: cat.label,
    })
  );
  console.log("Categories", categories);

  // Define grouped categories
  const partners = categories.slice(0, 3);
  const techDomains = categories.slice(-5);

  const preFilteredItems = category.items.filter((item) => {
    const categoryIndex = Array.isArray(item.customProps?.category_index)
      ? item.customProps.category_index
      : [];

    return categories.some((cat) => categoryIndex.includes(cat.id));
  });

  console.log("Pre-filtered Items", preFilteredItems);

  const filteredItems =
    isExplorePage && filters.length > 0
      ? preFilteredItems.filter((item) => {
          const categoryIndex = Array.isArray(item.customProps?.category_index)
            ? item.customProps.category_index
            : [];

          return filters.every((filter) => categoryIndex.includes(filter));
        })
      : preFilteredItems;

  const toggleFilter = (categoryId: string) => {
    setFilters((prevFilters) =>
      prevFilters.includes(categoryId)
        ? prevFilters.filter((id) => id !== categoryId)
        : [...prevFilters, categoryId]
    );
  };

  const resetFilters = () => {
    setFilters([]); // Clear all filters
  };

  const isResetDisabled = filters.length === 0;

  return (
    <div>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
  
      {/* Title should be separate from filters & cards */}
      <div className={styles.generatedIndexPageContainer}>
        <header className={styles.pageHeader}>
          <Heading as="h1" className={styles.title}>
            {categoryGeneratedIndex.title}
          </Heading>
          {categoryGeneratedIndex.description && (
            <p>{categoryGeneratedIndex.description}</p>
          )}
        </header>
  
        {/* Flexbox Layout for Filters & Cards */}
        <div className={styles.contentWrapper}>
          {isExplorePage && (
            <aside className={styles.filters}>

              {/* Partners Section */}
              <h4 className={styles.filterGroupLabel}>Partners</h4>
              {partners.map((cat) => (
                <label key={cat.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={filters.includes(cat.id)}
                    onChange={() => toggleFilter(cat.id)}
                  />
                  {cat.label}
                </label>
              ))}
              {/* Technology Domains Section */}
              <h4 className={styles.filterGroupLabel}>Technology Domains</h4>
              {techDomains.map((cat) => (
                <label key={cat.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={filters.includes(cat.id)}
                    onChange={() => toggleFilter(cat.id)}
                  />
                  {cat.label}
                </label>
              ))}
              {/* Reset Button */}
              <div className={styles.resetButtonWrapper}>
                <button className={`${styles.resetButton} ${isResetDisabled ? styles.disabled : ""}`} onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </aside>
          )}
  
          {/* Cards */}
          <main className={styles.mainContent}>
            <article className="margin-top--lg">
              <DocCardList items={filteredItems} className={styles.list} />
            </article>
            <footer className="margin-top--lg">
              <DocPaginator
                previous={categoryGeneratedIndex.navigation.previous}
                next={categoryGeneratedIndex.navigation.next}
              />
            </footer>
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
