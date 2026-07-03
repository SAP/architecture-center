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

// Get all matching document IDs for given partner tags directly from docIdToTags
function getMatchingDocIds(docIdToTags: Record<string, string[]>, partnerTags: string[]): Set<string> {
  const matchingIds = new Set<string>();

  if (!docIdToTags || !partnerTags.length) return matchingIds;

  for (const [docId, tags] of Object.entries(docIdToTags)) {
    if (tags && partnerTags.some(tag => tags.includes(tag))) {
      matchingIds.add(docId);
    }
  }

  return matchingIds;
}

// Get document ID from a sidebar item (doc, link, or category)
function getItemDocId(item: any, docIdToTags?: Record<string, string[]>): string | null {
  if (item.type === 'doc' || item.type === 'link') {
    return item.docId || item.id || null;
  }
  if (item.type === 'category') {
    // For categories with links, extract the hex ID from href and find matching docId
    if (item.href && docIdToTags) {
      const hexMatch = item.href.match(/\/([a-f0-9]{6})(?:\/)?$/i);
      if (hexMatch) {
        const hexId = hexMatch[1];
        // Find the docId that ends with this hex ID
        for (const docId of Object.keys(docIdToTags)) {
          if (docId.endsWith(hexId) || docId.endsWith(`/${hexId}`)) {
            return docId;
          }
        }
      }
    }
    // Fallback to link.id for sidebarContext format
    return item.link?.id || null;
  }
  return null;
}

// Check if item belongs to a domain
function itemBelongsToDomain(item: any, domainId: string, docIdToTags: Record<string, string[]>): boolean {
  const docId = getItemDocId(item, docIdToTags);
  if (!docId) return false;

  const tags = docIdToTags?.[docId] || [];
  if (tags.includes(domainId)) return true;

  const domainTags = categoryIdToTags[domainId] || [];
  return domainTags.some(tag => tags.includes(tag));
}

// Check if category or any descendant belongs to domain
function categoryOrDescendantBelongsToDomain(category: any, domainId: string, docIdToTags: Record<string, string[]>): boolean {
  // Check category itself
  if (itemBelongsToDomain(category, domainId, docIdToTags)) return true;

  // Check children
  if (!category.items) return false;

  for (const child of category.items) {
    if (child.type === 'doc' || child.type === 'link') {
      if (itemBelongsToDomain(child, domainId, docIdToTags)) return true;
    } else if (child.type === 'category') {
      if (categoryOrDescendantBelongsToDomain(child, domainId, docIdToTags)) return true;
    }
  }

  return false;
}

// Count total docs in items (for domain category badge)
function countTotalDocsInItems(items: any[]): number {
  let count = 0;
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      count++;
    } else if (item.type === 'category') {
      // Count the category itself if it has a linked document (check both link.id and href)
      if (item.link?.id || item.href) count++;
      if (item.items) count += countTotalDocsInItems(item.items);
    }
  }
  return count;
}

// Count unique documents across all items (documents can appear in multiple domains)
function countUniqueDocsInItems(items: any[], docIdToTags: Record<string, string[]>, seenIds?: Set<string>): number {
  const seen = seenIds || new Set<string>();

  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      const docId = item.docId || item.id;
      if (docId && !seen.has(docId)) {
        seen.add(docId);
      }
    } else if (item.type === 'category') {
      // Check if category itself has a linked document
      const categoryDocId = getItemDocId(item, docIdToTags);
      if (categoryDocId && !seen.has(categoryDocId)) {
        seen.add(categoryDocId);
      }
      if (item.items) {
        countUniqueDocsInItems(item.items, docIdToTags, seen);
      }
    }
  }

  return seen.size;
}

