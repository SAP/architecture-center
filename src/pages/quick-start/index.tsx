import React, { useState, useEffect, JSX, useCallback } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
import MetadataFormDialog from '@site/src/components/MetaFormDialog';
import { useAuth } from '@site/src/context/AuthContext';
import Header from '@site/src/components/CustomHeader/Header';
import { BusyIndicator, Button, Card, Dialog, FlexBox, Icon, Text, Title } from '@ui5/webcomponents-react';
import useIsMobile from '@site/src/hooks/useIsMobile';

function EditorComponent({ onAddNew, onEditMeta }: { onAddNew: (parentId?: string | null) => void; onEditMeta?: () => void }) {
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);

    if (!activeDocumentId) {
        return <div className={styles.noDocumentSelected}>Please select or create a document.</div>;
    }

    return (
        <BrowserOnly>
            {() => {
                const Editor = require('@site/src/components/Editor').default;
                return <Editor key={activeDocumentId} onAddNew={onAddNew} onEditMeta={onEditMeta} />;
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

function AuthenticatedQuickStartView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newDocData, setNewDocData] = useState<PageMetadata>(initialPageData);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const { documents, addDocument, setBackendConfig, fetchDocuments, isLoading, isCreating, getActiveDocument, updateDocument } = usePageDataStore();
    const history = useHistory();
    const { siteConfig } = useDocusaurusContext();
    const baseUrl = siteConfig.baseUrl;
    const { users, token } = useAuth();
    const { expressBackendUrl } = siteConfig.customFields as { expressBackendUrl: string };
    const [initialized, setInitialized] = useState(false);

    // Initialize backend config and fetch documents
    useEffect(() => {
        if (expressBackendUrl && token && !initialized) {
            const username = users.github?.username || '';
            setBackendConfig(expressBackendUrl, token, username);
            fetchDocuments().then(() => {
                setInitialized(true);
            });
        }
    }, [expressBackendUrl, token, initialized, setBackendConfig, fetchDocuments, users.github]);

    const handleAddNew = useCallback((parentId: string | null = null) => {
        const newDocWithAuthor = {
            ...initialPageData,
            authors: users.github ? [users.github.username] : [],
            contributors: users.github ? [users.github.username] : [],
        };
        setNewDocData(newDocWithAuthor);
        setCurrentParentId(parentId);
        setIsEditMode(false);
        setIsModalOpen(true);
    }, [users.github]);

    const handleEditMeta = useCallback(() => {
        const activeDoc = getActiveDocument();
        if (!activeDoc) return;

        setNewDocData({
            title: activeDoc.title,
            tags: activeDoc.tags,
            authors: activeDoc.authors,
            contributors: activeDoc.contributors || [],
            description: activeDoc.description || '',
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    }, [getActiveDocument]);

    useEffect(() => {
        if (initialized && documents.length === 0) {
            handleAddNew(null);
        }
    }, [documents.length, handleAddNew, initialized]);

    const handleCreate = () => {
        if (isEditMode) {
            const activeDoc = getActiveDocument();
            if (activeDoc) {
                updateDocument(activeDoc.id, {
                    title: newDocData.title,
                    tags: newDocData.tags,
                    description: newDocData.description,
                    contributors: newDocData.contributors,
                });
            }
        } else {
            addDocument(newDocData, currentParentId);
        }
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        if (documents.length === 0) {
            history.push(baseUrl);
        }
        setIsModalOpen(false);
    };

    // Show initializing screen only on first load (fetching documents)
    if (isLoading || !initialized) {
        return (
            <div className={styles.initializingContainer}>
                <BusyIndicator active size="L" text="Initializing Command Center..." />
            </div>
        );
    }

    // Show loader when creating a new ref arch
    if (isCreating) {
        return (
            <div className={styles.initializingContainer}>
                <BusyIndicator active size="L" text="Creating Reference Architecture..." />
            </div>
        );
    }

    return (
        <>
            <MetadataFormDialog
                open={isModalOpen}
                initialData={newDocData}
                onDataChange={(updates) => setNewDocData((prev) => ({ ...prev, ...updates }))}
                onSave={handleCreate}
                onCancel={handleCancel}
                isEditMode={isEditMode}
            />
            <main className={styles.pageContainer}>
                <EditorComponent onAddNew={handleAddNew} onEditMeta={handleEditMeta} />
            </main>
        </>
    );
}

function MobileDeviceWarning() {
    const history = useHistory();
    const { siteConfig } = useDocusaurusContext();
    const baseUrl = siteConfig.baseUrl;

    const handleHome = () => {
        history.push(baseUrl);
    };
    return (
        <Dialog open>
            <div className={styles.warningDialogContent}>
                <Icon name="alert" className={styles.warningIcon} />
                <Text>The QuickStart editor is not available for mobiles and tablets.</Text>
                <Button design="Emphasized" onClick={handleHome}>
                    Return to Home
                </Button>
            </div>
        </Dialog>
    );
}

function GitHubLoginRedirect({ loginUrl }: { loginUrl: string }) {
    useEffect(() => {
        // Redirect immediately to GitHub login
        window.location.href = loginUrl;
    }, [loginUrl]);

    // Fallback UI while redirecting (or if redirect fails)
    return (
        <Card
            header={
                <FlexBox className={styles.centeredCardHeader}>
                    <Icon name="locked" />
                    <Title level="H5" wrappingType="None">
                        GitHub Authentication Required
                    </Title>
                </FlexBox>
            }
            className={styles.authCard}
        >
            <div className={styles.authCardContent}>
                <FlexBox alignItems="Center" justifyContent="Center" style={{ marginBottom: '1rem' }}>
                    <BusyIndicator active size="M" />
                </FlexBox>
                <Text>Redirecting to GitHub login...</Text>
                <Text style={{ marginTop: '1rem', color: '#666' }}>
                    If you are not redirected automatically,{' '}
                    <a href={loginUrl} style={{ color: '#0a6ed1' }}>click here</a>.
                </Text>
            </div>
        </Card>
    );
}

export default function QuickStart(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { users, loading } = useAuth();
    const isMobile = useIsMobile();

    const isGithubAuthenticated = users.github !== null;
    const { expressBackendUrl } = siteConfig.customFields as {
        expressBackendUrl: string;
    };

    if (isMobile) {
        return (
            <Layout>
                <MobileDeviceWarning />
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <Header title="Quick Start" subtitle="Loading..." breadcrumbCurrent="Quick Start" />
                <main className={styles.mainContainer}>
                    <FlexBox alignItems="Center" justifyContent="Center" style={{ padding: '2rem' }}>
                        <Text>Checking authentication...</Text>
                    </FlexBox>
                </main>
            </Layout>
        );
    }

    if (!isGithubAuthenticated) {
        const originUri = `${window.location.origin}${siteConfig.baseUrl}quick-start`;
        const loginUrl = `${expressBackendUrl}/user/login?origin_uri=${encodeURIComponent(originUri)}&provider=github`;

        return (
            <Layout>
                <Header
                    title="Quick Start"
                    subtitle="Redirecting to GitHub login..."
                    breadcrumbCurrent="Quick Start"
                />
                <main className={styles.mainContainer}>
                    <GitHubLoginRedirect loginUrl={loginUrl} />
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
            <AuthenticatedQuickStartView />
        </Layout>
    );
}
