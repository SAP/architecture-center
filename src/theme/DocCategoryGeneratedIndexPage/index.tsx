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

  // Filter items based on selected categories (only if on "explore" page)
  const filteredItems =
  isExplorePage && filters.length > 0
    ? category.items.filter((item) => {
        const categoryIndex = Array.isArray(item.customProps?.category_index)
          ? item.customProps.category_index
          : [];

        return filters.some((filter) => categoryIndex.includes(filter));
      })
    : category.items;

  console.log("Filters", filters);
  console.log("Filtered items", filteredItems);

  // Handle checkbox toggle
  const toggleFilter = (categoryId: string) => {
    setFilters((prevFilters) =>
      prevFilters.includes(categoryId)
        ? prevFilters.filter((id) => id !== categoryId)
        : [...prevFilters, categoryId]
    );
  };

  return (
    <div>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <div className={styles.generatedIndexPageContainer}>
        <div className={styles.contentWrapper}>
          {isExplorePage && (
          <aside className={styles.filters}>
            <h3>Filter by Category:</h3>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={filters.includes(cat.id)}
                  onChange={() => toggleFilter(cat.id)}
                />
                {cat.label}
              </label>
            ))}
          </aside>
        )}

        <main className={styles.mainContent}>
          <header>
            <Heading as="h1" className={styles.title}>
              {categoryGeneratedIndex.title}
            </Heading>
            {categoryGeneratedIndex.description && (
              <p>{categoryGeneratedIndex.description}</p>
            )}
          </header>
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
