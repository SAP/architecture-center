import React, { useMemo, useEffect, useState } from 'react';
import clsx from 'clsx';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize, useThemeConfig } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import CollapsibleFilterBar from '@site/src/components/FilterBar/CollapsibleFilterBar';
import CollapseButton from '@theme/DocSidebar/Desktop/CollapseButton';
import styles from './styles.module.css';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import useGlobalData from '@docusaurus/useGlobalData';
import tagsMap from '@site/src/constant/tagsMapping.json';
import { useHistory, useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { logger } from '@site/src/utils/logger';

// Domain definitions with labels
const DOMAIN_DEFINITIONS = [
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'appdev', label: 'Application Dev. & Automation' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'integration', label: 'Integration' },
  { id: 'opsec', label: 'Operation & Security' },
];

const categoryIdToTags = Object.entries(tagsMap).reduce((acc, [tagKey, meta]) => {
  const cat = meta?.categoryid;
  if (!cat) return acc;
  (acc[cat] ??= []).push(tagKey);
  return acc;
}, {});

// Helper to count occurrences of a docId in items (recursive)
function countDocsInItems(items, docId): number {
  let count = 0;
  for (const item of items) {
    if ((item.type === 'doc' || item.type === 'link') && (item.docId === docId || item.id === docId)) {
      count++;
    } else if (item.type === 'category') {
      // Check if the category itself matches (for parent architectures with href)
      if (item.href === docId) {
        count++;
      }
      // Recursively check children
      if (item.items) {
        count += countDocsInItems(item.items, docId);
      }
    }
  }
  return count;
}

// Helper to count total docs in items (recursive) - for badge display
function countTotalDocsInItems(items): number {
  let count = 0;
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      count++;
    } else if (item.type === 'category') {
      // Count the category itself if it has a link (parent architecture that's also a document)
      if (item.link || item.docId || item.href) {
        count++;
      }
      // Also count children recursively
      if (item.items) {
        count += countTotalDocsInItems(item.items);
      }
    }
  }
  return count;
}

