import React, { useEffect, useRef, useState, JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createImageNode, ImageNode } from '../../nodes/ImageNode';
import { INSERT_IMAGE_COMMAND, TOGGLE_IMAGE_DIALOG, InsertImagePayload } from '../commands';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { uploadAsset } from '@site/src/services/documentApi';
import { fileToDataUrl } from '../../hooks/useAssetUpload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB

const ALLOWED_IMAGE_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);

interface ImagePluginProps {
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    onUploadError?: (error: Error) => void;
}

export default function ImagePlugin({
    onUploadStart,
    onUploadEnd,
    onUploadError,
}: ImagePluginProps = {}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            const error = new Error(
                `Unsupported image type: ${file.type}. Allowed types: PNG, JPEG, WebP, GIF, SVG`
            );
            onUploadError?.(error);
            console.error(error);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            const error = new Error(`Image size (${sizeMB} MB) exceeds maximum allowed size of 10 MB`);
            onUploadError?.(error);
            console.error(error);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setIsUploading(true);
        onUploadStart?.();

        try {
            // First, get a local preview for immediate display
            const dataUrl = await fileToDataUrl(file);

            // If we have an active document, upload to backend
            if (activeDocumentId) {
                try {
                    const { assetId, url } = await uploadAsset(activeDocumentId, file);
                    // Insert with assetId
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        src: url,
                        altText: file.name,
                        assetId,
                    });
                } catch (uploadError) {
                    // If upload fails, fall back to local data URL
                    console.warn('Image upload failed, using local data URL:', uploadError);
                    onUploadError?.(uploadError instanceof Error ? uploadError : new Error(String(uploadError)));
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        src: dataUrl,
                        altText: file.name,
                        assetId: null,
                    });
                }
            } else {
                // No active document yet, use local data URL
                // This can happen during document creation
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    src: dataUrl,
                    altText: file.name,
                    assetId: null,
                });
            }
        } catch (error) {
            console.error('Error processing image:', error);
            onUploadError?.(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsUploading(false);
            onUploadEnd?.();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagePlugin: ImageNode not registered on editor');
        }

        const unregisterInsert = editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload: InsertImagePayload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const imageNode = $createImageNode({
                            src: payload.src,
                            altText: payload.altText,
                            assetId: payload.assetId || null,
                        });
                        selection.insertNodes([imageNode]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const unregisterToggle = editor.registerCommand(
            TOGGLE_IMAGE_DIALOG,
            () => {
                if (!isUploading) {
                    fileInputRef.current?.click();
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        return () => {
            unregisterInsert();
            unregisterToggle();
        };
    }, [editor, isUploading]);

    return (
        <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={isUploading}
        />
    );
}
