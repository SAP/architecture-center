import React, { useMemo, useEffect } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import { NavbarSecondaryMenuFiller, useWindowSize } from '@docusaurus/theme-common';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import SidebarFilters from '@site/src/components/SidebarFilters/SidebarFilters';
import styles from './styles.module.css';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';

function filterSidebarItems(items, selectedTechDomains) {
    if (selectedTechDomains.length === 0) {
        return items;
    }
    return items.reduce((acc, item) => {
        const checkItem = (currentItem) => {
            const categoryIndex = Array.isArray(currentItem.customProps?.category_index)
                ? currentItem.customProps.category_index
                : [];
            return selectedTechDomains.every((domainKey) => categoryIndex.includes(domainKey));
        };
        if (item.type === 'category') {
            if (checkItem(item)) {
                acc.push(item);
            } else {
                const filteredChildren = filterSidebarItems(item.items, selectedTechDomains);
                if (filteredChildren.length > 0) {
                    acc.push({ ...item, items: filteredChildren });
                }
            }
        } else if (item.type === 'doc' || item.type === 'link') {
            if (checkItem(item)) {
                acc.push(item);
            }
        } else {
            acc.push(item);
        }
        return acc;
    }, []);
}

// ============================================================================
// Desktop Version
// ============================================================================
function DocSidebarDesktop(props) {
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

    const filteredSidebar = useMemo(() => filterSidebarItems(props.sidebar, techDomains), [props.sidebar, techDomains]);

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