// Helper to infer parent document ID from children
const inferParentDocId = (category, docIdToTags): string | null => {
  if (!category.items || category.items.length === 0) return null;

  const firstChild = category.items[0];
  const childId = firstChild.docId || firstChild.id;
  if (!childId) return null;

  // Extract the parent path from the child ID
  const match = childId.match(/^(ref-arch\/RA\d+)\//);
  if (match) {
    const parentPath = match[1];
    // Construct parent document ID
    const raNumber = parentPath.match(/RA(\d+)/)?.[1];
    if (raNumber) {
      const parentDocId = `${parentPath}/id-ra${raNumber.padStart(4, '0')}`;
      // Verify it exists in docIdToTags before returning
      if (docIdToTags?.[parentDocId]) {
        return parentDocId;
      }
    }
  }

  return null;
};

// Group sidebar items by technology domain (preserving hierarchy)
function groupSidebarByDomain(items, docIdToTags) {
  const domainIds = DOMAIN_DEFINITIONS.map((d) => d.id);
  const grouped: Record<string, any[]> = {};
  const duplicateCounts: Record<string, number> = {};

  // Initialize empty arrays for each domain
  domainIds.forEach((id) => { grouped[id] = []; });

  // Helper: Check if a doc/link belongs to a domain
  const itemBelongsToDomain = (item, domainId) => {
    const itemId = item.docId || item.id || '';
    const tags = docIdToTags?.[itemId] || [];

    // Direct match
    if (tags.includes(domainId)) return true;

    // Check category mappings
    const domainTags = categoryIdToTags[domainId] || [];
    return domainTags.some((tag) => tags.includes(tag));
  };

  // Helper: Recursively check if a category contains any docs for this domain
  const categoryHasDocsForDomain = (category, domainId): boolean => {
    // Check if the category itself (parent document) belongs to this domain
    let categoryDocId = category.link?.id || category.href;

    // If we don't have a direct ID, try to infer it from children
    if (!categoryDocId || !docIdToTags?.[categoryDocId]) {
      categoryDocId = inferParentDocId(category, docIdToTags);
    }

    if (categoryDocId) {
      const categoryTags = docIdToTags?.[categoryDocId] || [];
      if (categoryTags.includes(domainId)) return true;

      const domainTags = categoryIdToTags[domainId] || [];
      if (domainTags.some((tag) => categoryTags.includes(tag))) return true;
    }

    // Check if any children belong to this domain
    if (!category.items || category.items.length === 0) return false;

    for (const child of category.items) {
      if ((child.type === 'doc' || child.type === 'link') && itemBelongsToDomain(child, domainId)) {
        return true;
      }
      if (child.type === 'category' && categoryHasDocsForDomain(child, domainId)) {
        return true;
      }
    }
    return false;
  };

  // First pass: Collect ALL document IDs (including parent architectures) from the entire sidebar
  const collectAllDocIds = (itemList: any[]): Set<string> => {
    const docIds = new Set<string>();

    const traverse = (item: any) => {
      if (item.type === 'doc' || item.type === 'link') {
        const docId = item.docId || item.id;
        if (docId) docIds.add(docId);
      } else if (item.type === 'category') {
        // If category has href and children, it's a parent architecture (expandable document)
        if (item.href && item.items && item.items.length > 0) {
          docIds.add(item.href);
        }
        // Recursively process children
        if (item.items) {
          item.items.forEach(traverse);
        }
      }
    };

    itemList.forEach(traverse);
    return docIds;
  };

  // Collect all doc IDs first
  const allDocIds = collectAllDocIds(items);

  // Helper: Recursively filter category items by domain
  const filterCategoryForDomain = (category, domainId) => {
    const filteredItems = [];

    for (const child of category.items || []) {
      if ((child.type === 'doc' || child.type === 'link') && itemBelongsToDomain(child, domainId)) {
        filteredItems.push(child);
      } else if (child.type === 'category' && categoryHasDocsForDomain(child, domainId)) {
        filteredItems.push(filterCategoryForDomain(child, domainId));
      }
    }

    return { ...category, items: filteredItems };
  };

  // Group items by domain, preserving category structure
  items.forEach((item) => {
    domainIds.forEach((domainId) => {
      if ((item.type === 'doc' || item.type === 'link') && itemBelongsToDomain(item, domainId)) {
        grouped[domainId].push(item);
      } else if (item.type === 'category' && categoryHasDocsForDomain(item, domainId)) {
        const filteredCategory = filterCategoryForDomain(item, domainId);
        grouped[domainId].push(filteredCategory);
      }
    });
  });

  // Calculate duplicate counts for all doc IDs
  allDocIds.forEach((docId) => {
    let count = 0;
    domainIds.forEach((domainId) => {
      const hasDoc = countDocsInItems(grouped[domainId], docId) > 0;
      if (hasDoc) count++;
    });
    if (count > 1) {
      duplicateCounts[docId] = count - 1;
    }
  });

  return { grouped, duplicateCounts };
}

// Filter grouped items by partner (preserving hierarchy)
function filterGroupedByPartner(grouped, selectedPartners, docIdToTags) {
  if (!selectedPartners?.length) return grouped;

  const expand = (ids) =>
    Array.from(new Set(ids.flatMap((id) => [id, ...(categoryIdToTags[id] ?? [])])));
  const partnerTags = expand(selectedPartners);

  // Helper: Check if item matches partner filter
  const itemMatchesPartner = (item) => {
    const itemId = item.docId || item.id || '';
    const tags = docIdToTags?.[itemId] || [];
    return partnerTags.some((p) => tags.includes(p));
  };

  // Helper: Check if category itself (parent document) matches partner filter
  const categoryMatchesPartner = (category) => {
    let categoryDocId = category.link?.id || category.href;

    if (!categoryDocId || !docIdToTags?.[categoryDocId]) {
      categoryDocId = inferParentDocId(category, docIdToTags);
    }

    if (!categoryDocId) return false;
    const tags = docIdToTags?.[categoryDocId] || [];
    return partnerTags.some((p) => tags.includes(p));
  };

  // Helper: Recursively filter category
  const filterCategory = (category) => {
    const filteredItems = [];
    for (const child of category.items || []) {
      if ((child.type === 'doc' || child.type === 'link') && itemMatchesPartner(child)) {
        filteredItems.push(child);
      } else if (child.type === 'category') {
        const filteredChild = filterCategory(child);
        if (filteredChild.items.length > 0 || categoryMatchesPartner(child)) {
          filteredItems.push(filteredChild);
        }
      }
    }
    return { ...category, items: filteredItems };
  };

  const filtered: Record<string, any[]> = {};
  Object.entries(grouped).forEach(([domainId, items]) => {
    filtered[domainId] = [];

    for (const item of items) {
      if ((item.type === 'doc' || item.type === 'link') && itemMatchesPartner(item)) {
        filtered[domainId].push(item);
      } else if (item.type === 'category') {
        const filteredCategory = filterCategory(item);
        const categoryMatches = categoryMatchesPartner(item);

        // Include category if it has matching children OR the parent document itself matches
        if (filteredCategory.items.length > 0 || categoryMatches) {
          // Preserve the inferred parent document ID for counting purposes, when a parent matches but has no matching children
          let categoryDocId = item.link?.id || item.href;
          if (!categoryDocId || !docIdToTags?.[categoryDocId]) {
            categoryDocId = inferParentDocId(item, docIdToTags);
          }

          filtered[domainId].push({
            ...filteredCategory,
            // Store the parent doc ID in metadata for later counting
            _inferredDocId: categoryDocId
          });
        }
      }
    }
  });

  return filtered;
}

// ============================================================================
// Shared Helper Functions
// ============================================================================

// Collect unique doc IDs from grouped items (for result count display)
function collectUniqueDocIds(groupedItems: Record<string, any[]>, docIdToTags): Set<string> {
  const uniqueDocIds = new Set<string>();

  const traverse = (items: any[]) => {
    items.forEach(item => {
      if (item.type === 'doc' || item.type === 'link') {
        const id = item.docId || item.id || '';
        if (id) uniqueDocIds.add(id);
      } else if (item.type === 'category') {
        // Count the category itself if it has a linked document (parent architecture)
        let categoryDocId = item._inferredDocId;

        if (!categoryDocId) {
          categoryDocId = item.link?.id || item.href;
        }

        if (!categoryDocId || !docIdToTags?.[categoryDocId]) {
          categoryDocId = inferParentDocId(item, docIdToTags);
        }

        if (categoryDocId) {
          uniqueDocIds.add(categoryDocId);
        }
        // Recursively count children
        if (item.items) {
          traverse(item.items);
        }
      }
    });
  };

  Object.values(groupedItems).forEach(items => traverse(items));
  return uniqueDocIds;
}

// Add duplicate counters to item customProps recursively
function addDuplicateCountersToItems(items: any[], duplicateCounts: Record<string, number>): any[] {
  return items.map(item => {
    if (item.type === 'category') {
      // For parent architectures (categories with href), use href for matching
      const categoryId = item.href || item.docId || item.id || '';
      const categoryDuplicateCount = duplicateCounts[categoryId];

      return {
        ...item,
        customProps: {
          ...item.customProps,
          ...(categoryDuplicateCount && { duplicateCount: categoryDuplicateCount })
        },
        items: item.items ? addDuplicateCountersToItems(item.items, duplicateCounts) : []
      };
    } else if (item.type === 'doc' || item.type === 'link') {
      const itemId = item.docId || item.id || '';
      const duplicateCount = duplicateCounts[itemId];

      return {
        ...item,
        customProps: {
          ...item.customProps,
          ...(duplicateCount && { duplicateCount })
        }
      };
    }

    return item;
  });
}

// Transform domain-grouped data into Docusaurus category structure
function buildDomainCategories(
  filteredGrouped: Record<string, any[]>,
  duplicateCounts: Record<string, number>,
  expandedDomains: string[]
) {
  return DOMAIN_DEFINITIONS.map(domain => {
    const domainItems = filteredGrouped[domain.id] || [];
    const docCount = countTotalDocsInItems(domainItems);
    const itemsWithCounters = addDuplicateCountersToItems(domainItems, duplicateCounts);

    return {
      type: 'category',
      label: `${domain.label} (${docCount})`,
      items: itemsWithCounters,
      collapsible: true,
      collapsed: !expandedDomains.includes(domain.id),
      customProps: {
        domainId: domain.id
      }
    };
  }).filter(category => category.items.length > 0);
}

// ============================================================================
// Desktop Version
// ============================================================================
const PARTNER_OPTIONS = [
    { value: 'aws', label: 'Amazon Web Services' },
    { value: 'azure', label: 'Microsoft Azure' },
    { value: 'gcp', label: 'Google Cloud Platform' },
    { value: 'databricks', label: 'Databricks' },
    { value: 'snowflake', label: 'Snowflake' },
    { value: 'nvidia', label: 'Nvidia' },
    { value: 'ibm', label: 'IBM' }
];

function DocSidebarDesktop(props) {
    const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags;
    const sidebar = useDocsSidebar();
    const shouldShowFilters = sidebar?.name === 'refarchSidebar';
    const location = useLocation();
    const {
        navbar: { hideOnScroll },
        docs: {
            sidebar: { hideable },
        },
    } = useThemeConfig();

    const partners = useSidebarFilterStore((state) => state.partners);
    const setPartners = useSidebarFilterStore((state) => state.setPartners);
    const resetFilters = useSidebarFilterStore((state) => state.resetFilters);
    const expandedDomains = useSidebarFilterStore((state) => state.expandedDomains);

    const [searchTerm, setSearchTerm] = useState('');

    // Group sidebar items by domain
    const grouped = useMemo(
      () => groupSidebarByDomain(props.sidebar, tagsDocId),
      [props.sidebar, tagsDocId]
    );

    // Filter by selected partners
    const filteredGrouped = useMemo(
      () => filterGroupedByPartner(grouped.grouped, partners, tagsDocId),
      [grouped.grouped, partners, tagsDocId]
    );

    // Convert string arrays to Option arrays
    const selectedPartnerOptions = useMemo(
      () => PARTNER_OPTIONS.filter(opt => partners.includes(opt.value)),
      [partners]
    );

    if (!shouldShowFilters) {
        return <DocSidebar {...props} />;
    }

    const handlePartnersChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setPartners(selectedKeys);

      // Sync URL
      const params = new URLSearchParams(location.search);
      if (selectedKeys.length) params.set('partners', selectedKeys.join(','));
      else params.delete('partners');
      params.delete('techDomains'); // Remove old techDomains param
      window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    };

    const handleResetFilters = () => {
      resetFilters();
      // Clear URL parameters
      window.history.replaceState({}, '', location.pathname);
    };

    // Count unique documents (across all domains, no duplicates)
    const resultCount = collectUniqueDocIds(filteredGrouped, tagsDocId).size;

    // Transform domain-grouped data into Docusaurus category structure
    const domainCategories = buildDomainCategories(
      filteredGrouped,
      grouped.duplicateCounts,
      expandedDomains
    );

    return (
      <div className={clsx(
        styles.sidebarWithFiltersContainer,
        props.isHidden && styles.sidebarHidden
      )}>
        <div>
          <CollapsibleFilterBar
            partners={PARTNER_OPTIONS}
            selectedPartners={selectedPartnerOptions}
            onPartnersChange={handlePartnersChange}
            resetFilters={handleResetFilters}
            isResetEnabled={partners.length > 0 || searchTerm.length > 0}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={resultCount}
          />
        </div>
        <div className={styles.sidebarMenuList}>
          <div className={clsx(
            styles.sidebar,
            hideOnScroll && styles.sidebarWithHideableNavbar
          )}>
            <nav className={`${styles.domainSidebar} thin-scrollbar`}>
              <DocSidebarItems
                items={domainCategories}
                activePath={location.pathname}
                level={0}
                index={0}
              />
            </nav>
            {hideable && <CollapseButton onClick={props.onCollapse} />}
          </div>
        </div>
      </div>
    );
}

