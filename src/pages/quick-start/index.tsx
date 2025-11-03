import React, { useState, useEffect, JSX } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
import MetadataFormDialog from '@site/src/components/MetaFormDialog';
import { useAuth } from '@site/src/context/AuthContext';
import Header from '@site/src/components/CustomHeader/Header';
import { Button, Card, Dialog, FlexBox, Icon, Text, Title } from '@ui5/webcomponents-react';
import useIsMobile from '@site/src/hooks/useIsMobile';

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

function AuthenticatedQuickStartView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDocData, setNewDocData] = useState<PageMetadata>(initialPageData);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const { documents, addDocument } = usePageDataStore();
    const history = useHistory();
    const { siteConfig } = useDocusaurusContext();
    const baseUrl = siteConfig.baseUrl;
    const { users } = useAuth();

    useEffect(() => {
        if (documents.length === 0) {
            handleAddNew(null);
        }
    }, [documents.length]);

    const handleAddNew = (parentId: string | null = null) => {
        const newDocWithAuthor = {
            ...initialPageData,
            authors: users.github ? [users.github.username] : [],
            contributors: users.github ? [users.github.username] : [],
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
        <>
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
        </>
    );
}

function MobileDeviceWarning() {
    return (
        <Dialog
            open
            header={
                <FlexBox justifyContent="Center">
                    <Title level="H4">Optimal Viewing Experience</Title>
                </FlexBox>
            }
        >
            <div className={styles.warningDialogContent}>
                <Icon name="error" className={styles.warningIcon} />
                <Text>
                    The QuickStart editor is best used on a larger screen. Some features may not work as expected.
                </Text>
            </div>
        </Dialog>
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
        return (
            <Layout>
                <Header
                    title="Quick Start"
                    subtitle="GitHub authentication required to access the Quick Start tool"
                    breadcrumbCurrent="Quick Start"
                />
                <main className={styles.mainContainer}>
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
                            <Text>The QuickStart editor requires GitHub authentication to manage your documents.</Text>
                            <Text>Please log in with your GitHub account to continue.</Text>
                            <Button
                                design="Emphasized"
                                onClick={() => {
                                    const originUri = `${window.location.origin}${siteConfig.baseUrl}QuickStart`;
                                    window.location.href = `${expressBackendUrl}/user/login?origin_uri=${encodeURIComponent(
                                        originUri
                                    )}&provider=github`;
                                }}
                            >
                                Login with GitHub to Continue
                            </Button>
                            <Text>After logging in, you'll be redirected back to this page.</Text>
                        </div>
                    </Card>
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
