import React, { useState, useMemo } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from "@docusaurus/theme-common";
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';


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

// ============================================================================
// Desktop Version 
// ============================================================================
function DocSidebarDesktop(props) {
  const sidebar = useDocsSidebar();
  const shouldShowFilters = sidebar?.name === 'refarchSidebar';

  
  if (!shouldShowFilters) {
    return <DocSidebar {...props} />;
  }

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


// ============================================================================
// Mobile Version
// ============================================================================

function FilteredMobileSidebarView({ sidebar, path, onItemClick }) {
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [selectedTechDomains, setSelectedTechDomains] = useState([]);

  const handleFilterChange = (filterGroup, selectedKeys) => {
    if (filterGroup === 'partners') { setSelectedPartners(selectedKeys); }
    else if (filterGroup === 'techDomains') { setSelectedTechDomains(selectedKeys); }
  };

  const filteredSidebar = useMemo(
    () => filterSidebarItems(sidebar, selectedPartners, selectedTechDomains),
    [sidebar, selectedPartners, selectedTechDomains]
  );

  return (
    <>
      <SidebarFilters
        onFilterChange={handleFilterChange}
        initialValues={{ partners: selectedPartners, techDomains: selectedTechDomains }}
      />
      <DocSidebarItems
        items={filteredSidebar}
        activePath={path}
        onItemClick={onItemClick}
      />
    </>
  );
}

function DocSidebarMobileSecondaryMenu({ shouldShowFilters, ...props }) {
  return (
    <ul>
      {shouldShowFilters ? (
        <FilteredMobileSidebarView
          sidebar={props.sidebar}
          path={props.path}
          onItemClick={props.toggleSidebar}
        />
      ) : (
        <DocSidebarItems
          items={props.sidebar}
          activePath={props.path}
          onItemClick={props.toggleSidebar}
        />
      )}
    </ul>
  );
}

function DocSidebarMobile({ shouldShowFilters, ...props }) {
    return (
        <NavbarSecondaryMenuFiller
            component={DocSidebarMobileSecondaryMenu}
            props={{...props, shouldShowFilters}}
        />
    );
}

// ============================================================================
// Main Exported Wrapper
// This is the entry point that decides which version to render.
// ============================================================================
const DocSidebarDesktopMemo = React.memo(DocSidebarDesktop);
const DocSidebarMobileMemo = React.memo(DocSidebarMobile);

export default function DocSidebarWrapper(props) {
  const windowSize = useWindowSize();
  const sidebarContext = useDocsSidebar();

  const shouldShowFilters = sidebarContext?.name === 'refarchSidebar';
  
  const shouldRenderSidebarDesktop = windowSize === 'desktop' || windowSize === 'ssr';
  const shouldRenderSidebarMobile = windowSize === 'mobile';

  return (
    <>
      {shouldRenderSidebarDesktop && (
        <DocSidebarDesktopMemo {...props} />
      )}
      {shouldRenderSidebarMobile && (
        <DocSidebarMobileMemo {...props} shouldShowFilters={shouldShowFilters} />
      )}
    </>
  );
}