// ============================================================================
// Mobile Version
// ============================================================================
function FilteredMobileSidebarView({ sidebar, path, onItemClick }) {
    const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags;
    const partners = useSidebarFilterStore((state) => state.partners);
    const setPartners = useSidebarFilterStore((state) => state.setPartners);
    const resetFilters = useSidebarFilterStore((state) => state.resetFilters);
    const expandedDomains = useSidebarFilterStore((state) => state.expandedDomains);

    const [searchTerm, setSearchTerm] = useState('');

    // Convert string arrays to Option arrays
    const selectedPartnerOptions = PARTNER_OPTIONS.filter(opt => partners.includes(opt.value));

    // Group sidebar items by domain
    const grouped = useMemo(
      () => groupSidebarByDomain(sidebar, tagsDocId),
      [sidebar, tagsDocId]
    );

    // Filter by selected partners
    const filteredGrouped = useMemo(
      () => filterGroupedByPartner(grouped.grouped, partners, tagsDocId),
      [grouped.grouped, partners, tagsDocId]
    );

    const handlePartnersChange = (selected) => {
      const selectedKeys = selected.map(opt => opt.value);
      setPartners(selectedKeys);
    };

    const handleResetFilters = () => {
      resetFilters();
      // Clear URL parameters
      window.history.replaceState({}, '', location.pathname);
    };

    // Count unique documents
    const resultCount = collectUniqueDocIds(filteredGrouped, tagsDocId).size;

    // Transform domain-grouped data into Docusaurus category structure
    const domainCategories = buildDomainCategories(
      filteredGrouped,
      grouped.duplicateCounts,
      expandedDomains
    );

    return (
        <>
        <CollapsibleFilterBar
          partners={PARTNER_OPTIONS}
          selectedPartners={selectedPartnerOptions}
          onPartnersChange={handlePartnersChange}
          resetFilters={handleResetFilters}
          isResetEnabled={partners.length > 0 || searchTerm.length > 0}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={resultCount}
        />
        <nav className={styles.domainSidebarMobile}>
          <DocSidebarItems
            items={domainCategories}
            activePath={path}
            onItemClick={onItemClick}
            level={0}
            index={0}
          />
        </nav>
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

// Helper function to find a doc in sidebar by path
function findDocByPath(items, pathname) {
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      if (item.href === pathname || pathname.startsWith(item.href)) {
        return item.docId || item.id;
      }
    } else if (item.type === 'category' && item.items) {
      const found = findDocByPath(item.items, pathname);
      if (found) return found;
    }
  }
  return null;
}

