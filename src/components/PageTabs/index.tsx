import React from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Button, Icon } from '@ui5/webcomponents-react';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface PageTabsProps {
    onAddNew: (parentId: string | null) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ onAddNew }) => {
    const { documents, activeDocumentId, setActiveDocumentId } = usePageDataStore();

    const handleActionClick = (e: React.MouseEvent) => {
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
                    onClick={() => setActiveDocumentId(doc.id)}
                >
                    <span className={styles.itemTitle} title={doc.title || 'Untitled Page'}>
                        {doc.title || 'Untitled Page'}
                    </span>
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

    return <div className={styles.navContainer}>{rootDocuments.map((doc) => renderDocumentTree(doc))}</div>;
};

export default PageTabs;
