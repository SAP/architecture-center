import tagsMap from '@site/src/constant/tagsMapping.json';

// =============================================================================
// Types
// =============================================================================

export interface DocMetadata {
  tags: string[];
  lastUpdateDate: string | null;
}

export interface FilterState {
  partners: string[];
  showArchived: boolean;
  showCommunityContent: boolean;
  showRecentlyUpdated: boolean;
}

// Type alias for the docIdToTags map
export type DocIdToTagsMap = Record<string, DocMetadata>;

export interface SidebarDocItem {
  type: 'doc';
  id?: string;
  docId?: string;
  href?: string;
  label?: string;
}

export interface SidebarLinkItem {
  type: 'link';
  id?: string;
  docId?: string;
  href?: string;
  label?: string;
}

export interface SidebarCategoryItem {
  type: 'category';
  label?: string;
  href?: string;
  items?: SidebarItem[];
  link?: { id?: string };
  collapsible?: boolean;
  collapsed?: boolean;
  customProps?: Record<string, unknown>;
}

export type SidebarItem = SidebarDocItem | SidebarLinkItem | SidebarCategoryItem;

// =============================================================================
// Constants
// =============================================================================

export const DOMAIN_DEFINITIONS = [
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'appdev', label: 'Application Dev. & Automation' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'integration', label: 'Integration' },
  { id: 'opsec', label: 'Operation & Security' },
];

export const PARTNER_OPTIONS = [
  { value: 'aws', label: 'Amazon Web Services' },
  { value: 'azure', label: 'Microsoft Azure' },
  { value: 'gcp', label: 'Google Cloud Platform' },
  { value: 'databricks', label: 'Databricks' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'nvidia', label: 'Nvidia' },
  { value: 'ibm', label: 'IBM' }
];

export const RECENT_MONTHS = 3;
export const RECENT_FILTER_LABEL = `Last ${RECENT_MONTHS} Months`;

// Cutoff for the "recently updated" window: midnight UTC, RECENT_MONTHS calendar
// months before today (UTC). Computed entirely in UTC so it lines up with the
// UTC-midnight dates parsed from `YYYY-MM-DD` front matter, and the day is clamped
// to the target month's length so subtracting from, say, the 31st does not roll the
// boundary into the following month.
function getRecentCutoffDate(): Date {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  const targetMonth = month - RECENT_MONTHS;
  // Day 0 of the month after the target month is the target month's last day.
  const lastDayOfTargetMonth = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, targetMonth, Math.min(day, lastDayOfTargetMonth)));
}

export const categoryIdToTags = Object.entries(tagsMap).reduce((acc, [tagKey, meta]) => {
  const cat = meta?.categoryid;
  if (!cat) return acc;
  (acc[cat] ??= []).push(tagKey);
  return acc;
}, {} as Record<string, string[]>);

// =============================================================================
// Document ID Matching Utilities
// =============================================================================

const HEX_ID_PATTERN = /([a-f0-9]{6})$/i;

export function extractHexId(path: string): string | null {
  const match = path.match(HEX_ID_PATTERN);
  return match ? match[1] : null;
}

export function findDocIdByHexId(hexId: string, docIdToTags: DocIdToTagsMap): string | null {
  for (const docId of Object.keys(docIdToTags)) {
    if (docId.endsWith(hexId) || docId.endsWith(`/${hexId}`)) {
      return docId;
    }
  }
  return null;
}

export function getDocTags(docId: string, docIdToTags: DocIdToTagsMap): string[] {
  if (!docId || !docIdToTags) return [];

  if (docIdToTags[docId]) {
    return docIdToTags[docId].tags;
  }

  const hexId = extractHexId(docId);
  if (hexId) {
    const fullDocId = findDocIdByHexId(hexId, docIdToTags);
    if (fullDocId) {
      return docIdToTags[fullDocId].tags;
    }
  }

  return [];
}

export function getDocLastUpdateDate(docId: string, docIdToTags: DocIdToTagsMap): string | null {
  if (!docId || !docIdToTags) return null;

  if (docIdToTags[docId]) {
    return docIdToTags[docId].lastUpdateDate;
  }

  const hexId = extractHexId(docId);
  if (hexId) {
    const fullDocId = findDocIdByHexId(hexId, docIdToTags);
    if (fullDocId) {
      return docIdToTags[fullDocId].lastUpdateDate;
    }
  }

  return null;
}

export function isDocArchived(docId: string, docIdToTags: DocIdToTagsMap): boolean {
  return getDocTags(docId, docIdToTags).includes('archive');
}

