import React, { useMemo, useEffect, useState } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import CollapsibleFilterBar from '@site/src/components/FilterBar/CollapsibleFilterBar';
import styles from './styles.module.css';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import useGlobalData from '@docusaurus/useGlobalData';
import tagsMap from '@site/src/constant/tagsMapping.json';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { logger } from '@site/src/utils/logger';

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
    const resetFilters = useSidebarFilterStore((state) => state.resetFilters);

    const [searchTerm, setSearchTerm] = useState('');

    if (!shouldShowFilters) {
        return <DocSidebar {...props} />;
    }

    // Prepare options for CollapsibleFilterBar
    const techDomainOptions = [
        { value: 'ai', label: 'AI & Machine Learning' },
        { value: 'appdev', label: 'Application Dev. & Automation' },
        { value: 'data', label: 'Data & Analytics' },
        { value: 'integration', label: 'Integration' },
        { value: 'opsec', label: 'Operation & Security' }
    ];

    const partnerOptions = [
        { value: 'aws', label: 'Amazon Web Services' },
        { value: 'azure', label: 'Microsoft Azure' },
        { value: 'gcp', label: 'Google Cloud Platform' },
        { value: 'databricks', label: 'Databricks' },
        { value: 'snowflake', label: 'Snowflake' },
        { value: 'nvidia', label: 'Nvidia' },
        { value: 'ibm', label: 'IBM' }
    ];

    // Convert string arrays to Option arrays
    const selectedTechDomainOptions = techDomainOptions.filter(opt => techDomains.includes(opt.value));
    const selectedPartnerOptions = partnerOptions.filter(opt => partners.includes(opt.value));

    const handleTechDomainsChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setTechDomains(selectedKeys);
      
      // Sync URL
      const params = new URLSearchParams(location.search);
      if (selectedKeys.length) params.set('techDomains', selectedKeys.join(','));
      else params.delete('techDomains');
      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    };

    const handlePartnersChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setPartners(selectedKeys);
      
      // Sync URL
      const params = new URLSearchParams(location.search);
      if (selectedKeys.length) params.set('partners', selectedKeys.join(','));
      else params.delete('partners');
      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    };

    const handleResetFilters = () => {
      resetFilters();
      // Clear URL parameters
      window.history.replaceState({}, '', location.pathname);
    };

    const filteredSidebar = useMemo(
      () => filterSidebarItems(props.sidebar, techDomains, partners, tagsDocId),
      [props.sidebar, techDomains, partners, tagsDocId]
    );

    // Count total filtered docs
    const countDocs = (items) => {
      let count = 0;
      items.forEach(item => {
        if (item.type === 'doc' || item.type === 'link') {
          count++;
        } else if (item.type === 'category' && item.items) {
          count += countDocs(item.items);
        }
      });
      return count;
    };

    const resultCount = countDocs(filteredSidebar);
    const newProps = { ...props, sidebar: filteredSidebar };

    return (
            <div className={styles.sidebarWithFiltersContainer}>
            <div>
              <CollapsibleFilterBar
                techDomains={techDomainOptions}
                partners={partnerOptions}
                selectedTechDomains={selectedTechDomainOptions}
                selectedPartners={selectedPartnerOptions}
                onTechDomainsChange={handleTechDomainsChange}
                onPartnersChange={handlePartnersChange}
                resetFilters={handleResetFilters}
                isResetEnabled={techDomains.length > 0 || partners.length > 0 || searchTerm.length > 0}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={resultCount}
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
    const resetFilters = useSidebarFilterStore((state) => state.resetFilters);

    const [searchTerm, setSearchTerm] = useState('');

    // Prepare options for CollapsibleFilterBar
    const techDomainOptions = [
        { value: 'ai', label: 'AI & Machine Learning' },
        { value: 'appdev', label: 'Application Dev. & Automation' },
        { value: 'data', label: 'Data & Analytics' },
        { value: 'integration', label: 'Integration' },
        { value: 'opsec', label: 'Operation & Security' }
    ];

    const partnerOptions = [
        { value: 'aws', label: 'Amazon Web Services' },
        { value: 'azure', label: 'Microsoft Azure' },
        { value: 'gcp', label: 'Google Cloud Platform' },
        { value: 'databricks', label: 'Databricks' },
        { value: 'snowflake', label: 'Snowflake' },
        { value: 'nvidia', label: 'Nvidia' },
        { value: 'ibm', label: 'IBM' }
    ];

    // Convert string arrays to Option arrays
    const selectedTechDomainOptions = techDomainOptions.filter(opt => techDomains.includes(opt.value));
    const selectedPartnerOptions = partnerOptions.filter(opt => partners.includes(opt.value));

    const handleTechDomainsChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setTechDomains(selectedKeys);
    };

    const handlePartnersChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setPartners(selectedKeys);
    };

    const handleResetFilters = () => {
      resetFilters();
      // Clear URL parameters
      window.history.replaceState({}, '', location.pathname);
    };

    const filteredSidebar = useMemo(
      () => filterSidebarItems(sidebar, techDomains, partners, tagsDocId),
      [sidebar, techDomains, partners, tagsDocId]
    );

    // Count total filtered docs
    const countDocs = (items) => {
      let count = 0;
      items.forEach(item => {
        if (item.type === 'doc' || item.type === 'link') {
          count++;
        } else if (item.type === 'category' && item.items) {
          count += countDocs(item.items);
        }
      });
      return count;
    };

    const resultCount = countDocs(filteredSidebar);

    return (
        <>
        <CollapsibleFilterBar
          techDomains={techDomainOptions}
          partners={partnerOptions}
          selectedTechDomains={selectedTechDomainOptions}
          selectedPartners={selectedPartnerOptions}
          onTechDomainsChange={handleTechDomainsChange}
          onPartnersChange={handlePartnersChange}
          resetFilters={handleResetFilters}
          isResetEnabled={techDomains.length > 0 || partners.length > 0 || searchTerm.length > 0}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={resultCount}
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
      logger.info("Route changed:", location.pathname);

      // Reset only when leaving /docs
      if (!location.pathname.startsWith(docsBase)) {
        logger.info("Resetting filters...");
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

  return (
      <>
          {shouldRenderSidebarDesktop && <DocSidebarDesktopMemo {...props} />}
          {shouldRenderSidebarMobile && <DocSidebarMobileMemo {...props} shouldShowFilters={shouldShowFilters} />}
      </>
  );
}
