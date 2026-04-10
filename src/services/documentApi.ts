/**
 * Document API service for Quick Start backend
 */

import { apiRequest, uploadBinary, downloadBinary, ApiError } from './apiClient';

// Get the backend URL from Docusaurus config
function getBackendUrl(): string {
    if (typeof window === 'undefined') return '';
    // Access from window.__DOCUSAURUS__ or fallback to default
    const docusaurus = (window as any).__DOCUSAURUS__;
    const expressBackendUrl = docusaurus?.siteConfig?.customFields?.expressBackendUrl;
    return expressBackendUrl || 'http://localhost:4004';
}

const DOCUMENT_SERVICE_PATH = '/quickstart/document-service';

// Types matching the backend schema
export interface User {
    ID: string;
    username: string;
}

export interface Tag {
    code: string;
    label?: string;
    description?: string;
}

export interface DocumentTag {
    tag: Tag;
}

export interface DocumentContributor {
    user: User;
    accessLevel: 'VIEW';
}

export interface DocumentAsset {
    ID: string;
    mediaType: string;
    filename: string;
    document_ID: string;
}

export interface Document {
    ID: string;
    title: string;
    description?: string;
    parent_ID?: string | null;
    editorState?: string;
    author?: User;
    contributors?: DocumentContributor[];
    tags?: DocumentTag[];
    assets?: DocumentAsset[];
}

export interface CreateDocumentParams {
    title: string;
    description?: string;
    parentId?: string | null;
    tags?: string[];
    contributorsUsernames?: string[];
    editorState?: string;
}

export interface UpdateDocumentParams {
    title?: string;
    description?: string;
    editorState?: string;
}

// OData response wrapper
interface ODataResponse<T> {
    value: T[];
    '@odata.count'?: number;
}

interface ODataSingleResponse<T> {
    value?: T;
}

/**
 * Fetch all documents for the current user
 */
export async function getDocuments(): Promise<Document[]> {
    const baseUrl = getBackendUrl();
    const expand = '$expand=author,contributors($expand=user),tags($expand=tag),assets';
    const response = await apiRequest<ODataResponse<Document>>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/Documents?${expand}`
    );
    return response.value || [];
}

/**
 * Fetch a single document by ID with all relations
 */
export async function getDocument(id: string): Promise<Document> {
    const baseUrl = getBackendUrl();
    const expand = '$expand=author,contributors($expand=user),tags($expand=tag),assets';
    const response = await apiRequest<Document>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/Documents(${id})?${expand}`
    );
    return response;
}

/**
 * Create a new document using the createNewDocument action
 */
export async function createDocument(params: CreateDocumentParams): Promise<Document> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<Document>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/createNewDocument`,
        {
            method: 'POST',
            body: {
                title: params.title,
                description: params.description || '',
                parentId: params.parentId || null,
                tags: params.tags || [],
                contributorsUsernames: params.contributorsUsernames || [],
                editorState: params.editorState || '',
            },
        }
    );
    return response;
}

/**
 * Update an existing document (editorState, title, description)
 */
export async function updateDocument(id: string, params: UpdateDocumentParams): Promise<Document> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<Document>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/Documents(${id})`,
        {
            method: 'PATCH',
            body: params,
        }
    );
    return response;
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
    const baseUrl = getBackendUrl();
    await apiRequest<void>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/Documents(${id})`,
        {
            method: 'DELETE',
        }
    );
}

/**
 * Set document tags using the setDocumentTags action
 */
export async function setDocumentTags(documentId: string, tags: string[]): Promise<Document> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<Document>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/setDocumentTags`,
        {
            method: 'POST',
            body: {
                documentId,
                tags,
            },
        }
    );
    return response;
}

/**
 * Set document contributors using the setDocumentContributors action
 */
export async function setDocumentContributors(
    documentId: string,
    contributorsUsernames: string[]
): Promise<Document> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<Document>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/setDocumentContributors`,
        {
            method: 'POST',
            body: {
                documentId,
                contributorsUsernames,
            },
        }
    );
    return response;
}

/**
 * Create a document asset (metadata only)
 */
export async function createAsset(
    documentId: string,
    filename: string,
    mediaType: string
): Promise<DocumentAsset> {
    const baseUrl = getBackendUrl();
    const assetId = crypto.randomUUID();

    const response = await apiRequest<DocumentAsset>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/DocumentAssets`,
        {
            method: 'POST',
            body: {
                ID: assetId,
                document_ID: documentId,
                filename,
                mediaType,
            },
        }
    );
    return response;
}

