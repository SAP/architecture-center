import tagsMap from '@site/src/constant/tagsMapping.json';

// =============================================================================
// Types
// =============================================================================

export interface FilterState {
  partners: string[];
  showArchived: boolean;
  showCommunityContent: boolean;
}

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

export function findDocIdByHexId(hexId: string, docIdToTags: Record<string, string[]>): string | null {
  for (const docId of Object.keys(docIdToTags)) {
    if (docId.endsWith(hexId) || docId.endsWith(`/${hexId}`)) {
      return docId;
    }
  }
  return null;
}

export function getDocTags(docId: string, docIdToTags: Record<string, string[]>): string[] {
  if (!docId || !docIdToTags) return [];

  if (docIdToTags[docId]) {
    return docIdToTags[docId];
  }

  const hexId = extractHexId(docId);
  if (hexId) {
    const fullDocId = findDocIdByHexId(hexId, docIdToTags);
    if (fullDocId) {
      return docIdToTags[fullDocId];
    }
  }

  return [];
}

export function isDocArchived(docId: string, docIdToTags: Record<string, string[]>): boolean {
  return getDocTags(docId, docIdToTags).includes('archive');
}

export function findDocIdFromPath(pathname: string, tagsDocId: Record<string, string[]>): string | null {
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
export function getItemDocId(item: any, docIdToTags?: Record<string, string[]>): string | null {
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
export function itemBelongsToDomain(item: any, domainId: string, docIdToTags: Record<string, string[]>): boolean {
  const docId = getItemDocId(item, docIdToTags);
  if (!docId) return false;

  const tags = docIdToTags?.[docId] || [];
  if (tags.includes(domainId)) return true;

  const domainTags = categoryIdToTags[domainId] || [];
  return domainTags.some(tag => tags.includes(tag));
}

// Check if category or any descendant belongs to domain
export function categoryOrDescendantBelongsToDomain(category: any, domainId: string, docIdToTags: Record<string, string[]>): boolean {
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
export function countTotalDocsInItems(items: any[]): number {
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
export function countUniqueDocsInItems(items: any[], docIdToTags: Record<string, string[]>, seenIds?: Set<string>): number {
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

export function filterArchivedItems(items: any[], docIdToTags: Record<string, string[]>, showArchived: boolean): any[] {
  const filterItem = (item: any): any | null => {
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

      // Only include or exclude archived categories
      if (showArchived && !isCategoryArchived) {
        // Category itself is not archived, but check children for archived items
      } else if (!showArchived && isCategoryArchived) {
        return null; // Filter out archived categories
      }

      // Recursively filter children
      const filteredItems = (item.items || [])
        .map(filterItem)
        .filter(Boolean);

      // Keep category only if it has matching children
      if (filteredItems.length === 0 && !showArchived) {
        // For non-archived view, keep category if it has a non-archived link
        if (!item.link?.id && !item.href) {
          return null;
        }
      } else if (filteredItems.length === 0 && showArchived) {
        // For archived view, only keep if category itself is archived
        if (!isCategoryArchived) {
          return null;
        }
      }

      return { ...item, items: filteredItems };
    }

    return item;
  };

  return items.map(filterItem).filter(Boolean);
}

// Get all matching document IDs for given partner tags directly from docIdToTags
export function getMatchingDocIds(docIdToTags: Record<string, string[]>, partnerTags: string[]): Set<string> {
  const matchingIds = new Set<string>();

  if (!docIdToTags || !partnerTags.length) return matchingIds;

  for (const [docId, tags] of Object.entries(docIdToTags)) {
    if (tags && partnerTags.some(tag => tags.includes(tag))) {
      matchingIds.add(docId);
    }
  }

  return matchingIds;
}

// =============================================================================
// Domain Grouping
// =============================================================================

export function groupSidebarByDomain(items: any[], docIdToTags: Record<string, string[]>) {
  const domainIds = DOMAIN_DEFINITIONS.map(d => d.id);
  const grouped: Record<string, any[]> = {};

  domainIds.forEach(id => { grouped[id] = []; });

  // Recursively filter category for domain - Returns null if category should be excluded
  const filterCategoryForDomain = (category: any, domainId: string): any | null => {
    const filteredItems = [];

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hadArchivedChildren = (category.items || []).some((child: any) => {
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

// Filter by partner tags
export function filterGroupedByPartner(
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

// Filter by community content tag
export function filterGroupedByCommunityContent(
  grouped: Record<string, any[]>,
  showCommunityContent: boolean,
  docIdToTags: Record<string, string[]>
): { filtered: Record<string, any[]>; matchingDocIds: Set<string> } {
  // If not filtering for community content, return all items
  if (!showCommunityContent) {
    return { filtered: grouped, matchingDocIds: new Set() };
  }

  // Get all document IDs that have the community-contrib tag
  const matchingDocIds = getMatchingDocIds(docIdToTags, ['community-contrib']);

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

// =============================================================================
// Build Domain Categories for Rendering
// =============================================================================

export function buildDomainCategories(
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

  // Clean up legacy param
  params.delete('techDomains');

  return params;
}

// =============================================================================
// Filter Result Computation
// =============================================================================

// Computes filtered sidebar results for a given filter configuration
export function computeFilteredResults(
  sidebar: any[],
  tagsDocId: Record<string, string[]>,
  config: {
    showArchived: boolean;
    partners: string[];
    showCommunityContent: boolean;
  }
): Record<string, any[]> {
  const archivedFiltered = filterArchivedItems(sidebar, tagsDocId, config.showArchived);
  const grouped = groupSidebarByDomain(archivedFiltered, tagsDocId);
  const partnerFiltered = filterGroupedByPartner(grouped.grouped, config.partners, tagsDocId).filtered;
  const communityFiltered = filterGroupedByCommunityContent(partnerFiltered, config.showCommunityContent, tagsDocId).filtered;
  return communityFiltered;
}

// =============================================================================
// Navigation Utilities
// =============================================================================

// Find if any item (doc, link, or category) matches the pathname
export function findItemByPath(items: any[], pathname: string): boolean {
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'link') {
      if (item.href === pathname || pathname.startsWith(item.href)) {
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
  filteredGrouped: Record<string, any[]>
): boolean {
  const allFilteredItems = Object.values(filteredGrouped).flat();
  return findItemByPath(allFilteredItems, pathname);
}

// Determines navigation behavior after filter change
export function determineNavigation(
  pathname: string,
  params: URLSearchParams,
  filteredResults: Record<string, any[]>,
  tagsDocId: Record<string, string[]>,
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

export function findDocByPath(items: any[], pathname: string): string | null {
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

// Check if a document exists in the archived sidebar view (as a category as well)
export function docExistsInArchivedView(
  docId: string,
  pathname: string,
  sidebar: any[],
  tagsDocId: Record<string, string[]>
): boolean {
  if (isDocArchived(docId, tagsDocId)) {
    return true;
  }

  const archivedSidebar = filterArchivedItems(sidebar, tagsDocId, true);
  const foundInArchived = findItemByPath(archivedSidebar, pathname);
  return foundInArchived;
}
