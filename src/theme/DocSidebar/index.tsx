import React, { useMemo, useEffect } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import useGlobalData from '@docusaurus/useGlobalData';

function filterSidebarItems(items, selectedTechDomains, tagsDocId) {
    if (selectedTechDomains.length === 0) {
        return items;
    }

    const tagMap = {
        ai: 'genai',
        opsec: 'security',
    };

    const searchableTags = selectedTechDomains.map((domain) => tagMap[domain] || domain);

    const matchingIds = new Set();
    for (const [docId, tags] of Object.entries(tagsDocId || {})) {
        if (Array.isArray(tags) && tags.some((tag) => searchableTags.includes(tag))) {
            matchingIds.add(docId);
        }
    }

    const recursiveFilter = (sidebarItems) => {
        return sidebarItems.reduce((acc, item) => {
            const idToCheck = item.docId || item.id;

            // For a document or link, check if its ID is in our whitelist.
            if ((item.type === 'doc' || item.type === 'link') && matchingIds.has(idToCheck)) {
                acc.push(item);
            }
            // For a category, ALWAYS filter its children.
            else if (item.type === 'category') {
                const filteredChildren = recursiveFilter(item.items);
                // Keep the category only if it has children left after filtering.
                if (filteredChildren.length > 0) {
                    acc.push({ ...item, items: filteredChildren });
                }
            }
            return acc;
        }, []);
    };

    return recursiveFilter(items);
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

    if (!shouldShowFilters) {
        return <DocSidebar {...props} />;
    }

    const handleFilterChange = (_filterGroup, selectedKeys) => {
        setTechDomains(selectedKeys);
    };

    const filteredSidebar = useMemo(
        () => filterSidebarItems(props.sidebar, techDomains, tagsDocId),
        [props.sidebar, techDomains, tagsDocId]
    );

    const newProps = { ...props, sidebar: filteredSidebar };

    return (
        <div className={styles.sidebarWithFiltersContainer}>
            <div>
                <SidebarFilters onFilterChange={handleFilterChange} initialValues={{ techDomains }} />
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
    const techDomains = useSidebarFilterStore((state) => state.techDomains);
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);

    const handleFilterChange = (_filterGroup, selectedKeys) => {
        setTechDomains(selectedKeys);
    };

    const filteredSidebar = useMemo(() => filterSidebarItems(sidebar, techDomains), [sidebar, techDomains]);

    return (
        <>
            <SidebarFilters onFilterChange={handleFilterChange} initialValues={{ techDomains }} />
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
