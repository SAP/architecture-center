import React, { useState, useEffect } from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { Plus, Eye, ChevronDown } from 'lucide-react';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew?: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, openDocument } = usePageDataStore();
    const [raExpanded, setRaExpanded] = useState(false);
    const [articleExpanded, setArticleExpanded] = useState(false);

    // Expand only the section matching the active document
    useEffect(() => {
        if (!activeDocumentId) return;
        const activeDoc = documents.find((d) => d.id === activeDocumentId);
        if (activeDoc?.type === 'article') {
            setArticleExpanded(true);
            setRaExpanded(false);
        } else {
            setRaExpanded(true);
            setArticleExpanded(false);
        }
    }, [activeDocumentId, documents]);

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

    const rootDocs = documents.filter((d) => d.parentId === null);
    const myRaDocs = rootDocs.filter((d) => !d.isReadOnly && d.type !== 'article');
    const sharedRaDocs = rootDocs.filter((d) => d.isReadOnly);
    const myArticleDocs = rootDocs.filter((d) => !d.isReadOnly && d.type === 'article');

    const hasRaDocs = myRaDocs.length > 0 || sharedRaDocs.length > 0;
    const hasArticleDocs = myArticleDocs.length > 0;

    return (
        <div className={styles.navContainer}>
            {onAddNew && (
                <button
                    className={styles.newRefArchButton}
                    onClick={() => onAddNew(null)}
                    title="Create new Document"
                >
                    <span>New Document</span>
                    <Plus size={18} />
                </button>
            )}
            {onAddNew && (hasRaDocs || hasArticleDocs) && (
                <div className={styles.sectionDivider} />
            )}
            <div className={styles.documentsList}>
                {!hasRaDocs && !hasArticleDocs && (
                    <div className={styles.emptyState}>No documents yet. Create your first!</div>
                )}

                {hasRaDocs && (
                    <div className={styles.sectionGroup}>
                        <button
                            className={styles.sectionToggle}
                            onClick={() => setRaExpanded((v) => !v)}
                        >
                            <span>My Reference Architectures</span>
                            <ChevronDown
                                size={14}
                                className={`${styles.chevronIcon} ${raExpanded ? styles.chevronExpanded : ''}`}
                            />
                        </button>
                        {raExpanded && (
                            <div className={styles.sectionContent}>
                                {myRaDocs.map((doc) => renderDocumentTree(doc))}
                                {sharedRaDocs.length > 0 && (
                                    <>
                                        <div className={styles.sharedWithMeHeader}>
                                            <Eye size={12} />
                                            <span>Shared with Me</span>
                                        </div>
                                        <div className={styles.sharedSection}>
                                            {sharedRaDocs.map((doc) => renderDocumentTree(doc, true))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {hasRaDocs && hasArticleDocs && (
                    <div className={styles.sectionDivider} />
                )}

                {hasArticleDocs && (
                    <div className={styles.sectionGroup}>
                        <button
                            className={styles.sectionToggle}
                            onClick={() => setArticleExpanded((v) => !v)}
                        >
                            <span>My Articles</span>
                            <ChevronDown
                                size={14}
                                className={`${styles.chevronIcon} ${articleExpanded ? styles.chevronExpanded : ''}`}
                            />
                        </button>
                        {articleExpanded && (
                            <div className={styles.sectionContent}>
                                {myArticleDocs.map((doc) => renderDocumentTree(doc))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageTabs;
