import React, { useState, useMemo } from 'react';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit.js';
import { usePageDataStore, PageMetadata } from '@site/src/store/pageDataStore';
import useGlobalData from '@docusaurus/useGlobalData';
import MetadataFormDialog from '../MetaFormDialog';
import styles from './index.module.css';

// A small helper to safely format dates
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
        const datePart = timestamp.split(',')[0];

        const parts = datePart.split('/');

        if (parts.length !== 3) {
            return datePart;
        }

        const [day, month, year] = parts;

        const date = new Date(year, month - 1, day);

        if (isNaN(date.getTime())) {
            return datePart;
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return timestamp.split(',')[0];
    }
};

export default function ArticleHeader() {
    const {
        getActiveDocument,
        updateDocumentLocal,
        lastSaveTimestamp,
        setDocumentTagsAsync,
        setDocumentContributorsAsync,
    } = usePageDataStore();
    const activeDocument = getActiveDocument();
    const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

    const { availableTags, tagKeyToLabelMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], tagKeyToLabelMap: new Map() };
        }
        const tagsArray = Object.entries(tagsData)
            .filter(([key]) => key !== 'demo')
            .map(([key, value]: [string, any]) => ({
                key: key,
                label: value.label,
                description: value.description,
            }));
        const map = new Map(tagsArray.map((tag) => [tag.key, tag.label]));
        return { availableTags: tagsArray, tagKeyToLabelMap: map };
    }, [tagsData]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editableData, setEditableData] = useState<PageMetadata>({
        title: '',
        tags: [],
        authors: [],
        contributors: [],
        description: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    if (!activeDocument) {
        return null;
    }

    const handleEdit = () => {
        setEditableData({
            title: activeDocument.title || '',
            tags: activeDocument.tags || [],
            authors: activeDocument.authors || [],
            contributors: activeDocument.contributors || [],
            description: activeDocument.description || '',
        });
        setSaveError(null);
        setIsDialogOpen(true);
    };

    const handleDataChange = (updates: Partial<PageMetadata>) => {
        setEditableData((prev) => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
            // Update local state for title and description
            updateDocumentLocal(activeDocument.id, {
                title: editableData.title,
                description: editableData.description,
            });

            // Update tags via API if changed
            const tagsChanged =
                JSON.stringify(activeDocument.tags) !== JSON.stringify(editableData.tags);
            if (tagsChanged) {
                await setDocumentTagsAsync(activeDocument.id, editableData.tags);
            }

            // Update contributors via API if changed
            const contributorsChanged =
                JSON.stringify(activeDocument.contributors) !== JSON.stringify(editableData.contributors);
            if (contributorsChanged) {
                await setDocumentContributorsAsync(activeDocument.id, editableData.contributors || []);
            }

            setIsDialogOpen(false);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setSaveError(null);
    };

    return (
        <>
            <div id="article-header" className={styles.container}>
                <h1 className={styles.displayTitle}>{activeDocument.title || 'Untitled Page'}</h1>
                <div className={styles.actions}>
                    <Button icon="edit" design="Transparent" onClick={handleEdit} tooltip="Edit metadata" />
                </div>
                <div className={styles.tagsContainer}>
                    {activeDocument.tags.length > 0 &&
                        activeDocument.tags.map((tagKey) => (
                            <span key={tagKey} className={styles.tag}>
                                {tagKeyToLabelMap.get(tagKey) || tagKey}
                            </span>
                        ))}
                </div>
                <p className={styles.updateInfo}>
                    Last updated on <strong>{formatDate(lastSaveTimestamp)}</strong> by{' '}
                    <strong>{activeDocument.authors.length > 0 ? activeDocument.authors.join(', ') : 'Unknown'}</strong>
                </p>
            </div>

            <MetadataFormDialog
                open={isDialogOpen}
                initialData={editableData}
                onDataChange={handleDataChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isSaving}
                error={saveError}
                isEditMode={true}
            />
        </>
    );
}