// Domain Grouping
function groupSidebarByDomain(items: any[], docIdToTags: Record<string, string[]>) {
  const domainIds = DOMAIN_DEFINITIONS.map(d => d.id);
  const grouped: Record<string, any[]> = {};

  domainIds.forEach(id => { grouped[id] = []; });

  // Recursively filter category for domain
  const filterCategoryForDomain = (category: any, domainId: string): any => {
    const filteredItems = [];

    for (const child of category.items || []) {
      if (child.type === 'doc' || child.type === 'link') {
        if (itemBelongsToDomain(child, domainId, docIdToTags)) {
          filteredItems.push(child);
        }
      } else if (child.type === 'category') {
        if (categoryOrDescendantBelongsToDomain(child, domainId, docIdToTags)) {
          filteredItems.push(filterCategoryForDomain(child, domainId));
        }
      }
    }

    return { ...category, items: filteredItems };
  };

  // Group items by domain
  items.forEach(item => {
    domainIds.forEach(domainId => {
      if (item.type === 'doc' || item.type === 'link') {
        if (itemBelongsToDomain(item, domainId, docIdToTags)) {
          grouped[domainId].push(item);
        }
      } else if (item.type === 'category') {
        if (categoryOrDescendantBelongsToDomain(item, domainId, docIdToTags)) {
          grouped[domainId].push(filterCategoryForDomain(item, domainId));
        }
      }
    });
  });

  return { grouped };
}

// Filter by partner tags
function filterGroupedByPartner(
  grouped: Record<string, any[]>,
  selectedPartners: string[],
  docIdToTags: Record<string, string[]>
): { filtered: Record<string, any[]>; matchingDocIds: Set<string> } {
  // Expand partner IDs to include related tags
  const expand = (ids: string[]) =>
    Array.from(new Set(ids.flatMap(id => [id, ...(categoryIdToTags[id] ?? [])])));
  const partnerTags = selectedPartners?.length ? expand(selectedPartners) : [];

  // If no partners selected, return all items
  if (!partnerTags.length) {
    return { filtered: grouped, matchingDocIds: new Set() };
  }

  // Get all document IDs that match the partner tags
  const matchingDocIds = getMatchingDocIds(docIdToTags, partnerTags);

  // Recursively filter category to only include matching items
  const filterCategory = (category: any, domainId: string): any | null => {
    const filteredItems = [];

    for (const child of category.items || []) {
      if (child.type === 'doc' || child.type === 'link') {
        const childId = getItemDocId(child, docIdToTags);
        if (childId && matchingDocIds.has(childId)) {
          filteredItems.push(child);
        }
      } else if (child.type === 'category') {
        // Recursively filter child category
        const filteredChild = filterCategory(child, domainId);
        if (filteredChild) {
          filteredItems.push(filteredChild);
        }
      }
    }

    // Check if the category itself matches the partner filter
    const categoryDocId = getItemDocId(category, docIdToTags);
    const categoryMatches = categoryDocId && matchingDocIds.has(categoryDocId);

    // If category has matching children, include it
    if (filteredItems.length > 0) {
      return { ...category, items: filteredItems };
    }

    // If category has no matching children, only include it if it actually belongs to this domain
    if (categoryMatches && itemBelongsToDomain(category, domainId, docIdToTags)) {
      return { ...category, items: [] };
    }

    // Category doesn't belong in this domain after filtering
    return null;
  };

  // Filter each domain's items
  const filtered: Record<string, any[]> = {};

  Object.entries(grouped).forEach(([domainId, items]) => {
    filtered[domainId] = [];

    for (const item of items) {
      if (item.type === 'doc' || item.type === 'link') {
        const itemId = getItemDocId(item, docIdToTags);
        if (itemId && matchingDocIds.has(itemId)) {
          filtered[domainId].push(item);
        }
      } else if (item.type === 'category') {
        const filteredCategory = filterCategory(item, domainId);
        if (filteredCategory) {
          filtered[domainId].push(filteredCategory);
        }
      }
    }
  });

  return { filtered, matchingDocIds };
}

