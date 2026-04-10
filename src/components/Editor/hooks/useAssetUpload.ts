import { useState, useCallback } from 'react';
import { uploadAsset, uploadDataAsAsset } from '@site/src/services/documentApi';
import { ApiError } from '@site/src/services/apiClient';

interface UseAssetUploadResult {
    uploadImageFile: (documentId: string, file: File) => Promise<{ assetId: string; url: string }>;
    uploadDrawioXml: (documentId: string, xml: string, filename: string) => Promise<{ assetId: string; url: string }>;
    isUploading: boolean;
    uploadError: Error | null;
    clearError: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB

const ALLOWED_IMAGE_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);

/**
 * Hook for uploading assets to the backend
 */
export function useAssetUpload(): UseAssetUploadResult {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<Error | null>(null);

    const clearError = useCallback(() => {
        setUploadError(null);
    }, []);

    const uploadImageFile = useCallback(
        async (documentId: string, file: File): Promise<{ assetId: string; url: string }> => {
            // Validate file type
            if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                const error = new Error(
                    `Unsupported image type: ${file.type}. Allowed types: PNG, JPEG, WebP, GIF, SVG`
                );
                setUploadError(error);
                throw error;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                const error = new Error(`Image size (${sizeMB} MB) exceeds maximum allowed size of 10 MB`);
                setUploadError(error);
                throw error;
            }

            setIsUploading(true);
            setUploadError(null);

            try {
                const result = await uploadAsset(documentId, file);
                return result;
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                setUploadError(err);
                throw err;
            } finally {
                setIsUploading(false);
            }
        },
        []
    );

    const uploadDrawioXml = useCallback(
        async (
            documentId: string,
            xml: string,
            filename: string
        ): Promise<{ assetId: string; url: string }> => {
            // Validate size
            const size = new Blob([xml]).size;
            if (size > MAX_FILE_SIZE) {
                const sizeMB = (size / 1024 / 1024).toFixed(2);
                const error = new Error(`Diagram size (${sizeMB} MB) exceeds maximum allowed size of 10 MB`);
                setUploadError(error);
                throw error;
            }

            setIsUploading(true);
            setUploadError(null);

            try {
                const result = await uploadDataAsAsset(
                    documentId,
                    xml,
                    filename,
                    'application/vnd.jgraph.mxfile+xml'
                );
                return result;
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                setUploadError(err);
                throw err;
            } finally {
                setIsUploading(false);
            }
        },
        []
    );

    return {
        uploadImageFile,
        uploadDrawioXml,
        isUploading,
        uploadError,
        clearError,
    };
}

/**
 * Convert a File to a base64 data URL (for local preview before upload)
 */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Check if a string is a base64 data URL
 */
export function isBase64DataUrl(src: string): boolean {
    return src.startsWith('data:');
}

/**
 * Extract base64 data from a data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): { data: string; mimeType: string } | null {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
        mimeType: match[1],
        data: match[2],
    };
}

/**
 * Convert base64 data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
    const extracted = extractBase64FromDataUrl(dataUrl);
    if (!extracted) return null;

    const byteCharacters = atob(extracted.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: extracted.mimeType });
}

/**
 * Convert base64 data URL to File
 */
export function dataUrlToFile(dataUrl: string, filename: string): File | null {
    const blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    return new File([blob], filename, { type: blob.type });
}
