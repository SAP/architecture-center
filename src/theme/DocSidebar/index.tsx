import React, { useMemo, useEffect } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';
import { useSidebarFilterStore, useDocSidebarContext } from '@site/src/store/sidebar-store';
import useGlobalData from '@docusaurus/useGlobalData';
import tagsMap from '@site/src/constant/tagsMapping.json';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

const categoryIdToTags = Object.entries(tagsMap).reduce((acc, [tagKey, meta]) => {
  const cat = meta?.categoryid;
  if (!cat) return acc;
  (acc[cat] ??= []).push(tagKey);
  return acc;
}, {});

function filterSidebarItems(items, selectedDomains, selectedPartners, docIdToTags) {
  if (!selectedDomains?.length && !selectedPartners?.length) {
    return items;
  }

  // Expand each ID into its tags (category expansion)
  const expand = (ids) =>
    Array.from(new Set(ids.flatMap((id) => [id, ...(categoryIdToTags[id] ?? [])])));

  const partnerTags = expand(selectedPartners ?? []);
  const domainTags = expand(selectedDomains ?? []);

  const matchingIds = new Set(
    Object.entries(docIdToTags ?? {}).flatMap(([docId, tags]) => {
      if (!Array.isArray(tags)) return [];

      let matches = false;

      // CASE 1: Both domains AND partners selected
      if (domainTags.length && partnerTags.length) {
        for (const domain of domainTags) {
          for (const partner of partnerTags) {
            if (tags.includes(domain) && tags.includes(partner)) {
              matches = true;
              break;
            }
          }
          if (matches) break;
        }
      }
      // CASE 2: Only partners selected → OR logic
      else if (partnerTags.length) {
        matches = partnerTags.some((p) => tags.includes(p));
      }
      // CASE 3: Only domains selected → OR logic
      else if (domainTags.length) {
        matches = domainTags.some((d) => tags.includes(d));
      }

      return matches ? [docId] : [];
    })
  );

  // Recursive filtering of sidebar tree
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
      // Sync URL
      const params = new URLSearchParams(location.search);
      if (selectedKeys.length) params.set(filterGroup, selectedKeys.join(','));
      else params.delete(filterGroup);

      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
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
  const setPartners = useSidebarFilterStore((state) => state.setPartners);
  const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);
  const resetFilters = useSidebarFilterStore((state) => state.resetFilters);
  const history = useHistory();
  const docsBase = useBaseUrl('/docs');
  const storeSidebarContext = useDocSidebarContext((state) => state.setSidebarContext);

  useEffect(() => {
    if (!location.pathname.startsWith(docsBase)) return;

    const params = new URLSearchParams(location.search);

    const partnersParam = params.get('partners');
    const techDomainsParam = params.get('techDomains');

    if (partnersParam) setPartners(partnersParam.split(','));
    if (techDomainsParam) setTechDomains(techDomainsParam.split(','));
  }, [location.search, docsBase, setPartners, setTechDomains]);


  useEffect(() => {   
    return history.listen((location) => {
      console.log("Route changed:", location.pathname);

      // Reset only when leaving /docs
      if (!location.pathname.startsWith(docsBase)) {
        console.log("Resetting filters...");
        resetFilters();
      }
    });
  }, [history, resetFilters]);


  const shouldRenderSidebarDesktop = windowSize === 'desktop' || windowSize === 'ssr';
  const shouldRenderSidebarMobile = windowSize === 'mobile';

  useEffect(() => {
      if (typeof document !== 'undefined') {
          document.body.setAttribute('data-sidebar-id', sidebarContext?.name || '');
      }
  }, [sidebarContext?.name]);

  useEffect(() => {
    // store sidebarContext globally
    storeSidebarContext(sidebarContext);
  }, [sidebarContext]);

  return (
      <>
          {shouldRenderSidebarDesktop && <DocSidebarDesktopMemo {...props} />}
          {shouldRenderSidebarMobile && <DocSidebarMobileMemo {...props} shouldShowFilters={shouldShowFilters} />}
      </>
  );
}
