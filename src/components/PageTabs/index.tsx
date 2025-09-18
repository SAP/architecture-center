import React, { useState } from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Button } from '@ui5/webcomponents-react/Button';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, setActiveDocumentId } = usePageDataStore();

    const rootDocuments = documents.filter((doc) => doc.parentId === null);

    const firstPage = rootDocuments[0];
    const otherPages = rootDocuments.slice(1);

    const handleActionClick = (e: any) => {
        e.stopPropagation();
    };

    const getChildDocuments = (parentId: string) => {
        return documents.filter((doc) => doc.parentId === parentId);
    };

    const renderDocumentTree = (doc: any, isRoot: boolean = false) => {
        const children = getChildDocuments(doc.id);

        return (
            <div key={doc.id}>
                <div
                    className={`${styles.navItem} ${isRoot ? styles.rootItem : ''} ${
                        doc.id === activeDocumentId ? styles.active : ''
                    }`}
                    onClick={() => setActiveDocumentId(doc.id)}
                >
                    <span className={styles.itemTitle} title={doc.title || 'Untitled Page'}>
                        {doc.title || 'Untitled Page'}
                    </span>
                    <div className={styles.itemActions}>
                        <Button
                            design="Default"
                            icon="add"
                            onClick={(e) => {
                                handleActionClick(e);
                                onAddNew(isRoot ? null : doc.id);
                            }}
                            tooltip={isRoot ? 'Add new page' : 'Add sub-page'}
                        />
                    </div>
                </div>
                {children.length > 0 && (
                    <ul className={styles.childrenList}>
                        {children.map((child) => (
                            <li key={child.id}>{renderDocumentTree(child, false)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className={styles.navContainer}>
            {firstPage && renderDocumentTree(firstPage, true)}
            {otherPages.length > 0 && (
                <ul className={styles.childrenList}>
                    {otherPages.map((doc) => (
                        <li key={doc.id}>{renderDocumentTree(doc, false)}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PageTabs;
