import React, { useState, useMemo, useEffect } from 'react';
import { Input, Button, MultiComboBox, MultiComboBoxItem, Label, TextArea } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit.js';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useGlobalData from '@docusaurus/useGlobalData';
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
    const { getActiveDocument, updateDocument, lastSaveTimestamp } = usePageDataStore();
    const activeDocument = getActiveDocument();
    const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

    const { availableTags, tagKeyToLabelMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], tagKeyToLabelMap: new Map() };
        }
        const tagsArray = Object.entries(tagsData)
            // FIX: Corrected the syntax error that caused all subsequent errors
            .filter(([key]) => key !== 'demo')
            .map(([key, value]: [string, any]) => ({
                key: key,
                label: value.label,
                description: value.description,
            }));
        const map = new Map(tagsArray.map((tag) => [tag.key, tag.label]));
        return { availableTags: tagsArray, tagKeyToLabelMap: map };
    }, [tagsData]);

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({ title: '', tags: [], description: '' });

    if (!activeDocument) {
        return null;
    }

    const handleEdit = () => {
        const tagObjects = activeDocument.tags
            .map((key) => availableTags.find((tag) => tag.key === key))
            .filter(Boolean);

        setEditableData({
            title: activeDocument.title,
            tags: tagObjects,
            description: activeDocument.description || '',
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        const tagKeysToSave = editableData.tags.map((tag) => tag.key);
        updateDocument(activeDocument.id, {
            title: editableData.title,
            tags: tagKeysToSave,
            description: editableData.description,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div id="article-header" className={styles.containerEditing}>
                <div className={styles.formField}>
                    <Label for="titleInput">Title</Label>
                    <Input
                        id="titleInput"
                        value={editableData.title}
                        className={styles.titleInput}
                        placeholder="Enter a title..."
                        onInput={(e) => setEditableData((d) => ({ ...d, title: e.target.value }))}
                    />
                </div>

                <div className={styles.formField}>
                    <div className={styles.formField}>
                        <Label for="descriptionInput">Description</Label>
                        <TextArea
                            id="descriptionInput"
                            value={editableData.description}
                            className={styles.descriptionInput}
                            placeholder="Enter a description"
                            rows={3}
                            onInput={(e) => setEditableData((d) => ({ ...d, description: e.target.value }))}
                        />
                    </div>
                    <Label for="tagsInput">Tags</Label>
                    <MultiComboBox
                        id="tagsInput"
                        placeholder="Select tags"
                        onSelectionChange={(e) => {
                            const selectedObjects = e.detail.items
                                .map((item) => availableTags.find((tag) => tag.label === item.text))
                                .filter(Boolean);
                            setEditableData((d) => ({ ...d, tags: selectedObjects }));
                        }}
                    >
                        {availableTags.map((tag) => (
                            <MultiComboBoxItem
                                key={tag.key}
                                text={tag.label}
                                selected={editableData.tags.some((selectedTag) => selectedTag.key === tag.key)}
                            />
                        ))}
                    </MultiComboBox>
                </div>
                <div className={styles.formField}>
                    <Label for="authorsInput">Author</Label>
                    <div className={styles.authorDisplay}>
                        {activeDocument.authors.length > 0 ? activeDocument.authors.join(', ') : 'N/A'}
                    </div>
                </div>
                <div className={styles.editingActions}>
                    <Button onClick={handleSave} design="Emphasized">
                        Save
                    </Button>
                    <Button onClick={handleCancel} design="Transparent" className={styles.cancelButton}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div id="article-header" className={styles.container}>
            <h1 className={styles.displayTitle}>{activeDocument.title || 'Untitled Page'}</h1>
            <div className={styles.actions}>
                <Button icon="edit" design="Transparent" onClick={handleEdit} />
            </div>
            {/* <p className={styles.description}>{activeDocument.description || 'No description provided.'}</p> */}
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
    );
}
