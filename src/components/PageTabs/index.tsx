import React from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Button } from '@ui5/webcomponents-react';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { Plus } from 'lucide-react';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew?: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, openDocument } = usePageDataStore();

    const handleActionClick = (e: React.MouseEvent | { stopPropagation: () => void }) => {
        e.stopPropagation();
    };

    const renderDocumentTree = (doc: Document) => {
        const children = documents.filter((child) => child.parentId === doc.id);

        return (
            <div key={doc.id}>
                <div
                    className={`${styles.navItem} ${!doc.parentId ? styles.rootItem : ''} ${
                        doc.id === activeDocumentId ? styles.active : ''
                    }`}
                    onClick={() => openDocument(doc.id)}
                >
                    <span className={styles.itemTitle} title={doc.title || 'Untitled Page'}>
                        {doc.title || 'Untitled Page'}
                    </span>
                    {onAddNew && (
                        <div className={styles.itemActions}>
                            <Button
                                design="Transparent"
                                icon="add"
                                onClick={(e) => {
                                    handleActionClick(e);
                                    onAddNew(doc.id);
                                }}
                                tooltip={'Add sub-page'}
                            />
                        </div>
                    )}
                </div>
                {children.length > 0 && (
                    <ul className={styles.childrenList}>
                        {children.map((child) => (
                            <li key={child.id}>{renderDocumentTree(child)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const rootDocuments = documents.filter((doc) => doc.parentId === null);

    return (
        <div className={styles.navContainer}>
            {onAddNew && (
                <button
                    className={styles.newRefArchButton}
                    onClick={() => onAddNew(null)}
                    title="Create new Reference Architecture"
                >
                    <Plus size={18} />
                    <span>New Ref Arch</span>
                </button>
            )}
            <div className={styles.documentsList}>
                {rootDocuments.map((doc) => renderDocumentTree(doc))}
            </div>
        </div>
    );
};

export default PageTabs;
