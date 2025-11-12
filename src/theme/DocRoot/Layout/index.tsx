import React, { useEffect, useState } from 'react';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import { useLocation } from '@docusaurus/router';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import type { Props } from '@theme/DocRoot/Layout';

import styles from './styles.module.css';

export default function DocRootLayout({ children }: Props): JSX.Element {
    const sidebar = useDocsSidebar();
    const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
    // we use that information to hide the sidebar in such case

    const location = useLocation();
    const setPartners = useSidebarFilterStore((s) => s.setPartners);
    const setTechDomains = useSidebarFilterStore((s) => s.setTechDomains);

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const partnersParam = params.get('partners');
        const techDomainsParam = params.get('techDomains');

        // Only update if param is present in the URL
        if (partnersParam !== null) {
            setPartners(partnersParam ? partnersParam.split(',') : []);
        }

        if (techDomainsParam !== null) {
            setTechDomains(techDomainsParam ? techDomainsParam.split(',') : []);
        }
    }, [location.search, setPartners, setTechDomains]);

    return (
        <div className={styles.docsWrapper}>
            <BackToTopButton />
            <div className={styles.docRoot}>
                {sidebar && sidebar.items?.[0].customProps?.id === undefined && (
                    <DocRootLayoutSidebar
                        sidebar={sidebar.items}
                        hiddenSidebarContainer={hiddenSidebarContainer}
                        setHiddenSidebarContainer={setHiddenSidebarContainer}
                    />
                )}
                <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>{children}</DocRootLayoutMain>
            </div>
        </div>
    );
}
