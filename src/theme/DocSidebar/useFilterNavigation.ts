import { useState, useMemo } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import {
  FilterState,
  DocIdToTagsMap,
  SidebarItem,
  PARTNER_OPTIONS,
  filterArchivedItems,
  groupSidebarByDomain,
  filterGroupedByPartner,
  filterGroupedByCommunityContent,
  filterGroupedByRecentlyUpdated,
  buildDomainCategories,
  countUniqueDocsInItems,
  syncUrlParams,
  computeFilteredResults,
  determineNavigation,
  docExistsInFilteredResults,
  findDomainsContainingPath,
} from './filterUtils';

export { PARTNER_OPTIONS };

/**
 * Custom hook that provides all filter navigation handlers.
 * Shared between Desktop and Mobile sidebar components.
 */
export function useFilterNavigation(
  sidebar: SidebarItem[],
  tagsDocId: DocIdToTagsMap
) {
  const location = useLocation();
  const history = useHistory();
  const refArchBase = useBaseUrl('/docs/ref-arch');

  const partners = useSidebarFilterStore(state => state.partners);
  const setPartners = useSidebarFilterStore(state => state.setPartners);
  const showArchived = useSidebarFilterStore(state => state.showArchived);
  const setShowArchived = useSidebarFilterStore(state => state.setShowArchived);
  const showCommunityContent = useSidebarFilterStore(state => state.showCommunityContent);
  const setShowCommunityContent = useSidebarFilterStore(state => state.setShowCommunityContent);
  const showRecentlyUpdated = useSidebarFilterStore(state => state.showRecentlyUpdated);
  const setShowRecentlyUpdated = useSidebarFilterStore(state => state.setShowRecentlyUpdated);
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const expandedDomains = useSidebarFilterStore(state => state.expandedDomains);
  const setExpandedDomains = useSidebarFilterStore(state => state.setExpandedDomains);

  const [searchTerm, setSearchTerm] = useState('');

  const currentState: FilterState = { partners, showArchived, showCommunityContent, showRecentlyUpdated };

  // Memoized filtered results for current state
  const nonArchivedSidebar = useMemo(
    () => filterArchivedItems(sidebar, tagsDocId, showArchived),
    [sidebar, tagsDocId, showArchived]
  );

  const grouped = useMemo(
    () => groupSidebarByDomain(nonArchivedSidebar, tagsDocId),
    [nonArchivedSidebar, tagsDocId]
  );

  const { filtered: partnerFiltered } = useMemo(
    () => filterGroupedByPartner(grouped.grouped, partners, tagsDocId),
    [grouped.grouped, partners, tagsDocId]
  );

  const { filtered: communityFiltered } = useMemo(
    () => filterGroupedByCommunityContent(partnerFiltered, showCommunityContent, tagsDocId),
    [partnerFiltered, showCommunityContent, tagsDocId]
  );

  const { filtered: filteredGrouped } = useMemo(
    () => filterGroupedByRecentlyUpdated(communityFiltered, showRecentlyUpdated, tagsDocId),
    [communityFiltered, showRecentlyUpdated, tagsDocId]
  );

  const selectedPartnerOptions = useMemo(
    () => PARTNER_OPTIONS.filter(opt => partners.includes(opt.value)),
    [partners]
  );

  const resultCount = countUniqueDocsInItems(Object.values(filteredGrouped).flat(), tagsDocId);
  const domainCategories = buildDomainCategories(filteredGrouped, expandedDomains);

  // Update expanded domains based on which domains contain the current document
  const updateExpandedDomainsForPath = (filtered: Record<string, SidebarItem[]>) => {
    const domainsWithDoc = findDomainsContainingPath(location.pathname, filtered);
    if (domainsWithDoc.length > 0) {
      setExpandedDomains(domainsWithDoc);
    }
  };

  // Apply navigation after filter change
  const applyNavigation = (nav: { navigate: boolean; url: string }) => {
    if (nav.navigate) {
      history.replace(nav.url);
    } else {
      window.history.replaceState({}, '', nav.url);
    }
  };

  const handlePartnersChange = (selected: { value: string; label: string }[]) => {
    const selectedKeys = selected.map(opt => opt.value);
    setPartners(selectedKeys);

    const params = syncUrlParams(
      new URLSearchParams(location.search),
      currentState,
      { partners: selectedKeys.length > 0 ? selectedKeys : null }
    );

    const newFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived,
      partners: selectedKeys,
      showCommunityContent,
      showRecentlyUpdated
    });

    updateExpandedDomainsForPath(newFiltered);
    applyNavigation(determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase));
  };

  const handleResetFilters = () => {
    resetFilters();

    const defaultFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived: false,
      partners: [],
      showCommunityContent: false,
      showRecentlyUpdated: false
    });

    if (docExistsInFilteredResults(location.pathname, defaultFiltered)) {
      updateExpandedDomainsForPath(defaultFiltered);
      window.history.replaceState({}, '', location.pathname);
    } else {
      history.replace(refArchBase);
    }
  };

  const handleBackToAllDocuments = () => {
    resetFilters();
    history.replace(refArchBase);
  };

  const handleArchiveChange = (value: boolean) => {
    setShowArchived(value);

    const params = syncUrlParams(
      new URLSearchParams(location.search),
      currentState,
      { archive: value || null }
    );

    const newFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived: value,
      partners,
      showCommunityContent,
      showRecentlyUpdated
    });

    updateExpandedDomainsForPath(newFiltered);
    applyNavigation(determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase));
  };

  const handleCommunityContentChange = (value: boolean) => {
    setShowCommunityContent(value);

    const params = syncUrlParams(
      new URLSearchParams(location.search),
      currentState,
      { communityContent: value || null }
    );

    const newFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived,
      partners,
      showCommunityContent: value,
      showRecentlyUpdated
    });

    updateExpandedDomainsForPath(newFiltered);
    applyNavigation(determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase));
  };

  const handleRecentlyUpdatedChange = (value: boolean) => {
    setShowRecentlyUpdated(value);

    const params = syncUrlParams(
      new URLSearchParams(location.search),
      currentState,
      { recentlyUpdated: value || null }
    );

    const newFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived,
      partners,
      showCommunityContent,
      showRecentlyUpdated: value
    });

    updateExpandedDomainsForPath(newFiltered);
    applyNavigation(determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase));
  };

  return {
    // State
    partners,
    showArchived,
    showCommunityContent,
    showRecentlyUpdated,
    searchTerm,
    expandedDomains,
    selectedPartnerOptions,
    filteredGrouped,
    resultCount,
    domainCategories,

    // Handlers
    handlePartnersChange,
    handleArchiveChange,
    handleCommunityContentChange,
    handleRecentlyUpdatedChange,
    handleResetFilters,
    handleBackToAllDocuments,
    setSearchTerm,

    // Computed
    isResetEnabled: partners.length > 0 || searchTerm.length > 0 || showArchived || showCommunityContent || showRecentlyUpdated
  };
}