/**
 * Upload asset binary content
 */
export async function uploadAssetContent(assetId: string, content: Blob, mediaType: string): Promise<void> {
    const baseUrl = getBackendUrl();
    await uploadBinary(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/DocumentAssets(${assetId})/content`,
        content,
        mediaType
    );
}

/**
 * Download asset binary content
 */
export async function downloadAssetContent(assetId: string): Promise<{ blob: Blob; mediaType: string }> {
    const baseUrl = getBackendUrl();
    return downloadBinary(`${baseUrl}${DOCUMENT_SERVICE_PATH}/DocumentAssets(${assetId})/content`);
}

/**
 * Get the URL for an asset's content (for img src, etc.)
 */
export function getAssetContentUrl(assetId: string): string {
    const baseUrl = getBackendUrl();
    return `${baseUrl}${DOCUMENT_SERVICE_PATH}/DocumentAssets(${assetId})/content`;
}

/**
 * Delete an asset
 */
export async function deleteAsset(assetId: string): Promise<void> {
    const baseUrl = getBackendUrl();
    await apiRequest<void>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/DocumentAssets(${assetId})`,
        {
            method: 'DELETE',
        }
    );
}

/**
 * Upload a file as an asset (combines createAsset and uploadAssetContent)
 * Returns the asset ID and URL
 */
export async function uploadAsset(
    documentId: string,
    file: File
): Promise<{ assetId: string; url: string }> {
    // Validate file size (10 MiB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new ApiError(
            `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of 10 MB`,
            413,
            'FILE_TOO_LARGE',
            false
        );
    }

    // Create asset metadata
    const asset = await createAsset(documentId, file.name, file.type);

    // Upload binary content
    await uploadAssetContent(asset.ID, file, file.type);

    return {
        assetId: asset.ID,
        url: getAssetContentUrl(asset.ID),
    };
}

/**
 * Upload raw data (like drawio XML) as an asset
 */
export async function uploadDataAsAsset(
    documentId: string,
    data: string,
    filename: string,
    mediaType: string
): Promise<{ assetId: string; url: string }> {
    const blob = new Blob([data], { type: mediaType });

    // Validate size
    const MAX_SIZE = 10 * 1024 * 1024;
    if (blob.size > MAX_SIZE) {
        throw new ApiError(
            `Data size exceeds maximum allowed size of 10 MB`,
            413,
            'FILE_TOO_LARGE',
            false
        );
    }

    // Create asset metadata
    const asset = await createAsset(documentId, filename, mediaType);

    // Upload content
    await uploadAssetContent(asset.ID, blob, mediaType);

    return {
        assetId: asset.ID,
        url: getAssetContentUrl(asset.ID),
    };
}

/**
 * Fetch all available tags (for tag selection dropdown)
 */
export async function getTags(): Promise<Tag[]> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<ODataResponse<Tag>>(
        `${baseUrl}${DOCUMENT_SERVICE_PATH}/Tags`
    );
    return response.value || [];
}

/**
 * Publish a document to GitHub (create PR)
 * This uses the Express backend's /api/publish endpoint
 */
export async function publishDocument(rootDocumentId: string): Promise<{
    message: string;
    commitUrl: string;
    branchName: string;
    pullRequestUrl?: string;
}> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<{
        message: string;
        commitUrl: string;
        branchName: string;
        pullRequestUrl?: string;
    }>(
        `${baseUrl}/api/publish`,
        {
            method: 'POST',
            body: {
                rootDocumentId,
            },
        }
    );
    return response;
}

/**
 * Sync user's fork with upstream
 */
export async function syncFork(): Promise<{ success: boolean; message: string }> {
    const baseUrl = getBackendUrl();
    const response = await apiRequest<{ success: boolean; message: string }>(
        `${baseUrl}/api/sync-fork`,
        {
            method: 'POST',
        }
    );
    return response;
}