export function isDocRecentlyUpdated(docId: string, docIdToTags: DocIdToTagsMap): boolean {
  const lastUpdateDate = getDocLastUpdateDate(docId, docIdToTags);
  if (!lastUpdateDate) return false;

  const docDate = new Date(lastUpdateDate);
  return docDate >= getRecentCutoffDate();
}

export function findDocIdFromPath(pathname: string, tagsDocId: DocIdToTagsMap): string | null {
  if (!tagsDocId || !pathname) return null;

  const normalizedPath = pathname.replace(/\/$/, '');
  const hexId = extractHexId(normalizedPath);

  if (hexId) {
    return findDocIdByHexId(hexId, tagsDocId);
  }

  return null;
}

// =============================================================================
// Sidebar Item Utilities
// =============================================================================

// Get document ID from a sidebar item (doc, link, or category)
export function getItemDocId(item: SidebarItem, docIdToTags?: DocIdToTagsMap): string | null {
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
export function itemBelongsToDomain(item: SidebarItem, domainId: string, docIdToTags: DocIdToTagsMap): boolean {
  const docId = getItemDocId(item, docIdToTags);
  if (!docId) return false;

  const tags = docIdToTags?.[docId]?.tags || [];
  if (tags.includes(domainId)) return true;

  const domainTags = categoryIdToTags[domainId] || [];
  return domainTags.some(tag => tags.includes(tag));
}

// Check if category or any descendant belongs to domain
export function categoryOrDescendantBelongsToDomain(category: SidebarCategoryItem, domainId: string, docIdToTags: DocIdToTagsMap): boolean {
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

// =============================================================================
// Counting Utilities
// =============================================================================

// Count total docs in items (for domain category badge)
export function countTotalDocsInItems(items: SidebarItem[]): number {
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
export function countUniqueDocsInItems(items: SidebarItem[], docIdToTags: DocIdToTagsMap, seenIds?: Set<string>): number {
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

// =============================================================================
// Sidebar Filtering Functions
// =============================================================================

export function filterArchivedItems(items: SidebarItem[], docIdToTags: DocIdToTagsMap, showArchived: boolean): SidebarItem[] {
  const filterItem = (item: SidebarItem): SidebarItem | null => {
    if (item.type === 'doc' || item.type === 'link') {
      const docId = item.docId || item.id;
      const isArchived = docId && isDocArchived(docId, docIdToTags);

      // Keep ONLY archived docs or ONLY non-archived docs
      if (showArchived) {
        return isArchived ? item : null;
      } else {
        return isArchived ? null : item;
      }
    }

    if (item.type === 'category') {
      // Check if the category itself is archived
      const categoryDocId = getItemDocId(item, docIdToTags);
      const isCategoryArchived = categoryDocId && isDocArchived(categoryDocId, docIdToTags);

      // In non-archived view, immediately exclude archived categories
      if (!showArchived && isCategoryArchived) {
        return null;
      }

      // Recursively filter children (handles both views)
      const filteredItems = (item.items || [])
        .map(filterItem)
        .filter((i): i is SidebarItem => i !== null);

      // Determine if category should be kept based on filtered children
      if (filteredItems.length === 0) {
        if (showArchived) {
          // In archived view with no archived children: only keep if category itself is archived
          if (!isCategoryArchived) {
            return null;
          }
        } else {
          // In non-archived view with no children: only keep if category has its own link
          if (!item.link?.id && !item.href) {
            return null;
          }
        }
      }

      return { ...item, items: filteredItems };
    }

    return item;
  };

  return items.map(filterItem).filter((i): i is SidebarItem => i !== null);
}

// Get all matching document IDs for given partner tags directly from docIdToTags
export function getMatchingDocIds(docIdToTags: DocIdToTagsMap, partnerTags: string[]): Set<string> {
  const matchingIds = new Set<string>();

  if (!docIdToTags || !partnerTags.length) return matchingIds;

  for (const [docId, metadata] of Object.entries(docIdToTags)) {
    const tags = metadata?.tags;
    if (tags && partnerTags.some(tag => tags.includes(tag))) {
      matchingIds.add(docId);
    }
  }

  return matchingIds;
}

// Get all document IDs that were updated within the recent period
export function getRecentlyUpdatedDocIds(docIdToTags: DocIdToTagsMap): Set<string> {
  const matchingIds = new Set<string>();

  if (!docIdToTags) return matchingIds;

  const cutoff = getRecentCutoffDate();

  for (const [docId, metadata] of Object.entries(docIdToTags)) {
    const lastUpdateDate = metadata?.lastUpdateDate;
    if (lastUpdateDate) {
      const docDate = new Date(lastUpdateDate);
      if (docDate >= cutoff) {
        matchingIds.add(docId);
      }
    }
  }

  return matchingIds;
}

// =============================================================================
// Domain Grouping
// =============================================================================

export function groupSidebarByDomain(items: SidebarItem[], docIdToTags: DocIdToTagsMap) {
  const domainIds = DOMAIN_DEFINITIONS.map(d => d.id);
  const grouped: Record<string, SidebarItem[]> = {};

  domainIds.forEach(id => { grouped[id] = []; });

  // Recursively filter category for domain - Returns null if category should be excluded
  const filterCategoryForDomain = (category: SidebarCategoryItem, domainId: string): SidebarCategoryItem | null => {
    const filteredItems: SidebarItem[] = [];

    for (const child of category.items || []) {
      if (child.type === 'doc' || child.type === 'link') {
        if (itemBelongsToDomain(child, domainId, docIdToTags)) {
          filteredItems.push(child);
        }
      } else if (child.type === 'category') {
        if (categoryOrDescendantBelongsToDomain(child, domainId, docIdToTags)) {
          const filteredChild = filterCategoryForDomain(child, domainId);
          if (filteredChild) {
            filteredItems.push(filteredChild);
          }
        }
      }
    }

    // If category has no children after domain filtering, check if it should be excluded
    if (filteredItems.length === 0) {
      const categoryDocId = getItemDocId(category, docIdToTags);
      const isCategoryArchived = categoryDocId && isDocArchived(categoryDocId, docIdToTags);

      // Check if the category originally had children (before domain filtering)
      const hadChildrenBeforeDomainFiltering = (category.items || []).length > 0;

      if (!isCategoryArchived && hadChildrenBeforeDomainFiltering) {
        // Check if original children were archived (indicating we're in archive view context)
        const hadArchivedChildren = (category.items || []).some((child: SidebarItem) => {
          const childDocId = getItemDocId(child, docIdToTags);
          return childDocId && isDocArchived(childDocId, docIdToTags);
        });

        if (hadArchivedChildren) {
          // Archive view: exclude non-archived parent with no archived children in this domain
          return null;
        } else {
          // Normal view: keep only if category itself belongs to this domain
          const categoryBelongsToDomain = itemBelongsToDomain(category, domainId, docIdToTags);
          if (!categoryBelongsToDomain) {
            return null;
          }
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
          const filteredCategory = filterCategoryForDomain(item, domainId);
          if (filteredCategory) {
            grouped[domainId].push(filteredCategory);
          }
        }
      }
    });
  });

  return { grouped };
}

// =============================================================================
// Partner & Community Content Filtering
// =============================================================================

// Generic helper to filter grouped items by a set of matching document IDs
function filterGroupedByMatchingDocIds(
  grouped: Record<string, SidebarItem[]>,
  matchingDocIds: Set<string>,
  docIdToTags: DocIdToTagsMap
): Record<string, SidebarItem[]> {
  // Recursively filter category to only include matching items
  const filterCategory = (category: SidebarCategoryItem, domainId: string): SidebarCategoryItem | null => {
    const filteredItems: SidebarItem[] = [];

    for (const child of category.items || []) {
      if (child.type === 'doc' || child.type === 'link') {
        const childId = getItemDocId(child, docIdToTags);
        if (childId && matchingDocIds.has(childId)) {
          filteredItems.push(child);
        }
      } else if (child.type === 'category') {
        const filteredChild = filterCategory(child, domainId);
        if (filteredChild) {
          filteredItems.push(filteredChild);
        }
      }
    }

    const categoryDocId = getItemDocId(category, docIdToTags);
    const categoryMatches = categoryDocId && matchingDocIds.has(categoryDocId);

    if (filteredItems.length > 0) {
      return { ...category, items: filteredItems };
    }

    if (categoryMatches && itemBelongsToDomain(category, domainId, docIdToTags)) {
      return { ...category, items: [] };
    }

    return null;
  };

  const filtered: Record<string, SidebarItem[]> = {};

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

  return filtered;
}

// Filter by partner tags
export function filterGroupedByPartner(
  grouped: Record<string, SidebarItem[]>,
  selectedPartners: string[],
  docIdToTags: DocIdToTagsMap
): { filtered: Record<string, SidebarItem[]>; matchingDocIds: Set<string> } {
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
  const filtered = filterGroupedByMatchingDocIds(grouped, matchingDocIds, docIdToTags);

  return { filtered, matchingDocIds };
}

// Filter by community content tag
export function filterGroupedByCommunityContent(
  grouped: Record<string, SidebarItem[]>,
  showCommunityContent: boolean,
  docIdToTags: DocIdToTagsMap
): { filtered: Record<string, SidebarItem[]>; matchingDocIds: Set<string> } {
  // If not filtering for community content, return all items
  if (!showCommunityContent) {
    return { filtered: grouped, matchingDocIds: new Set() };
  }

  // Get all document IDs that have the community-contrib tag
  const matchingDocIds = getMatchingDocIds(docIdToTags, ['community-contrib']);
  const filtered = filterGroupedByMatchingDocIds(grouped, matchingDocIds, docIdToTags);

  return { filtered, matchingDocIds };
}

// Filter by recently updated (last 3 months)
export function filterGroupedByRecentlyUpdated(
  grouped: Record<string, SidebarItem[]>,
  showRecentlyUpdated: boolean,
  docIdToTags: DocIdToTagsMap
): { filtered: Record<string, SidebarItem[]>; matchingDocIds: Set<string> } {
  // If not filtering for recently updated, return all items
  if (!showRecentlyUpdated) {
    return { filtered: grouped, matchingDocIds: new Set() };
  }

  // Get all document IDs that were recently updated
  const matchingDocIds = getRecentlyUpdatedDocIds(docIdToTags);
  const filtered = filterGroupedByMatchingDocIds(grouped, matchingDocIds, docIdToTags);

  return { filtered, matchingDocIds };
}

// =============================================================================
// Build Domain Categories for Rendering
// =============================================================================

export function buildDomainCategories(
  filteredGrouped: Record<string, SidebarItem[]>,
  expandedDomains: string[]
): SidebarCategoryItem[] {
  return DOMAIN_DEFINITIONS.map(domain => {
    const domainItems = filteredGrouped[domain.id] || [];
    const docCount = countTotalDocsInItems(domainItems);

    return {
      type: 'category' as const,
      label: `${domain.label} (${docCount})`,
      items: domainItems,
      collapsible: true,
      collapsed: !expandedDomains.includes(domain.id),
      customProps: { domainId: domain.id }
    };
  }).filter(category => category.items.length > 0);
}

// =============================================================================
// URL Parameter Synchronization
// =============================================================================

// Ensures all active filters are preserved when changing any single filter.
export function syncUrlParams(
  currentParams: URLSearchParams,
  state: FilterState,
  updates: Partial<{
    partners: string[] | null;
    archive: boolean | null;
    communityContent: boolean | null;
    recentlyUpdated: boolean | null;
  }>
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  // Handle partners
  if (updates.partners !== undefined) {
    if (updates.partners && updates.partners.length > 0) {
      params.set('partners', updates.partners.join(','));
    } else {
      params.delete('partners');
    }
  } else if (state.partners.length > 0 && !params.get('partners')) {
    params.set('partners', state.partners.join(','));
  }

  // Handle archive
  if (updates.archive !== undefined) {
    if (updates.archive) {
      params.set('archive', 'true');
    } else {
      params.delete('archive');
    }
  } else if (state.showArchived && !params.get('archive')) {
    params.set('archive', 'true');
  }

  // Handle communityContent
  if (updates.communityContent !== undefined) {
    if (updates.communityContent) {
      params.set('communityContent', 'true');
    } else {
      params.delete('communityContent');
    }
  } else if (state.showCommunityContent && !params.get('communityContent')) {
    params.set('communityContent', 'true');
  }

  // Handle recentlyUpdated
  if (updates.recentlyUpdated !== undefined) {
    if (updates.recentlyUpdated) {
      params.set('recent', 'true');
    } else {
      params.delete('recent');
    }
  } else if (state.showRecentlyUpdated && !params.get('recent')) {
    params.set('recent', 'true');
  }

  // Clean up legacy param
  params.delete('techDomains');

  return params;
}

// =============================================================================
// Filter Result Computation
// =============================================================================

// Computes filtered sidebar results for a given filter configuration
export function computeFilteredResults(
  sidebar: SidebarItem[],
  tagsDocId: DocIdToTagsMap,
  config: {
    showArchived: boolean;
    partners: string[];
    showCommunityContent: boolean;
    showRecentlyUpdated: boolean;
  }
): Record<string, SidebarItem[]> {
  const archivedFiltered = filterArchivedItems(sidebar, tagsDocId, config.showArchived);
  const grouped = groupSidebarByDomain(archivedFiltered, tagsDocId);
  const partnerFiltered = filterGroupedByPartner(grouped.grouped, config.partners, tagsDocId).filtered;
  const communityFiltered = filterGroupedByCommunityContent(partnerFiltered, config.showCommunityContent, tagsDocId).filtered;
  const recentlyUpdatedFiltered = filterGroupedByRecentlyUpdated(communityFiltered, config.showRecentlyUpdated, tagsDocId).filtered;
  return recentlyUpdatedFiltered;
}

// =============================================================================
// Navigation Utilities
// =============================================================================

// Find if any item (doc, link, or category) matches the pathname
export function findItemByPath(items: SidebarItem[], pathname: string): boolean {
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      if (item.href === pathname || (item.href && pathname.startsWith(item.href))) {
        return true;
      }
    } else if (item.type === 'category') {
      if (item.href && (item.href === pathname || pathname.startsWith(item.href))) {
        return true;
      }
      if (item.items && findItemByPath(item.items, pathname)) {
        return true;
      }
    }
  }
  return false;
}

