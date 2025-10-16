import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import axios from 'axios';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { authStorage } from '../../utils/authStorage';
import { useAuth } from '@site/src/context/AuthContext';
import { FlexBox, Title, Text, Link, Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/home.js';

type FileStatus = 'batched' | 'batched' | 'validating' | 'success' | 'warning' | 'error';

interface ValidationRule {
    rule: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    details: string;
}

interface ManagedFile {
    id: string;
    file: File;
    content: string;
    status: FileStatus;
    results: ValidationRule[] | null;
    error: string | null;
}

export default function ArchitectureValidator(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { user, users, loading } = useAuth();
    const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hasRedirected, setHasRedirected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if user is authenticated with BTP
    const isBtpAuthenticated = users.btp !== null;

    // Redirect to BTP login if user is not authenticated with BTP
    useEffect(() => {
        if (!loading && !isBtpAuthenticated && !hasRedirected) {
            setHasRedirected(true);
            // Redirect to BTP login
            const BTP_API = siteConfig.customFields.backendUrl as string;
            window.location.href = `${BTP_API}/user/login?origin_uri=${encodeURIComponent(
                window.location.href
            )}&provider=btp`;
        }
    }, [loading, isBtpAuthenticated, hasRedirected, siteConfig.customFields.backendUrl]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <Layout>
                <div className={styles.headerBar}>
                    <h1>Architecture Validator</h1>
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

    // Don't render the main content if user is not authenticated with BTP
    if (!isBtpAuthenticated) {
        return (
            <Layout>
                <div className={styles.headerBar}>
                    <h1>Architecture Validator</h1>
                    <p>BTP authentication required to access this feature</p>
                </div>
                <main className={styles.mainContainer}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className={styles.authRequired}>
                            <h2>🔒 BTP Authentication Required</h2>
                            <p>
                                The Architecture Validator requires BTP authentication to ensure secure access to
                                validation services.
                            </p>
                            {user && user.provider !== 'btp' ? (
                                <p>
                                    You are currently logged in with {user.provider.toUpperCase()}, but this feature
                                    requires BTP login.
                                </p>
                            ) : (
                                <p>
                                    You will be redirected to the BTP login page automatically, or you can click the
                                    button below to login manually.
                                </p>
                            )}
                            <button
                                className={styles.loginButton}
                                onClick={() => {
                                    const BTP_API = siteConfig.customFields.backendUrl as string;
                                    window.location.href = `${BTP_API}/user/login?origin_uri=${encodeURIComponent(
                                        window.location.href
                                    )}&provider=btp`;
                                }}
                            >
                                Login with BTP to Continue
                            </button>
                            <p className={styles.authHelpText}>
                                After logging in with BTP, you'll be redirected back to this page.
                            </p>
                        </div>
                    </div>
                </main>
            </Layout>
        );
    }

    const updateFileState = (id: string, updates: Partial<ManagedFile>) => {
        setManagedFiles((prev) => prev.map((mf) => (mf.id === id ? { ...mf, ...updates } : mf)));
    };

    const processAndAddFiles = (files: FileList) => {
        const fileArray = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.drawio'));

        const filePromises = fileArray.map(
            (file) =>
                new Promise<ManagedFile>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            id: `${file.name}-${file.lastModified}-${Math.random()}`,
                            file,
                            content: e.target?.result as string,
                            status: 'batched',
                            results: null,
                            error: null,
                        });
                    };
                    reader.readAsText(file);
                })
        );

        Promise.all(filePromises).then((newFiles) => {
            setManagedFiles((current) => [...current, ...newFiles]);
        });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) processAndAddFiles(event.target.files);
        event.target.value = ''; // Allow re-selecting the same file
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) processAndAddFiles(event.dataTransfer.files);
    };

    const validateFile = async (managedFile: ManagedFile) => {
        updateFileState(managedFile.id, { status: 'validating' });
        try {
            const formData = new FormData();
            formData.append('file', managedFile.file);
            console.log('Using API URL:', siteConfig.customFields.validatorApiUrl);
            const apiUrl = siteConfig.customFields.validatorApiUrl as string;

            // Get token from authStorage
            const authData = authStorage.load();
            const token = authData?.token;

            if (!token) {
                throw new Error('Authentication token not found. Please log in.');
            }

            const response = await axios.post<{ validationReport: ValidationRule[] }>(apiUrl, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const report = response.data.validationReport;

            // Filter out INFO items for display and status determination
            const displayResults = report.filter((v) => v.severity !== 'INFO');

            let finalStatus: FileStatus = 'success';
            if (displayResults.some((v) => v.severity === 'ERROR')) finalStatus = 'error';
            else if (displayResults.some((v) => v.severity === 'WARNING')) finalStatus = 'warning';

            updateFileState(managedFile.id, { status: finalStatus, results: displayResults });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            updateFileState(managedFile.id, { status: 'error', error: message });
        }
    };

    const handleValidateBatch = async () => {
        setIsProcessingBatch(true);
        setProgress(0);
        const filesToValidate = managedFiles.filter((mf) => mf.status === 'batched');

        let completedCount = 0;
        const totalFiles = filesToValidate.length;

        // Create promises for all validations to run in parallel
        const validationPromises = filesToValidate.map(async (file) => {
            try {
                await validateFile(file);
            } finally {
                completedCount++;
                setProgress((completedCount / totalFiles) * 100);
            }
        });

        // Wait for all validations to complete
        await Promise.all(validationPromises);
        setIsProcessingBatch(false);
    };

    const handleRemoveFile = (idToRemove: string) => {
        setManagedFiles((current) => current.filter((mf) => mf.id !== idToRemove));
    };

    const clearAll = () => {
        setManagedFiles([]);
        setProgress(0);
        setIsProcessingBatch(false);
    };

    return (
        <Layout>
            <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                    <div className={styles.breadCrumbs}>
                        <a href="/" className={styles.homeLink}>
                            <Icon name="home" />
                        </a>
                        <Text className={styles.breadcrumbSeparator}>&gt;</Text>
                        <Text className={styles.breadcrumbCurrent}>Architecture Validator</Text>
                    </div>

                    <FlexBox direction="Column" alignItems="Start" justifyContent="Center">
                        <Title className={styles.heroTitle}>Architecture Validator</Title>
                        <Text className={styles.heroSubtitle}>
                            Upload, preview, and validate your .drawio diagrams against SAP best practices.
                        </Text>
                    </FlexBox>
                </div>
            </div>

            <main className={styles.mainContainer}>
                {managedFiles.length === 0 ? (
                    <div
                        className={styles.uploadPrompt}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".drawio"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            multiple
                        />
                        <div className={styles.uploadIcon}>⬆️</div>
                        <h2>Drag & Drop your .drawio files here</h2>
                        <p>or click to select files</p>
                    </div>
                ) : (
                    <div className={styles.contentArea}>
                        <div className={styles.actionsHeader}>
                            <button className={styles.addFilesButton} onClick={() => fileInputRef.current?.click()}>
                                + Add More Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".drawio"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                multiple
                            />
                            <div className={styles.actionButtons}>
                                <button className={styles.clearButton} onClick={clearAll}>
                                    Clear All
                                </button>
                                <button
                                    className={styles.validateButton}
                                    onClick={handleValidateBatch}
                                    disabled={isProcessingBatch || !managedFiles.some((f) => f.status === 'batched')}
                                >
                                    {isProcessingBatch
                                        ? `Validating...`
                                        : `Validate Batch (${
                                              managedFiles.filter((f) => f.status === 'batched').length
                                          })`}
                                </button>
                            </div>
                        </div>

                        {isProcessingBatch && (
                            <div className={styles.progressBarContainer}>
                                <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                            </div>
                        )}

                        <div className={styles.fileListContainer}>
                            {managedFiles.map((mf) => (
                                <div key={mf.id} className={`${styles.fileCard} ${styles[mf.status]}`}>
                                    <div className={styles.fileCardHeader}>
                                        <div className={styles.fileInfo}>
                                            <span className={styles.statusName}>{mf.status.toUpperCase()}</span>
                                            <h3 className={styles.fileName}>{mf.file.name}</h3>
                                        </div>
                                        <div className={styles.cardActions}>
                                            {mf.status === 'batched' && (
                                                <button
                                                    className={styles.cardValidateButton}
                                                    onClick={() => validateFile(mf)}
                                                >
                                                    Validate
                                                </button>
                                            )}
                                            <button
                                                className={styles.cardRemoveButton}
                                                onClick={() => handleRemoveFile(mf.id)}
                                                title="Remove File"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.previewAndResults}>
                                        <div className={styles.previewWrapper}>
                                            <iframe
                                                src={`https://viewer.diagrams.net/?lightbox=1&edit=_blank&layers=1&nav=1#R${encodeURIComponent(
                                                    mf.content
                                                )}`}
                                                className={styles.diagramViewer}
                                                title={mf.file.name}
                                            />
                                        </div>
                                        <div className={styles.resultsContainer}>
                                            {mf.status === 'validating' ? (
                                                <div className={styles.validatingContainer}>
                                                    <div className={styles.loadingSpinner}></div>
                                                    <div className={styles.validatingText}>Validating...</div>
                                                </div>
                                            ) : !mf.results && !mf.error ? (
                                                <div className={styles.resultsPlaceholder}>
                                                    Validation results will appear here.
                                                </div>
                                            ) : null}
                                            {mf.error && (
                                                <div className={`${styles.violationCard} ${styles.errorCard}`}>
                                                    <strong>API Error:</strong> {mf.error}
                                                </div>
                                            )}
                                            {mf.results?.length === 0 && (
                                                <div className={`${styles.violationCard} ${styles.successCard}`}>
                                                    <strong>Validation Passed:</strong> No issues found.
                                                </div>
                                            )}
                                            {mf.results?.map((v, index) => (
                                                <div
                                                    key={index}
                                                    className={`${styles.violationCard} ${
                                                        styles[v.severity.toLowerCase() + 'Card']
                                                    }`}
                                                >
                                                    <div className={styles.violationHeader}>
                                                        <span className={styles.severityBadge}>{v.severity}</span>
                                                    </div>
                                                    <div className={styles.violationRule}>
                                                        <strong>Rule:</strong> {v.rule}
                                                    </div>
                                                    <div className={styles.violationDetails}>
                                                        <strong>Details:</strong> {v.details}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </Layout>
    );
}
