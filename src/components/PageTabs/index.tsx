import React from 'react';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, setActiveDocumentId, deleteDocument } = usePageDataStore();
    const rootDocuments = documents.filter((doc) => doc.parentId === null);

    const firstPage = rootDocuments[0];
    const otherPages = rootDocuments.slice(1);

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.navContainer}>
            {firstPage && (
                <div
                    className={`${styles.navItem} ${styles.rootItem} ${
                        firstPage.id === activeDocumentId ? styles.active : ''
                    }`}
                    onClick={() => setActiveDocumentId(firstPage.id)}
                >
                    <span className={styles.itemTitle} title={firstPage.title || 'Untitled Page'}>
                        {firstPage.title || 'Untitled Page'}
                    </span>
                    <div className={styles.itemActions}>
                        <button
                            className={styles.actionButton}
                            onClick={(e) => {
                                handleActionClick(e);
                                onAddNew(null);
                            }}
                            title="Add new page"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {otherPages.length > 0 && (
                <ul className={styles.childrenList}>
                    {otherPages.map((doc) => (
                        <li
                            key={doc.id}
                            className={`${styles.navItem} ${doc.id === activeDocumentId ? styles.active : ''}`}
                            onClick={() => setActiveDocumentId(doc.id)}
                        >
                            <span className={styles.itemTitle} title={doc.title || 'Untitled Page'}>
                                {doc.title || 'Untitled Page'}
                            </span>
                            <div className={styles.itemActions}>
                                <button
                                    className={styles.actionButton}
                                    onClick={(e) => {
                                        handleActionClick(e);
                                        deleteDocument(doc.id);
                                    }}
                                    title="Delete page"
                                >
                                    −
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PageTabs;
