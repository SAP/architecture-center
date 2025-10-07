import React, { useState, useEffect, JSX } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
import MetadataFormDialog from '@site/src/components/MetaFormDialog';
import ProtectedRoute from '@site/src/components/ProtectedRoute';
import { useAuth } from '@site/src/context/AuthContext';

function EditorComponent({ onAddNew }: { onAddNew: (parentId?: string | null) => void }) {
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);

    if (!activeDocumentId) {
        return <div className={styles.noDocumentSelected}>Please select or create a document.</div>;
    }

    return (
        <BrowserOnly>
            {() => {
                const Editor = require('@site/src/components/Editor').default;
                return <Editor key={activeDocumentId} onAddNew={onAddNew} />;
            }}
        </BrowserOnly>
    );
}

const initialPageData: PageMetadata = {
    title: '',
    tags: [],
    authors: [],
    contributors: [],
};

export default function QuickStart(): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDocData, setNewDocData] = useState<PageMetadata>(initialPageData);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const { documents, addDocument } = usePageDataStore();
    const history = useHistory();
    const { siteConfig } = useDocusaurusContext();
    const baseUrl = siteConfig.baseUrl;
    const { user } = useAuth();

    useEffect(() => {
        if (documents.length === 0) {
            handleAddNew(null);
        }
    }, [documents.length]);

    const handleAddNew = (parentId: string | null = null) => {
        const newDocWithAuthor = {
            ...initialPageData,
            authors: user ? [user.username] : [],
            contributors: user ? [user.username] : [],
        };
        setNewDocData(newDocWithAuthor);
        setCurrentParentId(parentId);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        addDocument(newDocData, currentParentId);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        if (documents.length === 0) {
            history.push(baseUrl);
        }
        setIsModalOpen(false);
    };

    return (
        <Layout>
            <ProtectedRoute>
                <MetadataFormDialog
                    open={isModalOpen}
                    initialData={newDocData}
                    onDataChange={(updates) => setNewDocData((prev) => ({ ...prev, ...updates }))}
                    onSave={handleCreate}
                    onCancel={handleCancel}
                />
                <main className={styles.pageContainer}>
                    <EditorComponent onAddNew={handleAddNew} />
                </main>
            </ProtectedRoute>
        </Layout>
    );
}
