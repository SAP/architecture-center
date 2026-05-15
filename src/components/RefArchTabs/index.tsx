import React from 'react';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { X, Plus } from 'lucide-react';
import styles from './index.module.css';

interface RefArchTabsProps {
  onAddNew: () => void;
}

export default function RefArchTabs({ onAddNew }: RefArchTabsProps) {
  const {
    documents,
    openDocumentIds,
    activeDocumentId,
    openDocument,
    closeDocument,
    getRootDocumentId,
  } = usePageDataStore();

  // Get the active document's root ID to highlight the correct tab
  const activeRootId = activeDocumentId ? getRootDocumentId(activeDocumentId) : null;

  // Get open root documents
  const openRootDocs = openDocumentIds
    .map(id => documents.find(d => d.id === id))
    .filter(Boolean);

  const handleTabClick = (docId: string) => {
    openDocument(docId);
  };

  const handleCloseTab = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    closeDocument(docId);
  };

  if (openRootDocs.length === 0) {
    return null;
  }

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsList}>
        {openRootDocs.map((doc) => (
          <div
            key={doc!.id}
            className={`${styles.tab} ${doc!.id === activeRootId ? styles.active : ''}`}
            onClick={() => handleTabClick(doc!.id)}
            title={doc!.title || 'Untitled'}
          >
            <span className={styles.tabTitle}>{doc!.title || 'Untitled'}</span>
            <button
              className={styles.closeButton}
              onClick={(e) => handleCloseTab(e, doc!.id)}
              title="Close tab"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        className={styles.addButton}
        onClick={onAddNew}
        title="New Reference Architecture"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
