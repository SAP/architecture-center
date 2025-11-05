import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import axios from 'axios';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { authStorage } from '../../utils/authStorage';
import { useAuth } from '@site/src/context/AuthContext';
import { Button, FlexBox, Title, Text, Icon, Dialog, Bar, Card } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import Header from '@site/src/components/CustomHeader/Header';
import useIsMobile from '@site/src/hooks/useIsMobile';
import { useHistory } from '@docusaurus/router';

type FileStatus = 'batched' | 'validating' | 'success' | 'warning' | 'error';

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
                <Text>The Architecture Validator is not available for mobiles and tablets.</Text>
                <Button design="Emphasized" onClick={handleHome}>
                    Return to Home
                </Button>
            </div>
        </Dialog>
    );
}

export default function ArchitectureValidator(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { users, loading } = useAuth();
    const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showUploadLimitDialog, setShowUploadLimitDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();

    const isBtpAuthenticated = users.btp !== null;

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
                <div className={styles.headerBar}>
                    <h1>Architecture Validator</h1>
                    <p>Loading...</p>
                </div>
                <main className={styles.mainContainer}>
                    <FlexBox alignItems="Center" justifyContent="Center" style={{ padding: '2rem' }}>
                        <Text>Checking authentication...</Text>
                    </FlexBox>
                </main>
            </Layout>
        );
    }

    if (!isBtpAuthenticated) {
        return (
            <Layout>
                <Header
                    title="Architecture Validator"
                    subtitle="BTP authentication required to access this feature"
                    breadcrumbCurrent="Architecture Validator"
                />
                <main className={styles.mainContainer}>
                    <Card
                        header={
                            <FlexBox className={styles.centeredCardHeader}>
                                <Icon name="locked" />
                                <Title level="H5" wrappingType="None">
                                    BTP Authentication Required
                                </Title>
                            </FlexBox>
                        }
                        className={styles.authCard}
                    >
                        <div className={styles.authCardContent}>
                            <Text>
                                The Architecture Validator requires BTP authentication to ensure secure access to
                                validation services.
                            </Text>
                            <Text>Please log in with your BTP account to continue.</Text>
                            <Button
                                design="Emphasized"
                                onClick={() => {
                                    const BTP_API = siteConfig.customFields.backendUrl as string;
                                    window.location.href = `${BTP_API}/user/login?origin_uri=${encodeURIComponent(
                                        window.location.href
                                    )}&provider=btp`;
                                }}
                            >
                                Login with BTP to Continue
                            </Button>
                            <Text>After logging in with BTP, you'll be redirected back to this page.</Text>
                        </div>
                    </Card>
                </main>
            </Layout>
        );
    }

    const updateFileState = (id: string, updates: Partial<ManagedFile>) => {
        setManagedFiles((prev) => prev.map((mf) => (mf.id === id ? { ...mf, ...updates } : mf)));
    };

    const processAndAddFiles = (files: FileList) => {
        const fileArray = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.drawio'));

        // Check if adding these files would exceed the 5 file limit
        const currentFileCount = managedFiles.length;
        const newFilesCount = fileArray.length;

        // Don't allow any uploads if already at limit
        if (currentFileCount >= 5) {
            setShowUploadLimitDialog(true);
            return;
        }

        // Don't allow if new files would exceed limit
        if (currentFileCount + newFilesCount > 5) {
            setShowUploadLimitDialog(true);
            return;
        }

        // If uploading more than 5 files at once, show dialog
        if (newFilesCount > 5) {
            setShowUploadLimitDialog(true);
            return;
        }

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
        event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.remove(styles.dragOver);
        if (event.dataTransfer.files) processAndAddFiles(event.dataTransfer.files);
    };

    const validateFile = async (managedFile: ManagedFile) => {
        updateFileState(managedFile.id, { status: 'validating' });
        try {
            const formData = new FormData();
            formData.append('file', managedFile.file);
            const apiUrl = siteConfig.customFields.validatorApiUrl as string;

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

        const validationPromises = filesToValidate.map(async (file) => {
            try {
                await validateFile(file);
            } finally {
                completedCount++;
                setProgress((completedCount / totalFiles) * 100);
            }
        });

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
            <Header
                title="Architecture Validator"
                subtitle="Upload, preview, and validate your .drawio architecture diagrams based on SAP best-practice guidelines"
                breadcrumbCurrent="Architecture Validator"
            />

            <main className={styles.mainContainer}>
                {managedFiles.length === 0 ? (
                    <div
                        className={styles.fioriUploader}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add(styles.dragOver);
                        }}
                        onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragOver)}
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
                        <FlexBox
                            direction="Column"
                            alignItems="Center"
                            justifyContent="Center"
                            style={{ gap: '0.5rem' }}
                        >
                            <Icon name="upload-to-cloud" className={styles.uploadIcon} />
                            <Title className={styles.uploaderTitle}>Upload .drawio files</Title>
                            <Text className={styles.uploaderSubtitle}>Drag and drop here or click to browse</Text>
                        </FlexBox>
                    </div>
                ) : (
                    <div className={styles.contentArea}>
                        <div className={styles.actionsHeader}>
                            <Button
                                design="Emphasized"
                                onClick={handleValidateBatch}
                                disabled={isProcessingBatch || !managedFiles.some((f) => f.status === 'batched')}
                            >
                                {isProcessingBatch
                                    ? 'Validating...'
                                    : `Validate All (${managedFiles.filter((f) => f.status === 'batched').length})`}
                            </Button>

                            <Button
                                design="Default"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={managedFiles.length >= 5}
                            >
                                Add More Files
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".drawio"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                multiple
                            />

                            <Button design="Transparent" onClick={clearAll}>
                                Remove All
                            </Button>
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
                                            <span className={styles.statusName}>
                                                {mf.status === 'batched'
                                                    ? 'Pending'
                                                    : mf.status.charAt(0).toUpperCase() + mf.status.slice(1)}
                                            </span>
                                            <h3 className={styles.fileName}>{mf.file.name}</h3>
                                        </div>
                                        <div className={styles.cardActions}>
                                            {mf.status === 'batched' && (
                                                <Button design="Positive" onClick={() => validateFile(mf)}>
                                                    Validate
                                                </Button>
                                            )}
                                            <Button
                                                design="Transparent"
                                                icon="delete"
                                                tooltip="Remove File"
                                                onClick={() => handleRemoveFile(mf.id)}
                                            />
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

            {/* Upload Limit Dialog */}
            <Dialog
                open={showUploadLimitDialog}
                onClose={() => setShowUploadLimitDialog(false)}
                headerText="Upload Limit Reached"
            >
                <div className={styles.uploadLimitDialog}>
                    <FlexBox direction="Column" alignItems="Start" className={styles.uploadLimitDialogContent}>
                        <Icon name="alert" className={styles.uploadLimitDialogIcon} />
                        <Text>You can upload a maximum of 5 diagrams at once.</Text>
                        <Text>Please remove some files or try again with fewer diagrams.</Text>
                    </FlexBox>
                </div>
                <Bar
                    design="Footer"
                    endContent={
                        <Button design="Emphasized" onClick={() => setShowUploadLimitDialog(false)}>
                            OK
                        </Button>
                    }
                />
            </Dialog>
        </Layout>
    );
}
