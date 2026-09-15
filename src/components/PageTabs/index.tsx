import React from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { Plus, Eye } from 'lucide-react';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew?: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, openDocument } = usePageDataStore();

    const handleActionClick = (e: React.MouseEvent | { stopPropagation: () => void }) => {
        e.stopPropagation();
    };

    const renderDocumentTree = (doc: Document, isSharedSection: boolean = false) => {
        const children = documents.filter((child) => child.parentId === doc.id);
        const canAddSubPage = onAddNew && !doc.isReadOnly;

        return (
            <div key={doc.id}>
                <div
                    className={`${styles.navItem} ${!doc.parentId ? styles.rootItem : ''} ${
                        doc.id === activeDocumentId ? styles.active : ''
                    } ${doc.isReadOnly ? styles.readOnlyItem : ''}`}
                    onClick={() => openDocument(doc.id)}
                >
                    <span className={styles.itemTitle} title={doc.title || 'Untitled Page'}>
                        {doc.title || 'Untitled Page'}
                    </span>
                    {canAddSubPage && (
                        <button
                            className={styles.addSubPageButton}
                            onClick={(e) => {
                                handleActionClick(e);
                                onAddNew(doc.id);
                            }}
                            title="Add sub-page"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                    {doc.isReadOnly && !doc.parentId && (
                        <Eye size={14} className={styles.viewOnlyIcon} />
                    )}
                </div>
                {children.length > 0 && (
                    <ul className={styles.childrenList}>
                        {children.map((child) => (
                            <li key={child.id}>{renderDocumentTree(child, isSharedSection)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    // Separate documents into owned (author) and shared (contributor)
    const rootDocuments = documents.filter((doc) => doc.parentId === null);
    const myDocuments = rootDocuments.filter((doc) => !doc.isReadOnly);
    const sharedDocuments = rootDocuments.filter((doc) => doc.isReadOnly);

    return (
        <div className={styles.navContainer}>
            {onAddNew && (
                <button
                    className={styles.newRefArchButton}
                    onClick={() => onAddNew(null)}
                    title="Create new Reference Architecture"
                >
                    <span>New Ref Arch</span>
                    <Plus size={18} />
                </button>
            )}
            <div className={styles.documentsList}>
                {/* My Documents section */}
                {myDocuments.length > 0 && (
                    <>
                        {sharedDocuments.length > 0 && (
                            <div className={styles.sectionHeader}>My Documents</div>
                        )}
                        {myDocuments.map((doc) => renderDocumentTree(doc))}
                    </>
                )}

                {/* Shared with me section */}
                {sharedDocuments.length > 0 && (
                    <>
                        <div className={styles.sectionDivider} />
                        <div className={styles.sectionHeader}>
                            <span>Shared with me</span>
                            <Eye size={14} className={styles.sectionIcon} />
                        </div>
                        <div className={styles.sharedSection}>
                            {sharedDocuments.map((doc) => renderDocumentTree(doc, true))}
                        </div>
                    </>
                )}

                {/* Empty state */}
                {rootDocuments.length === 0 && (
                    <div className={styles.emptyState}>
                        No documents yet. Create your first Reference Architecture!
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageTabs;