// Build domain categories for rendering
function buildDomainCategories(
  filteredGrouped: Record<string, any[]>,
  expandedDomains: string[]
) {
  return DOMAIN_DEFINITIONS.map(domain => {
    const domainItems = filteredGrouped[domain.id] || [];
    const docCount = countTotalDocsInItems(domainItems);

    return {
      type: 'category',
      label: `${domain.label} (${docCount})`,
      items: domainItems,
      collapsible: true,
      collapsed: !expandedDomains.includes(domain.id),
      customProps: { domainId: domain.id }
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
    docs: { sidebar: { hideable } },
  } = useThemeConfig();

  const partners = useSidebarFilterStore(state => state.partners);
  const setPartners = useSidebarFilterStore(state => state.setPartners);
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const expandedDomains = useSidebarFilterStore(state => state.expandedDomains);

  const [searchTerm, setSearchTerm] = useState('');

  // Group sidebar items by domain
  const grouped = useMemo(
    () => groupSidebarByDomain(props.sidebar, tagsDocId),
    [props.sidebar, tagsDocId]
  );

  // Filter by selected partners and get matching doc IDs for counting
  const { filtered: filteredGrouped, matchingDocIds } = useMemo(
    () => filterGroupedByPartner(grouped.grouped, partners, tagsDocId),
    [grouped.grouped, partners, tagsDocId]
  );

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

    const params = new URLSearchParams(location.search);
    if (selectedKeys.length) params.set('partners', selectedKeys.join(','));
    else params.delete('partners');
    params.delete('techDomains');
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    resetFilters();
    window.history.replaceState({}, '', location.pathname);
  };

  // Count: use matchingDocIds size when filtering, otherwise count unique docs
  const resultCount = partners.length > 0
    ? matchingDocIds.size
    : countUniqueDocsInItems(Object.values(filteredGrouped).flat(), tagsDocId);

  const domainCategories = buildDomainCategories(filteredGrouped, expandedDomains);

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
  const partners = useSidebarFilterStore(state => state.partners);
  const setPartners = useSidebarFilterStore(state => state.setPartners);
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const expandedDomains = useSidebarFilterStore(state => state.expandedDomains);

  const [searchTerm, setSearchTerm] = useState('');

  const selectedPartnerOptions = PARTNER_OPTIONS.filter(opt => partners.includes(opt.value));

  const grouped = useMemo(
    () => groupSidebarByDomain(sidebar, tagsDocId),
    [sidebar, tagsDocId]
  );

  const { filtered: filteredGrouped, matchingDocIds } = useMemo(
    () => filterGroupedByPartner(grouped.grouped, partners, tagsDocId),
    [grouped.grouped, partners, tagsDocId]
  );

  const handlePartnersChange = (selected) => {
    setPartners(selected.map(opt => opt.value));
  };

  const handleResetFilters = () => {
    resetFilters();
    window.history.replaceState({}, '', location.pathname);
  };

  const resultCount = partners.length > 0
    ? matchingDocIds.size
    : countUniqueDocsInItems(Object.values(filteredGrouped).flat(), tagsDocId);

  const domainCategories = buildDomainCategories(filteredGrouped, expandedDomains);

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
  const setPartners = useSidebarFilterStore(state => state.setPartners);
  const setExpandedDomains = useSidebarFilterStore(state => state.setExpandedDomains);
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const history = useHistory();
  const docsBase = useBaseUrl('/docs');
  const location = useLocation();
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin']?.default?.docIdToTags;

  useEffect(() => {
    if (!location.pathname.startsWith(docsBase)) return;
    if (!shouldShowFilters) return;
    if (!tagsDocId) return;
    if (!props.sidebar) return;

    const params = new URLSearchParams(location.search);
    const partnersParam = params.get('partners');
    const expandedParam = params.get('expanded');

    if (partnersParam) setPartners(partnersParam.split(','));

    if (expandedParam) {
      setExpandedDomains(expandedParam.split(','));
      return;
    }

    const docId = findDocByPath(props.sidebar, location.pathname);

    if (docId && tagsDocId[docId]) {
      const docTags = tagsDocId[docId] || [];
      const domainIds = DOMAIN_DEFINITIONS.map(d => d.id);

      const matchingDomains = domainIds.filter(domainId => {
        if (docTags.includes(domainId)) return true;
        const domainTags = categoryIdToTags[domainId] || [];
        return domainTags.some(tag => docTags.includes(tag));
      });

      if (matchingDomains.length > 0) {
        setExpandedDomains(matchingDomains);
      }
    }
  }, [location.pathname, location.search, docsBase, setPartners, setExpandedDomains, shouldShowFilters, tagsDocId, props.sidebar]);

  useEffect(() => {
    return history.listen(loc => {
      logger.info("Route changed:", loc.pathname);
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