// Check if a document exists in the filtered results
export function docExistsInFilteredResults(
  pathname: string,
  filteredGrouped: Record<string, SidebarItem[]>
): boolean {
  const allFilteredItems = Object.values(filteredGrouped).flat();
  return findItemByPath(allFilteredItems, pathname);
}

// Determines navigation behavior after filter change
export function determineNavigation(
  pathname: string,
  params: URLSearchParams,
  filteredResults: Record<string, SidebarItem[]>,
  tagsDocId: DocIdToTagsMap,
  refArchBase: string
): { navigate: boolean; url: string } {
  const willDocExist = docExistsInFilteredResults(pathname, filteredResults);
  const resultCount = countUniqueDocsInItems(Object.values(filteredResults).flat(), tagsDocId);

  if (resultCount === 0 || !willDocExist) {
    // Navigate to base with params
    const paramStr = params.toString();
    return {
      navigate: true,
      url: paramStr ? `${refArchBase}?${paramStr}` : refArchBase
    };
  }

  // Stay on current document
  const paramStr = params.toString();
  return {
    navigate: false,
    url: paramStr ? `${pathname}?${paramStr}` : pathname
  };
}

export function findDocByPath(items: SidebarItem[], pathname: string): string | null {
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      if (item.href === pathname || (item.href && pathname.startsWith(item.href))) {
        return item.docId || item.id || null;
      }
    } else if (item.type === 'category' && item.items) {
      const found = findDocByPath(item.items, pathname);
      if (found) return found;
    }
  }
  return null;
}

