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

    const renderDocumentTree = (doc: Document) => {
        const children = documents.filter((child) => child.parentId === doc.id);
        const canAddSubPage = onAddNew && !doc.isReadOnly;
        const documentTitle = doc.title || 'Untitled Page';
        const isActive = doc.id === activeDocumentId;

        return (
            <div key={doc.id}>
                <div
                    className={`${styles.navItem} ${!doc.parentId ? styles.rootItem : ''} ${
                        isActive ? styles.active : ''
                    } ${doc.isReadOnly ? styles.readOnlyItem : ''}`}
                >
                    <button
                        type="button"
                        className={styles.documentButton}
                        onClick={() => openDocument(doc.id)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Open ${documentTitle}${doc.isReadOnly ? ' (view only)' : ''}`}
                    >
                        <span className={styles.itemTitle} title={documentTitle}>
                            {documentTitle}
                        </span>
                        {doc.isReadOnly && !doc.parentId && (
                            <Eye
                                size={14}
                                className={styles.viewOnlyIcon}
                                aria-hidden="true"
                                focusable="false"
                            />
                        )}
                    </button>
                    {canAddSubPage && (
                        <button
                            type="button"
                            className={styles.addSubPageButton}
                            onClick={() => onAddNew(doc.id)}
                            aria-label={`Add sub-page to ${documentTitle}`}
                            title="Add sub-page"
                        >
                            <Plus size={18} aria-hidden="true" focusable="false" />
                        </button>
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

    // Separate documents into owned (author) and shared (contributor)
    const rootDocuments = documents.filter((doc) => doc.parentId === null);
    const myDocuments = rootDocuments.filter((doc) => !doc.isReadOnly);
    const sharedDocuments = rootDocuments.filter((doc) => doc.isReadOnly);

    return (
        <nav className={styles.navContainer} aria-label="Reference Architecture documents">
            {onAddNew && (
                <button
                    type="button"
                    className={styles.newRefArchButton}
                    onClick={() => onAddNew(null)}
                    title="Create new Reference Architecture"
                >
                    <span>New Ref Arch</span>
                    <Plus size={18} aria-hidden="true" focusable="false" />
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
                            <Eye
                                size={14}
                                className={styles.sectionIcon}
                                aria-hidden="true"
                                focusable="false"
                            />
                        </div>
                        <div className={styles.sharedSection}>
                            {sharedDocuments.map((doc) => renderDocumentTree(doc))}
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
        </nav>
    );
};

export default PageTabs;