export default function DocSidebarWrapper(props) {
  const windowSize = useWindowSize();
  const sidebarContext = useDocsSidebar();
  const shouldShowFilters = sidebarContext?.name === 'refarchSidebar';
  const setPartners = useSidebarFilterStore((state) => state.setPartners);
  const setExpandedDomains = useSidebarFilterStore((state) => state.setExpandedDomains);
  const resetFilters = useSidebarFilterStore((state) => state.resetFilters);
  const history = useHistory();
  const docsBase = useBaseUrl('/docs');
  const location = useLocation();
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin']?.default?.docIdToTags;

  useEffect(() => {
    if (!location.pathname.startsWith(docsBase)) return;
    if (!shouldShowFilters) return; // Only run for ref-arch sidebar
    if (!tagsDocId) return; // Wait for tags data to load
    if (!props.sidebar) return; // Wait for sidebar to load

    const params = new URLSearchParams(location.search);
    const partnersParam = params.get('partners');
    const expandedParam = params.get('expanded');

    if (partnersParam) setPartners(partnersParam.split(','));

    // If expanded param is set, use it (explicit choice from landing page)
    if (expandedParam) {
      setExpandedDomains(expandedParam.split(','));
      return;
    }

    // Auto-expand domains for the current doc
    // Find the doc ID by matching the current pathname to sidebar items
    const docId = findDocByPath(props.sidebar, location.pathname);

    // If we're on a specific doc page
    if (docId && tagsDocId[docId]) {
      const docTags = tagsDocId[docId] || [];
      const domainIds = DOMAIN_DEFINITIONS.map((d) => d.id);

      // Find which domains this doc belongs to
      const matchingDomains = domainIds.filter((domainId) => {
        // Direct match
        if (docTags.includes(domainId)) return true;
        // Check category mappings
        const domainTags = categoryIdToTags[domainId] || [];
        return domainTags.some((tag) => docTags.includes(tag));
      });

      if (matchingDomains.length > 0) {
        setExpandedDomains(matchingDomains);
      }
    }
  }, [location.pathname, location.search, docsBase, setPartners, setExpandedDomains, shouldShowFilters, tagsDocId, props.sidebar]);


  useEffect(() => {
    return history.listen((loc) => {
      logger.info("Route changed:", loc.pathname);

      // Reset only when leaving /docs
      if (!loc.pathname.startsWith(docsBase)) {
        logger.info("Resetting filters...");
        resetFilters();
      }
    });
  }, [history, resetFilters, docsBase]);


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
