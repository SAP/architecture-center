import { useState, useMemo } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import {
  FilterState,
  PARTNER_OPTIONS,
  filterArchivedItems,
  groupSidebarByDomain,
  filterGroupedByPartner,
  filterGroupedByCommunityContent,
  buildDomainCategories,
  countUniqueDocsInItems,
  syncUrlParams,
  computeFilteredResults,
  determineNavigation,
  docExistsInFilteredResults,
} from './filterUtils';

export { PARTNER_OPTIONS };

/**
 * Custom hook that provides all filter navigation handlers.
 * Shared between Desktop and Mobile sidebar components.
 */
export function useFilterNavigation(
  sidebar: any[],
  tagsDocId: Record<string, string[]>
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
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const expandedDomains = useSidebarFilterStore(state => state.expandedDomains);

  const [searchTerm, setSearchTerm] = useState('');

  const currentState: FilterState = { partners, showArchived, showCommunityContent };

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

  const { filtered: filteredGrouped } = useMemo(
    () => filterGroupedByCommunityContent(partnerFiltered, showCommunityContent, tagsDocId),
    [partnerFiltered, showCommunityContent, tagsDocId]
  );

  const selectedPartnerOptions = useMemo(
    () => PARTNER_OPTIONS.filter(opt => partners.includes(opt.value)),
    [partners]
  );

  const resultCount = countUniqueDocsInItems(Object.values(filteredGrouped).flat(), tagsDocId);
  const domainCategories = buildDomainCategories(filteredGrouped, expandedDomains);

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
      showCommunityContent
    });

    const nav = determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase);

    if (nav.navigate) {
      history.replace(nav.url);
    } else {
      window.history.replaceState({}, '', nav.url);
    }
  };

  const handleResetFilters = () => {
    resetFilters();

    // Check if current document exists in the default view (no filters)
    const defaultFiltered = computeFilteredResults(sidebar, tagsDocId, {
      showArchived: false,
      partners: [],
      showCommunityContent: false
    });

    const willDocExist = docExistsInFilteredResults(location.pathname, defaultFiltered);

    if (willDocExist) {
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
      showCommunityContent
    });

    const nav = determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase);

    if (nav.navigate) {
      history.replace(nav.url);
    } else {
      window.history.replaceState({}, '', nav.url);
    }
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
      showCommunityContent: value
    });

    const nav = determineNavigation(location.pathname, params, newFiltered, tagsDocId, refArchBase);

    if (nav.navigate) {
      history.replace(nav.url);
    } else {
      window.history.replaceState({}, '', nav.url);
    }
  };

  return {
    // State
    partners,
    showArchived,
    showCommunityContent,
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
    handleResetFilters,
    handleBackToAllDocuments,
    setSearchTerm,

    // Computed
    isResetEnabled: partners.length > 0 || searchTerm.length > 0 || showArchived || showCommunityContent
  };
}
