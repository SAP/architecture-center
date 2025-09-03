import React, { useState, useRef } from 'react';
import Layout from '@theme/Layout';
import axios from 'axios';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type FileStatus = 'queued' | 'validating' | 'success' | 'warning' | 'error';

interface ValidationRule {
    rule: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    violation: string;
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
    const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                            status: 'queued',
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
            const apiKey = siteConfig.customFields.validatorApiKey as string;
            const apiUrl = siteConfig.customFields.validatorApiUrl as string;

            const response = await axios.post<{ validationReport: ValidationRule[] }>(apiUrl, formData, {
                headers: { 'x-api-key': apiKey },
            });

            const report = response.data.validationReport;
            let finalStatus: FileStatus = 'success';
            if (report.some((v) => v.severity === 'ERROR')) finalStatus = 'error';
            else if (report.some((v) => v.severity === 'WARNING')) finalStatus = 'warning';

            updateFileState(managedFile.id, { status: finalStatus, results: report });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            updateFileState(managedFile.id, { status: 'error', error: message });
        }
    };

    const handleValidateBatch = async () => {
        setIsProcessingBatch(true);
        setProgress(0);
        const filesToValidate = managedFiles.filter((mf) => mf.status === 'queued');

        for (let i = 0; i < filesToValidate.length; i++) {
            await validateFile(filesToValidate[i]);
            setProgress(((i + 1) / filesToValidate.length) * 100);
        }
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
        <Layout title="Architecture Validator" description="Validate your .drawio architecture diagrams.">
            <div className={styles.headerBar}>
                <h1>Architecture Validator</h1>
                <p>Upload, preview, and validate your .drawio diagrams against best practices.</p>
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
                                    disabled={isProcessingBatch || !managedFiles.some((f) => f.status === 'queued')}
                                >
                                    {isProcessingBatch
                                        ? `Validating...`
                                        : `Validate Queued (${
                                              managedFiles.filter((f) => f.status === 'queued').length
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
                                            {mf.status === 'queued' && (
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
                                            {!mf.results && !mf.error && (
                                                <div className={styles.resultsPlaceholder}>
                                                    Validation results will appear here.
                                                </div>
                                            )}
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
                                                        <span>{v.violation}</span>
                                                    </div>
                                                    <div className={styles.violationRule}>
                                                        <strong>Rule:</strong> {v.rule}
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
