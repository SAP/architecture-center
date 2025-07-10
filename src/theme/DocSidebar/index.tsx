import React, { useState, useMemo, type ReactNode } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type { WrapperProps } from '@docusaurus/types';
import type { PropSidebarItem } from '@docusaurus/plugin-content-docs';

import jsonSchema from '@site/src/_scripts/_generatedIndexCategories.json';
import styles from './styles.module.css';
import { ViewpointSelector } from './ViewpointSelector';

type Props = WrapperProps<typeof DocSidebarType>;

/**
 * The final, working filter function. It reads tags directly from each
 * sidebar item's `customProps`.
 */
function filterSidebarItems(
  items: PropSidebarItem[],
  filterTag: string | null,
): PropSidebarItem[] {
  // If there's no filter tag, show everything.
  if (!filterTag) {
    return items;
  }

  const filteredList: PropSidebarItem[] = [];

  for (const item of items) {
    //
    // --- THIS IS THE FIX ---
    // We are now looking for `category_index` instead of `tags`.
    //
    const tags = (item.customProps?.category_index as string[]) || [];
    const hasTag = tags.includes(filterTag);

    // If the item is a category, we need to check its children.
    if (item.type === 'category') {
      const filteredSubItems = filterSidebarItems(item.items, filterTag);
      // A category is kept if EITHER its own link has the tag, OR it has children that match.
      if (hasTag || filteredSubItems.length > 0) {
        // If the category itself is a match, show all its original children.
        // Otherwise, show only the children that matched the filter.
        filteredList.push({
          ...item,
          items: hasTag ? item.items : filteredSubItems,
        });
      }
    } else if (hasTag) {
      // If it's a doc or link and it has the tag, keep it.
      filteredList.push(item);
    }
  }

  return filteredList;
}

export default function DocSidebarWrapper(props: Props): ReactNode {
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const SHOW_ALL_KEY = 'explore-all';

  const viewpointData = useMemo(() => {
    const allItems = jsonSchema.generatedIndexes.map((cat) => ({
      text: cat.label,
      value: cat.customProps.id ?? 'unknown',
    }));
    return [
      {
        heading: 'Explore',
        items: [{ text: 'Explore all Reference Architectures', value: SHOW_ALL_KEY }],
      },
      { heading: 'Partners', items: allItems.slice(0, 3) },
      { heading: 'Technology Domains', items: allItems.slice(3) },
    ];
  }, []);

  const handleViewpointChange = (selectedValue: string) => {
    const newFilter = selectedValue === SHOW_ALL_KEY ? null : selectedValue;
    setActiveFilterTag(newFilter);
  };

  // Recalculate the sidebar view whenever the original sidebar or filter changes.
  const filteredSidebar = useMemo(() => {
    // Note: We don't need to pass docIdToTags anymore.
    return filterSidebarItems(props.sidebar, activeFilterTag);
  }, [props.sidebar, activeFilterTag]);

  const newProps = {
    ...props,
    sidebar: filteredSidebar,
  };

  return (
    <div className={styles.sidebarContainer}>
      <ViewpointSelector
        label="SAP Viewpoints"
        data={viewpointData}
        onSelectionChange={handleViewpointChange}
        initialSelectedValue={activeFilterTag || SHOW_ALL_KEY}
      />
      <div className={styles.contentWrapper}>
        <DocSidebar {...newProps} />
      </div>
    </div>
  );
}