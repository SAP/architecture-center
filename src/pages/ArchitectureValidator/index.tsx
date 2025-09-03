import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import axios from 'axios';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '@ui5/webcomponents-icons/dist/AllIcons';

interface ValidationRule {
    rule: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    violation: string;
    details: string;
}

interface ValidationResponse {
    validationReport: ValidationRule[];
}

export default function ArchitectureValidator(): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationRule[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && !file.name.toLowerCase().endsWith('.drawio')) {
            setError('Please select a valid .drawio file');
            setSelectedFile(null);
            setValidationResults(null);
            setFileContent(null);
            return;
        }
        setSelectedFile(file);
        setError(null);
        setValidationResults(null);

        // Read file content for preview
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFileContent(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleValidate = async () => {
        if (!selectedFile) {
            setError('Please select a .drawio file first');
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Get API key and URL from environment variables
            const apiKey = siteConfig.customFields.validatorApiKey as string;
            const apiUrl = siteConfig.customFields.validatorApiUrl as string;

            if (!apiKey) {
                throw new Error('API key not configured. Please set VALIDATOR_API_KEY environment variable.');
            }

            if (!apiUrl) {
                throw new Error('API URL not configured. Please set VALIDATOR_API_URL environment variable.');
            }

            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'x-api-key': apiKey,
                },
            });

            if (!response.data || !Array.isArray(response.data.validationReport)) {
                throw new Error('Invalid response format from validation API');
            }

            setValidationResults(response.data.validationReport);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during validation');
        } finally {
            setIsValidating(false);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.drawio')) {
                setSelectedFile(file);
                setError(null);
                setValidationResults(null);

                // Read file content for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFileContent(e.target?.result as string);
                };
                reader.readAsText(file);
            } else {
                setError('Please select a valid .drawio file');
            }
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'ERROR':
                return '#d32f2f';
            case 'WARNING':
                return '#f57c00';
            case 'INFO':
                return '#1976d2';
            default:
                return '#1976d2';
        }
    };

    // Helper to count severities for summary
    const countBySeverity = (severity: string) => validationResults?.filter((v) => v.severity === severity).length || 0;

    // Calculate Overall Score (mock calculation: Errors reduce score)
    const filesValidated = selectedFile ? 1 : 0;
    const totalViolations = validationResults?.length || 0;
    const errorCount = countBySeverity('ERROR');
    const warningCount = countBySeverity('WARNING');
    const infoCount = countBySeverity('INFO');

    return (
        <Layout>
            <div className={styles.headerBar}>
                Architecture Validator
                <div className={styles.headerDescription}>
                    Upload your .drawio architecture diagram to validate it against SAP best practices and guidelines.
                </div>
                <div className={styles.headerSubtitle}>Generated: {new Date().toISOString()}</div>
            </div>

            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <div className={styles.leftPanel}>
                        <div className={styles.uploadSection}>
                            <div
                                className={`${styles.uploadArea} ${selectedFile ? styles.hasFile : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".drawio"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                {selectedFile ? (
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileIcon}>📄</div>
                                        <div className={styles.fileName}>{selectedFile.name}</div>
                                        <div className={styles.fileSize}>
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.uploadPrompt}>
                                        <div className={styles.uploadIcon}>⬆️</div>
                                        <div className={styles.uploadText}>
                                            <strong>Click to upload</strong> or drag and drop your .drawio file here
                                        </div>
                                        <div className={styles.uploadSubtext}>Only .drawio files are supported</div>
                                    </div>
                                )}
                            </div>

                            <button
                                className={styles.validateButton}
                                onClick={handleValidate}
                                disabled={!selectedFile || isValidating}
                            >
                                {isValidating ? 'Validating...' : 'Validate'}
                            </button>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {validationResults !== null && (
                            <div className={styles.resultsSection}>
                                <div className={styles.summaryBar}>
                                    <div className={styles.summaryStats}>
                                        Files validated: {filesValidated} &nbsp;|&nbsp; Total violations:{' '}
                                        {totalViolations} &nbsp;|&nbsp; Errors: {errorCount} &nbsp;|&nbsp; Warnings:{' '}
                                        {warningCount} &nbsp;|&nbsp; Info: {infoCount}
                                    </div>
                                </div>

                                <h2>Validation Results</h2>

                                {validationResults.length === 0 ? (
                                    <div className={styles.successMessage}>
                                        <div className={styles.successIcon}>✅</div>
                                        <div>
                                            <strong>No errors or warnings found!</strong>
                                            <p>Your architecture diagram follows all the validation rules.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.violationsList}>
                                        {validationResults.map((violation, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.violationItem} ${
                                                    violation.severity === 'ERROR'
                                                        ? styles.errorCard
                                                        : violation.severity === 'WARNING'
                                                        ? styles.warningCard
                                                        : styles.infoCard
                                                }`}
                                            >
                                                <div className={styles.violationHeader}>
                                                    <span
                                                        className={styles.severityBadge}
                                                        style={{
                                                            backgroundColor: getSeverityColor(violation.severity),
                                                        }}
                                                    >
                                                        {violation.severity}
                                                    </span>
                                                    <span className={styles.violationType}>{violation.violation}</span>
                                                </div>
                                                <div className={styles.violationRule}>
                                                    <strong>Rule:</strong> {violation.rule}
                                                </div>
                                                {violation.details && violation.details !== 'No Details Provided' && (
                                                    <div className={styles.violationDetails}>
                                                        <strong>Details:</strong> {violation.details}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className={styles.rightPanel}>
                        {selectedFile && fileContent ? (
                            <div className={styles.previewSection}>
                                <h3>Diagram Preview</h3>
                                <div className={styles.previewContainer}>
                                    <iframe
                                        src={`https://viewer.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=${encodeURIComponent(
                                            selectedFile.name
                                        )}#R${encodeURIComponent(fileContent)}`}
                                        className={styles.diagramViewer}
                                        title="Diagram Preview"
                                        frameBorder="0"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={styles.previewPlaceholder}>
                                <div className={styles.placeholderIcon}>📊</div>
                                <h3>Diagram Preview</h3>
                                <p>Upload a .drawio file to see the preview here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