// Check if a document exists in the archived sidebar view (as a category as well)
export function docExistsInArchivedView(
  docId: string,
  pathname: string,
  sidebar: SidebarItem[],
  tagsDocId: DocIdToTagsMap
): boolean {
  if (isDocArchived(docId, tagsDocId)) {
    return true;
  }

  const archivedSidebar = filterArchivedItems(sidebar, tagsDocId, true);
  const foundInArchived = findItemByPath(archivedSidebar, pathname);
  return foundInArchived;
}

// Check if a document exists in the recently updated sidebar view (as a parent category as well).
// `precomputedView` lets the caller pass an already-filtered recently-updated tree so this does
// not re-filter the whole sidebar on every navigation; it falls back to computing one if omitted.
export function docExistsInRecentlyUpdatedView(
  docId: string,
  pathname: string,
  sidebar: SidebarItem[],
  tagsDocId: DocIdToTagsMap,
  precomputedView?: Record<string, SidebarItem[]>
): boolean {
  // If the doc itself is recently updated, it's directly in the view
  if (isDocRecentlyUpdated(docId, tagsDocId)) {
    return true;
  }

  // Check if the document appears in the filtered view (e.g., as a parent category)
  const filteredResults = precomputedView ?? computeFilteredResults(sidebar, tagsDocId, {
    showArchived: false,
    partners: [],
    showCommunityContent: false,
    showRecentlyUpdated: true
  });

  // Check if path exists in any domain's filtered items
  for (const items of Object.values(filteredResults)) {
    if (findItemByPath(items, pathname)) {
      return true;
    }
  }

  return false;
}

// Find which domains contain a document in the filtered/grouped results
export function findDomainsContainingPath(
  pathname: string,
  filteredGrouped: Record<string, SidebarItem[]>
): string[] {
  const matchingDomains: string[] = [];

  for (const [domainId, items] of Object.entries(filteredGrouped)) {
    if (findItemByPath(items, pathname)) {
      matchingDomains.push(domainId);
    }
  }

  return matchingDomains;
}
