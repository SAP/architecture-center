import React, { useState, useEffect, JSX } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
    usePageDataStore,
    PageMetadata,
    hasLocalStorageData,
    getLocalStorageDocuments,
    discardLocalStorageData,
} from '@site/src/store/pageDataStore';
import MetadataFormDialog from '@site/src/components/MetaFormDialog';
import { useAuth } from '@site/src/context/AuthContext';
import Header from '@site/src/components/CustomHeader/Header';
import {
    Button,
    Card,
    Dialog,
    FlexBox,
    Icon,
    Text,
    Title,
    Bar,
    List,
    ListItemStandard,
    BusyIndicator,
    MessageStrip,
} from '@ui5/webcomponents-react';
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

/**
 * Migration prompt component
 */
function MigrationPrompt({
    onMigrate,
    onDiscard,
    onCancel,
    isMigrating,
    migrationError,
}: {
    onMigrate: () => void;
    onDiscard: () => void;
    onCancel: () => void;
    isMigrating: boolean;
    migrationError: string | null;
}) {
    const localDocs = getLocalStorageDocuments();

    return (
        <Dialog
            open
            header={
                <Bar>
                    <Title>Local Documents Found</Title>
                </Bar>
            }
            footer={
                <Bar
                    endContent={
                        <>
                            <Button design="Emphasized" onClick={onMigrate} disabled={isMigrating}>
                                {isMigrating ? 'Migrating...' : 'Migrate to Cloud'}
                            </Button>
                            <Button design="Negative" onClick={onDiscard} disabled={isMigrating}>
                                Discard Local Data
                            </Button>
                            <Button design="Transparent" onClick={onCancel} disabled={isMigrating}>
                                Cancel
                            </Button>
                        </>
                    }
                />
            }
        >
            <div className={styles.migrationDialogContent}>
                {isMigrating && (
                    <FlexBox alignItems="Center" justifyContent="Center" style={{ padding: '1rem' }}>
                        <BusyIndicator active size="M" />
                        <Text style={{ marginLeft: '1rem' }}>Migrating documents to cloud storage...</Text>
                    </FlexBox>
                )}

                {migrationError && (
                    <MessageStrip design="Negative" style={{ marginBottom: '1rem' }}>
                        {migrationError}
                    </MessageStrip>
                )}

                {!isMigrating && (
                    <>
                        <Text style={{ marginBottom: '1rem', display: 'block' }}>
                            We found {localDocs.length} document(s) stored in your browser that haven't been synced to
                            the cloud. Would you like to migrate them?
                        </Text>

                        <List headerText="Documents to migrate" selectionMode="None">
                            {localDocs.map((doc) => (
                                <ListItemStandard key={doc.id} description={doc.description || 'No description'}>
                                    {doc.title || 'Untitled'}
                                </ListItemStandard>
                            ))}
                        </List>

                        <MessageStrip design="Critical" style={{ marginTop: '1rem' }}>
                            If you discard, these local documents will be permanently deleted.
                        </MessageStrip>
                    </>
                )}
            </div>
        </Dialog>
    );
}

function AuthenticatedQuickStartView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDocData, setNewDocData] = useState<PageMetadata>(initialPageData);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Migration state
    const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationError, setMigrationError] = useState<string | null>(null);

    const {
        documents,
        fetchDocuments,
        createDocumentAsync,
        isLoading,
        loadError,
        migrateFromLocalStorage,
        clearErrors,
    } = usePageDataStore();

    const history = useHistory();
    const { siteConfig } = useDocusaurusContext();
    const baseUrl = siteConfig.baseUrl;
    const { users } = useAuth();

    // Fetch documents on mount
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchDocuments();
            setHasFetched(true);

            // Check for localStorage migration after fetching
            if (hasLocalStorageData()) {
                setShowMigrationPrompt(true);
            }
        };
        init();
    }, [fetchDocuments]);

    // Show create dialog if no documents after loading (only after initial fetch)
    useEffect(() => {
        if (hasFetched && !isLoading && !showMigrationPrompt && documents.length === 0) {
            handleAddNew(null);
        }
    }, [hasFetched, isLoading, documents.length, showMigrationPrompt]);

    const handleAddNew = (parentId: string | null = null) => {
        const newDocWithAuthor = {
            ...initialPageData,
            authors: users.github ? [users.github.username] : [],
            contributors: users.github ? [users.github.username] : [],
        };
        setNewDocData(newDocWithAuthor);
        setCurrentParentId(parentId);
        setCreateError(null);
        setIsModalOpen(true);
    };

    const handleCreate = async () => {
        setIsCreating(true);
        setCreateError(null);

        try {
            await createDocumentAsync(newDocData, currentParentId);
            setIsModalOpen(false);
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : 'Failed to create document');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        if (documents.length === 0 && !showMigrationPrompt) {
            history.push(baseUrl);
        }
        setIsModalOpen(false);
        setCreateError(null);
    };

    const handleMigrate = async () => {
        setIsMigrating(true);
        setMigrationError(null);

        try {
            const result = await migrateFromLocalStorage();

            if (result.errors.length > 0) {
                setMigrationError(`Migration completed with errors: ${result.errors.join('; ')}`);
            } else {
                setShowMigrationPrompt(false);
            }
        } catch (error) {
            setMigrationError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
            setIsMigrating(false);
        }
    };

    const handleDiscardLocalData = () => {
        discardLocalStorageData();
        setShowMigrationPrompt(false);

        // If no documents after discarding, show create dialog
        if (documents.length === 0) {
            handleAddNew(null);
        }
    };

    const handleCancelMigration = () => {
        setShowMigrationPrompt(false);
        // Continue with existing behavior - show documents if any, or create dialog
        if (documents.length === 0) {
            handleAddNew(null);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <FlexBox
                alignItems="Center"
                justifyContent="Center"
                direction="Column"
                style={{ padding: '4rem', gap: '1rem' }}
            >
                <BusyIndicator active size="L" />
                <Text>Loading your documents...</Text>
            </FlexBox>
        );
    }

    // Show error state
    if (loadError) {
        return (
            <FlexBox
                alignItems="Center"
                justifyContent="Center"
                direction="Column"
                style={{ padding: '4rem', gap: '1rem' }}
            >
                <MessageStrip design="Negative">Failed to load documents: {loadError.message}</MessageStrip>
                <Button
                    design="Emphasized"
                    onClick={() => {
                        clearErrors();
                        fetchDocuments();
                    }}
                >
                    Retry
                </Button>
            </FlexBox>
        );
    }

    return (
        <>
            {showMigrationPrompt && (
                <MigrationPrompt
                    onMigrate={handleMigrate}
                    onDiscard={handleDiscardLocalData}
                    onCancel={handleCancelMigration}
                    isMigrating={isMigrating}
                    migrationError={migrationError}
                />
            )}

            <MetadataFormDialog
                open={isModalOpen}
                initialData={newDocData}
                onDataChange={(updates) => setNewDocData((prev) => ({ ...prev, ...updates }))}
                onSave={handleCreate}
                onCancel={handleCancel}
                isLoading={isCreating}
                error={createError}
            />

            <main className={styles.pageContainer}>
                <EditorComponent onAddNew={handleAddNew} />
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
                        <BusyIndicator active size="M" />
                        <Text style={{ marginLeft: '1rem' }}>Checking authentication...</Text>
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
                                    const originUri = `${window.location.origin}${siteConfig.baseUrl}quick-start`;
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
