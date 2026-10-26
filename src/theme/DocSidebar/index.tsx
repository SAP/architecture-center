import React, { useEffect } from 'react';
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
import { useHistory, useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Import utilities and hook from separate modules
import {
  DocIdToTagsMap,
  DOMAIN_DEFINITIONS,
  categoryIdToTags,
  isDocArchived,
  isDocRecentlyUpdated,
  findDocIdFromPath,
  docExistsInArchivedView,
  docExistsInRecentlyUpdatedView,
  findDocByPath,
  computeFilteredResults,
  findDomainsContainingPath,
} from './filterUtils';
import { useFilterNavigation, PARTNER_OPTIONS } from './useFilterNavigation';

// ============================================================================
// Desktop Version
// ============================================================================

function DocSidebarDesktop(props) {
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags as DocIdToTagsMap;
  const sidebar = useDocsSidebar();
  const shouldShowFilters = sidebar?.name === 'refarchSidebar';
  const location = useLocation();
  const {
    navbar: { hideOnScroll },
    docs: { sidebar: { hideable } },
  } = useThemeConfig();

  const {
    selectedPartnerOptions,
    resultCount,
    domainCategories,
    searchTerm,
    showArchived,
    showCommunityContent,
    showRecentlyUpdated,
    isResetEnabled,
    handlePartnersChange,
    handleArchiveChange,
    handleCommunityContentChange,
    handleRecentlyUpdatedChange,
    handleResetFilters,
    setSearchTerm
  } = useFilterNavigation(props.sidebar, tagsDocId);

  if (!shouldShowFilters) {
    return <DocSidebar {...props} />;
  }

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
          isResetEnabled={isResetEnabled}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={resultCount}
          showCommunityContent={showCommunityContent}
          onCommunityContentChange={handleCommunityContentChange}
          showArchived={showArchived}
          onArchiveChange={handleArchiveChange}
          showRecentlyUpdated={showRecentlyUpdated}
          onRecentlyUpdatedChange={handleRecentlyUpdatedChange}
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
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin'].default?.docIdToTags as DocIdToTagsMap;

  const {
    selectedPartnerOptions,
    resultCount,
    domainCategories,
    searchTerm,
    showArchived,
    showCommunityContent,
    showRecentlyUpdated,
    isResetEnabled,
    handlePartnersChange,
    handleArchiveChange,
    handleCommunityContentChange,
    handleRecentlyUpdatedChange,
    handleResetFilters,
    setSearchTerm
  } = useFilterNavigation(sidebar, tagsDocId);

  return (
    <>
      <CollapsibleFilterBar
        partners={PARTNER_OPTIONS}
        selectedPartners={selectedPartnerOptions}
        onPartnersChange={handlePartnersChange}
        resetFilters={handleResetFilters}
        isResetEnabled={isResetEnabled}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={resultCount}
        showCommunityContent={showCommunityContent}
        onCommunityContentChange={handleCommunityContentChange}
        showArchived={showArchived}
        onArchiveChange={handleArchiveChange}
        showRecentlyUpdated={showRecentlyUpdated}
        onRecentlyUpdatedChange={handleRecentlyUpdatedChange}
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

export default function DocSidebarWrapper(props) {
  const windowSize = useWindowSize();
  const sidebarContext = useDocsSidebar();
  const shouldShowFilters = sidebarContext?.name === 'refarchSidebar';
  const setPartners = useSidebarFilterStore(state => state.setPartners);
  const setExpandedDomains = useSidebarFilterStore(state => state.setExpandedDomains);
  const setShowArchived = useSidebarFilterStore(state => state.setShowArchived);
  const setShowCommunityContent = useSidebarFilterStore(state => state.setShowCommunityContent);
  const setShowRecentlyUpdated = useSidebarFilterStore(state => state.setShowRecentlyUpdated);
  const resetFilters = useSidebarFilterStore(state => state.resetFilters);
  const history = useHistory();
  const docsBase = useBaseUrl('/docs');
  const location = useLocation();
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin']?.default?.docIdToTags as DocIdToTagsMap;

  useEffect(() => {
    if (!location.pathname.startsWith(docsBase)) return;
    if (!shouldShowFilters) return;
    if (!tagsDocId) return;
    if (!props.sidebar) return;

    const params = new URLSearchParams(location.search);
    const partnersParam = params.get('partners');
    const expandedParam = params.get('expanded');
    const archivedParam = params.get('archive');
    const communityContentParam = params.get('communityContent');
    const recentParam = params.get('recent');

    // Find the current document
    const docIdFromTags = findDocIdFromPath(location.pathname, tagsDocId);
    const docIdFromSidebar = findDocByPath(props.sidebar, location.pathname);
    const docId = docIdFromTags || docIdFromSidebar;

    // Handle partners filter with context-aware logic
    if (partnersParam) {
      setPartners(partnersParam.split(','));
    } else if (docId && tagsDocId[docId]) {
      // Preserve partners during sidebar nav only if they're still relevant
      const currentPartners = useSidebarFilterStore.getState().partners;

      if (currentPartners.length > 0) {
        const docTags = tagsDocId[docId]?.tags || [];

        // Check if current document has ANY of the active partner tags
        const hasMatchingPartner = currentPartners.some(partner =>
          docTags.some((tag: string) => tag.toLowerCase().includes(partner.toLowerCase()))
        );

        // If document matches partners, keep them active and sync URL
        if (hasMatchingPartner) {
          const urlParams = new URLSearchParams(location.search);
          if (!urlParams.get('partners')) {
            urlParams.set('partners', currentPartners.join(','));
            window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
          }
        } else {
          setPartners([]);
        }
      }
    } else {
      setPartners([]);
    }

    const currentShowArchived = useSidebarFilterStore.getState().showArchived;

    if (archivedParam === 'true') {
      setShowArchived(true);
    } else if (docId) {
      const isCurrentDocArchived = isDocArchived(docId, tagsDocId);
      if (isCurrentDocArchived) {
        setShowArchived(true);
      } else if (currentShowArchived) {
        // Check if document exists in archived view (as a parent category with archived children)
        const existsInArchived = docExistsInArchivedView(docId, location.pathname, props.sidebar, tagsDocId);
        if (!existsInArchived) {
          setShowArchived(false);
        }
      } else {
        setShowArchived(false);
      }
    } else {
      setShowArchived(false);
    }

    // Handle community content filter
    const currentShowCommunityContent = useSidebarFilterStore.getState().showCommunityContent;

    if (communityContentParam === 'true') {
      setShowCommunityContent(true);
    } else if (docId && tagsDocId[docId]) {
      // Preserve community content filter during sidebar nav if doc has the tag
      if (currentShowCommunityContent) {
        const docTags = tagsDocId[docId]?.tags || [];
        const isCommunityDoc = docTags.includes('community-contrib');

        if (isCommunityDoc) {
          // Keep filter active and sync URL
          const urlParams = new URLSearchParams(window.location.search);
          if (!urlParams.get('communityContent')) {
            urlParams.set('communityContent', 'true');
            window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
          }
        } else {
          setShowCommunityContent(false);
        }
      }
    } else {
      setShowCommunityContent(false);
    }

    // Handle recently updated filter
    const currentShowRecentlyUpdated = useSidebarFilterStore.getState().showRecentlyUpdated;

    if (recentParam === 'true') {
      setShowRecentlyUpdated(true);
    } else if (docId && tagsDocId[docId]) {
      // Preserve recently updated filter during sidebar nav only if doc is recently updated
      if (currentShowRecentlyUpdated) {
        const isRecentDoc = isDocRecentlyUpdated(docId, tagsDocId);

        if (isRecentDoc) {
          // Keep filter active and sync URL
          const urlParams = new URLSearchParams(window.location.search);
          if (!urlParams.get('recent')) {
            urlParams.set('recent', 'true');
            window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
          }
        } else {
          // Check if document exists in recently updated view (as a parent category with recent children)
          const existsInRecentlyUpdated = docExistsInRecentlyUpdatedView(docId, location.pathname, props.sidebar, tagsDocId, currentShowArchived);
          if (!existsInRecentlyUpdated) {
            setShowRecentlyUpdated(false);
          }
        }
      }
    } else {
      setShowRecentlyUpdated(false);
    }

    if (expandedParam) {
      setExpandedDomains(expandedParam.split(','));
      return;
    }

    // Compute expanded domains based on where document appears in filtered results to ensure consistency with filter handlers
    if (docId) {
      const currentShowArchivedState = useSidebarFilterStore.getState().showArchived;
      const currentPartnersState = useSidebarFilterStore.getState().partners;
      const currentCommunityState = useSidebarFilterStore.getState().showCommunityContent;
      const currentRecentlyUpdatedState = useSidebarFilterStore.getState().showRecentlyUpdated;

      const filteredResults = computeFilteredResults(props.sidebar, tagsDocId, {
        showArchived: currentShowArchivedState,
        partners: currentPartnersState,
        showCommunityContent: currentCommunityState,
        showRecentlyUpdated: currentRecentlyUpdatedState
      });

      const domainsWithDoc = findDomainsContainingPath(location.pathname, filteredResults);

      if (domainsWithDoc.length > 0) {
        setExpandedDomains(domainsWithDoc);
      } else if (tagsDocId[docId]) {
        // Fallback to tag-based matching only if document not found in filtered results
        const docTags = tagsDocId[docId]?.tags || [];
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
    }
  }, [location.pathname, location.search, docsBase, setPartners, setExpandedDomains, setShowArchived, setShowCommunityContent, setShowRecentlyUpdated, shouldShowFilters, tagsDocId, props.sidebar]);

  useEffect(() => {
    return history.listen(loc => {
      if (!loc.pathname.startsWith(docsBase)) {
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
