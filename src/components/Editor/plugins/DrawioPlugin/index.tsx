import React, { useEffect, useRef, useState, JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createDrawioNode, DrawioNode } from '../../nodes/DrawioNode';
import { INSERT_DRAWIO_COMMAND, OPEN_DRAWIO_DIALOG, InsertDrawioPayload } from '../commands';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { uploadDataAsAsset } from '@site/src/services/documentApi';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB

interface DrawioPluginProps {
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    onUploadError?: (error: Error) => void;
}

export default function DrawioPlugin({
    onUploadStart,
    onUploadEnd,
    onUploadError,
}: DrawioPluginProps = {}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);

    const processFile = async (file: File) => {
        if (!file || !file.name.toLowerCase().endsWith('.drawio')) {
            const error = new Error('Invalid file type. Please upload a .drawio file.');
            onUploadError?.(error);
            console.warn(error.message);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            const error = new Error(`Diagram size (${sizeMB} MB) exceeds maximum allowed size of 10 MB`);
            onUploadError?.(error);
            console.error(error);
            return;
        }

        setIsUploading(true);
        onUploadStart?.();

        try {
            // Read the XML content
            const xml = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });

            // If we have an active document, upload to backend
            if (activeDocumentId) {
                try {
                    const { assetId } = await uploadDataAsAsset(
                        activeDocumentId,
                        xml,
                        file.name,
                        'application/vnd.jgraph.mxfile+xml'
                    );
                    // Insert with assetId (no XML, will be fetched when rendered)
                    editor.dispatchCommand(INSERT_DRAWIO_COMMAND, {
                        assetId,
                        diagramXML: null,
                    });
                } catch (uploadError) {
                    // If upload fails, fall back to local XML
                    console.warn('Diagram upload failed, using local XML:', uploadError);
                    onUploadError?.(uploadError instanceof Error ? uploadError : new Error(String(uploadError)));
                    editor.dispatchCommand(INSERT_DRAWIO_COMMAND, {
                        diagramXML: xml,
                        assetId: null,
                    });
                }
            } else {
                // No active document yet, use local XML
                editor.dispatchCommand(INSERT_DRAWIO_COMMAND, {
                    diagramXML: xml,
                    assetId: null,
                });
            }
        } catch (error) {
            console.error('Error processing diagram:', error);
            onUploadError?.(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsUploading(false);
            onUploadEnd?.();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        event.target.value = '';
    };

    useEffect(() => {
        if (!editor.hasNodes([DrawioNode])) {
            throw new Error('DrawioPlugin: DrawioNode not registered on editor');
        }

        const unregisterInsert = editor.registerCommand(
            INSERT_DRAWIO_COMMAND,
            (payload: InsertDrawioPayload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertNodes([
                            $createDrawioNode({
                                diagramXML: payload.diagramXML || null,
                                assetId: payload.assetId || null,
                            }),
                        ]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const unregisterOpen = editor.registerCommand(
            OPEN_DRAWIO_DIALOG,
            () => {
                if (!isUploading) {
                    fileInputRef.current?.click();
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const editorRootElement = editor.getRootElement();
        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
        };

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                const drawioFile = Array.from(files).find((file) => file.name.toLowerCase().endsWith('.drawio'));

                if (drawioFile) {
                    processFile(drawioFile);
                }
            }
        };

        if (editorRootElement) {
            editorRootElement.addEventListener('dragover', handleDragOver);
            editorRootElement.addEventListener('drop', handleDrop);
        }

        return () => {
            unregisterInsert();
            unregisterOpen();
            if (editorRootElement) {
                editorRootElement.removeEventListener('dragover', handleDragOver);
                editorRootElement.removeEventListener('drop', handleDrop);
            }
        };
    }, [editor, isUploading]);

    return (
        <input
            type="file"
            accept=".drawio"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={isUploading}
        />
    );
}
