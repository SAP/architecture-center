// import React, { useState, useEffect, JSX } from 'react';
// import Layout from '@theme/Layout';
// import BrowserOnly from '@docusaurus/BrowserOnly';
// import styles from './index.module.css';
// import { useHistory } from '@docusaurus/router';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
// import MetadataFormDialog from '@site/src/components/MetaFormDialog';
// import ProtectedRoute from '@site/src/components/ProtectedRoute';
// import { useAuth } from '@site/src/context/AuthContext';

// function EditorComponent({ onAddNew }: { onAddNew: (parentId?: string | null) => void }) {
//     const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);

//     if (!activeDocumentId) {
//         return <div className={styles.noDocumentSelected}>Please select or create a document.</div>;
//     }

//     return (
//         <BrowserOnly>
//             {() => {
//                 const Editor = require('@site/src/components/Editor').default;
//                 return <Editor key={activeDocumentId} onAddNew={onAddNew} />;
//             }}
//         </BrowserOnly>
//     );
// }

// const initialPageData: PageMetadata = {
//     title: '',
//     tags: [],
//     authors: [],
//     contributors: [],
// };

// export default function QuickStart(): JSX.Element {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [newDocData, setNewDocData] = useState<PageMetadata>(initialPageData);
//     const [currentParentId, setCurrentParentId] = useState<string | null>(null);
//     const { documents, addDocument } = usePageDataStore();
//     const history = useHistory();
//     const { siteConfig } = useDocusaurusContext();
//     const baseUrl = siteConfig.baseUrl;
//     const { user } = useAuth();

//     useEffect(() => {
//         if (documents.length === 0) {
//             handleAddNew(null);
//         }
//     }, [documents.length]);

//     const handleAddNew = (parentId: string | null = null) => {
//         const newDocWithAuthor = {
//             ...initialPageData,
//             authors: user ? [user.username] : [],
//             contributors: user ? [user.username] : [],
//         };
//         setNewDocData(newDocWithAuthor);
//         setCurrentParentId(parentId);
//         setIsModalOpen(true);
//     };

//     const handleCreate = () => {
//         addDocument(newDocData, currentParentId);
//         setIsModalOpen(false);
//     };

//     const handleCancel = () => {
//         if (documents.length === 0) {
//             history.push(baseUrl);
//         }
//         setIsModalOpen(false);
//     };

//     return (
//         <Layout>
//             <ProtectedRoute>
//                 <MetadataFormDialog
//                     open={isModalOpen}
//                     initialData={newDocData}
//                     onDataChange={(updates) => setNewDocData((prev) => ({ ...prev, ...updates }))}
//                     onSave={handleCreate}
//                     onCancel={handleCancel}
//                 />
//                 <main className={styles.pageContainer}>
//                     <EditorComponent onAddNew={handleAddNew} />
//                 </main>
//             </ProtectedRoute>
//         </Layout>
//     );
// }

import React, { useState, useEffect, JSX } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
import MetadataFormDialog from '@site/src/components/MetaFormDialog';
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

export default function QuickStart(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { users, loading } = useAuth();

    const isGithubAuthenticated = users.github !== null;
    const { expressBackendUrl } = siteConfig.customFields as {
        expressBackendUrl: string;
    };

    if (loading) {
        return (
            <Layout>
                <div className={styles.headerBar}>
                    <h1>Quickstart</h1>
                    <p>Loading...</p>
                </div>
                <main className={styles.mainContainer}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Checking authentication...</p>
                    </div>
                </main>
            </Layout>
        );
    }

    if (!isGithubAuthenticated) {
        return (
            <Layout>
                <div className={styles.headerBar}>
                    <h1>Quickstart</h1>
                    <p>GitHub authentication required to access this feature</p>
                </div>
                <main className={styles.mainContainer}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className={styles.authRequired}>
                            <h2>🔒 GitHub Authentication Required</h2>
                            <p>The Quickstart editor requires GitHub authentication to manage your documents.</p>
                            <p>Please log in with your GitHub account to continue.</p>
                            <button
                                className={styles.loginButton}
                                onClick={() => {
                                    window.location.href = `${expressBackendUrl}/user/login?origin_uri=${encodeURIComponent(
                                        window.location.href
                                    )}&provider=github`;
                                }}
                            >
                                Login with GitHub to Continue
                            </button>
                            <p className={styles.authHelpText}>
                                After logging in, you'll be redirected back to this page.
                            </p>
                        </div>
                    </div>
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
