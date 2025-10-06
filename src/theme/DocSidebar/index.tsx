import React, { useMemo, useEffect } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import useGlobalData from '@docusaurus/useGlobalData';
import tagsMap from '@site/src/constant/tagsMapping.json';

const categoryIdToTags = Object.entries(tagsMap).reduce((acc, [tagKey, meta]) => {
  const cat = meta?.categoryid;
  if (!cat) return acc;
  (acc[cat] ??= []).push(tagKey);
  return acc;
}, {});

function filterSidebarItems(items, selectedDomains, selectedPartners, docIdToTags) {
  // nothing selected
  if (!selectedDomains?.length && !selectedPartners?.length) {
    return items;
  }

  const selectedCategories = [...(selectedDomains ?? []), ...(selectedPartners ?? [])];

  // Expand selected categories into all tag keys they cover
  const searchableTags = Array.from(
    new Set(
      selectedCategories.flatMap((categoryId) => [
        categoryId,
        ...(categoryIdToTags[categoryId] ?? []),
      ])
    )
  );

  // Find doc IDs whose tags intersect with searchableTags
  const matchingIds = new Set(
    Object.entries(docIdToTags ?? {}).flatMap(([docId, tags]) =>
      Array.isArray(tags) && tags.some((t) => searchableTags.includes(t)) ? [docId] : []
    )
  );

  // Recursive filter of sidebar tree
  const recurse = (nodes) =>
    nodes.reduce((acc, item) => {
      const idToCheck = item.docId || item.id;

      if ((item.type === 'doc' || item.type === 'link') && matchingIds.has(idToCheck)) {
        acc.push(item);
      } else if (item.type === 'category') {
        const filteredChildren = recurse(item.items);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, items: filteredChildren });
        }
      }

      return acc;
    }, []);

  return recurse(items);
}

// ============================================================================
// Desktop Version
// ============================================================================
function DocSidebarDesktop(props) {
    const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags;
    const sidebar = useDocsSidebar();
    const shouldShowFilters = sidebar?.name === 'refarchSidebar';

    const techDomains = useSidebarFilterStore((state) => state.techDomains);
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);
    const partners = useSidebarFilterStore((state) => state.partners);
    const setPartners = useSidebarFilterStore((state) => state.setPartners);

    if (!shouldShowFilters) {
        return <DocSidebar {...props} />;
    }

    const handleFilterChange = (filterGroup, selectedKeys) => {
      if (filterGroup === "partners") {
        setPartners(selectedKeys);
      }
      if (filterGroup === "techDomains") {
        setTechDomains(selectedKeys);
      }
    };

    const filteredSidebar = useMemo(
      () => filterSidebarItems(props.sidebar, techDomains, partners, tagsDocId),
      [props.sidebar, techDomains, partners, tagsDocId]
    );


    const newProps = { ...props, sidebar: filteredSidebar };

    return (
            <div className={styles.sidebarWithFiltersContainer}>
            <div>
              <SidebarFilters
                onFilterChange={handleFilterChange}
                initialValues={{ partners, techDomains }}
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
    const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags;
    const techDomains = useSidebarFilterStore((state) => state.techDomains);
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);
    const partners = useSidebarFilterStore((state) => state.partners);
    const setPartners = useSidebarFilterStore((state) => state.setPartners);

    const handleFilterChange = (filterGroup, selectedKeys) => {
      if (filterGroup === "partners") {
        setPartners(selectedKeys);
      }
      if (filterGroup === "techDomains") {
        setTechDomains(selectedKeys);
      }
    };

    const filteredSidebar = useMemo(
      () => filterSidebarItems(sidebar, techDomains, partners, tagsDocId),
      [sidebar, techDomains, partners, tagsDocId]
    );

    return (
        <>
        <SidebarFilters
          onFilterChange={handleFilterChange}
          initialValues={{ partners, techDomains }}
        />
        <DocSidebarItems items={filteredSidebar} activePath={path} onItemClick={onItemClick} />
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
                <DocSidebarItems items={props.sidebar} activePath={props.path} onItemClick={props.toggleSidebar} />
            )}
        </ul>
    );
}

function DocSidebarMobile({ shouldShowFilters, ...props }) {
    return (
        <NavbarSecondaryMenuFiller component={DocSidebarMobileSecondaryMenu} props={{ ...props, shouldShowFilters }} />
    );
}

// ============================================================================
// Main Exported Wrapper
// ============================================================================
const DocSidebarDesktopMemo = React.memo(DocSidebarDesktop);
const DocSidebarMobileMemo = React.memo(DocSidebarMobile);

export default function DocSidebarWrapper(props) {
    const windowSize = useWindowSize();
    const sidebarContext = useDocsSidebar();
    const shouldShowFilters = sidebarContext?.name === 'refarchSidebar';

    const shouldRenderSidebarDesktop = windowSize === 'desktop' || windowSize === 'ssr';
    const shouldRenderSidebarMobile = windowSize === 'mobile';

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.setAttribute('data-sidebar-id', sidebarContext?.name || '');
        }
    }, [sidebarContext?.name]);

    return (
        <>
            {shouldRenderSidebarDesktop && <DocSidebarDesktopMemo {...props} />}
            {shouldRenderSidebarMobile && <DocSidebarMobileMemo {...props} shouldShowFilters={shouldShowFilters} />}
        </>
    );
}
