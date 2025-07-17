// src/theme/DocSidebar/index.js

import React, { useState, useMemo } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';

// The filterSidebarItems function does not need any changes.
function filterSidebarItems(items, selectedPartners, selectedTechDomains) {
  if (selectedPartners.length === 0 && selectedTechDomains.length === 0) {
    return items;
  }
  return items.reduce((acc, item) => {
    const checkItem = (currentItem) => {
      const categoryIndex = Array.isArray(currentItem.customProps?.category_index) ? currentItem.customProps.category_index : [];
      const partnerMatch = selectedPartners.length === 0 || selectedPartners.every((partnerKey) => categoryIndex.includes(partnerKey));
      const domainMatch = selectedTechDomains.length === 0 || selectedTechDomains.every((domainKey) => categoryIndex.includes(domainKey));
      return partnerMatch && domainMatch;
    };
    if (item.type === 'category') {
      if (checkItem(item)) {
        acc.push(item);
      } else {
        const filteredChildren = filterSidebarItems(item.items, selectedPartners, selectedTechDomains);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, items: filteredChildren });
        }
      }
    } else if (item.type === 'doc' || item.type === 'link') {
      if (checkItem(item)) {
        acc.push(item);
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

export default function DocSidebarWrapper(props) {
  const sidebar = useDocsSidebar();
  const shouldShowFilters = sidebar?.name === 'refarchSidebar';

  // If this isn't the sidebar we want to modify, just render the original and exit.
  if (!shouldShowFilters) {
    return <DocSidebar {...props} />;
  }

  // From here, we are only handling the 'refarchSidebar' case.
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [selectedTechDomains, setSelectedTechDomains] = useState([]);

  const handleFilterChange = (filterGroup, selectedKeys) => {
    if (filterGroup === 'partners') { setSelectedPartners(selectedKeys); }
    else if (filterGroup === 'techDomains') { setSelectedTechDomains(selectedKeys); }
  };

  const filteredSidebar = useMemo(
    () => filterSidebarItems(props.sidebar, selectedPartners, selectedTechDomains),
    [props.sidebar, selectedPartners, selectedTechDomains]
  );

  const newProps = { ...props, sidebar: filteredSidebar };

  return (
    <div className={styles.sidebarWithFiltersContainer}>
      <div>
        <SidebarFilters
          onFilterChange={handleFilterChange}
          initialValues={{ partners: selectedPartners, techDomains: selectedTechDomains }}
        />
      </div>

      <div className={styles.sidebarMenuList}>
        <DocSidebar {...newProps} />
      </div>
    </div>
  );
}