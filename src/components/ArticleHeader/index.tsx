// import React, { useState, useMemo, useEffect } from 'react';
// import { Input, Button, MultiComboBox, MultiComboBoxItem, MultiInput, Token } from '@ui5/webcomponents-react';
// import '@ui5/webcomponents-icons/dist/edit.js';
// import { usePageDataStore } from '@site/src/store/pageDataStore';
// import useGlobalData from '@docusaurus/useGlobalData';
// import styles from './index.module.css';

// export default function ArticleHeader() {
//     const { getActiveDocument, updateDocument, lastSaveTimestamp } = usePageDataStore();
//     const activeDocument = getActiveDocument();
//     const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

//     const { availableTags, tagKeyToLabelMap } = useMemo(() => {
//         if (!tagsData || Object.keys(tagsData).length === 0) {
//             return { availableTags: [], tagKeyToLabelMap: new Map() };
//         }
//         const tagsArray = Object.entries(tagsData)
//             .filter(([key]) => key !== 'demo')
//             .map(([key, value]: [string, any]) => ({
//                 key: key,
//                 label: value.label,
//                 description: value.description,
//             }));
//         const map = new Map(tagsArray.map((tag) => [tag.key, tag.label]));
//         return { availableTags: tagsArray, tagKeyToLabelMap: map };
//     }, [tagsData]);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editableData, setEditableData] = useState({ title: '', tags: [], authors: [] });
//     const [authorInputValue, setAuthorInputValue] = useState('');

//     useEffect(() => {
//         if (activeDocument) {
//             const tagObjects = activeDocument.tags
//                 .map((key) => availableTags.find((tag) => tag.key === key))
//                 .filter(Boolean);
//             setEditableData({
//                 title: activeDocument.title,
//                 tags: tagObjects,
//                 authors: activeDocument.authors || [],
//             });
//         }
//     }, [activeDocument?.id, availableTags]);

//     if (!activeDocument) {
//         return null;
//     }

//     const handleSave = () => {
//         const tagKeysToSave = editableData.tags.map((tag) => tag.key);
//         updateDocument(activeDocument.id, {
//             title: editableData.title,
//             tags: tagKeysToSave,
//             authors: editableData.authors,
//         });
//         setIsEditing(false);
//     };

//     const handleCancel = () => {
//         setIsEditing(false);
//         const originalTagObjects = activeDocument.tags
//             .map((key) => availableTags.find((tag) => tag.key === key))
//             .filter(Boolean);
//         setEditableData({
//             title: activeDocument.title,
//             tags: originalTagObjects,
//             authors: activeDocument.authors || [],
//         });
//     };

//     const handleAuthorAdd = (event) => {
//         const newAuthor = event.target.value.trim();
//         if (newAuthor && !editableData.authors.includes(newAuthor)) {
//             setEditableData((d) => ({ ...d, authors: [...d.authors, newAuthor] }));
//         }
//         setAuthorInputValue('');
//     };

//     const handleAuthorDelete = (event) => {
//         const authorToRemove = event.detail.token.text;
//         setEditableData((d) => ({ ...d, authors: d.authors.filter((author) => author !== authorToRemove) }));
//     };

//     let lastUpdatedDateString = 'N/A';
//     if (lastSaveTimestamp) {
//         try {
//             const date = new Date(lastSaveTimestamp);
//             if (!isNaN(date.getTime())) {
//                 lastUpdatedDateString = date.toLocaleDateString('en-US', {
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                 });
//             } else {
//                 lastUpdatedDateString = lastSaveTimestamp.split(',')[0];
//             }
//         } catch (e) {
//             lastUpdatedDateString = lastSaveTimestamp.split(',')[0];
//         }
//     }

//     if (isEditing) {
//         return (
//             <div id="article-header" className={styles.containerEditing}>
//                 <div className={styles.formField}>
//                     <Input
//                         value={editableData.title}
//                         className={styles.titleInput}
//                         placeholder="Enter a title..."
//                         onInput={(e) => setEditableData((d) => ({ ...d, title: e.target.value }))}
//                     />
//                 </div>
//                 <div className={styles.formField}>
//                     <MultiComboBox
//                         placeholder="Select tags"
//                         onSelectionChange={(e) => {
//                             const selectedObjects = e.detail.items
//                                 .map((item) => availableTags.find((tag) => tag.label === item.text))
//                                 .filter(Boolean);
//                             setEditableData((d) => ({ ...d, tags: selectedObjects }));
//                         }}
//                     >
//                         {availableTags.map((tag) => (
//                             <MultiComboBoxItem
//                                 key={tag.key}
//                                 text={tag.label}
//                                 selected={editableData.tags.some((selectedTag) => selectedTag.key === tag.key)}
//                             />
//                         ))}
//                     </MultiComboBox>
//                 </div>
//                 <div className={styles.formField}>
//                     <MultiInput
//                         placeholder="Add authors"
//                         value={authorInputValue}
//                         onInput={(e) => setAuthorInputValue(e.target.value)}
//                         onChange={handleAuthorAdd}
//                         onTokenDelete={handleAuthorDelete}
//                         tokens={editableData.authors.map((author) => (
//                             <Token key={author} text={author} />
//                         ))}
//                     />
//                 </div>
//                 <div className={styles.editingActions}>
//                     <Button onClick={handleSave} design="Emphasized">
//                         Save
//                     </Button>
//                     <Button onClick={handleCancel} design="Transparent" className={styles.cancelButton}>
//                         Cancel
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div id="article-header" className={styles.container}>
//             <h1 className={styles.displayTitle}>{activeDocument.title || 'Untitled Page'}</h1>
//             <div className={styles.actions}>
//                 <Button icon="edit" design="Transparent" onClick={() => setIsEditing(true)} />
//             </div>
//             <div className={styles.tagsContainer}>
//                 {activeDocument.tags.length > 0
//                     ? activeDocument.tags.map((tagKey) => (
//                           <span key={tagKey} className={styles.tag}>
//                               {tagKeyToLabelMap.get(tagKey) || tagKey}
//                           </span>
//                       ))
//                     : isEditing && <span className={styles.placeholder}>No tags yet</span>}
//             </div>
//             <p className={styles.updateInfo}>
//                 Last updated on <strong>{lastUpdatedDateString}</strong> by{' '}
//                 <strong>{activeDocument.authors.length > 0 ? activeDocument.authors.join(', ') : 'Unknown'}</strong>
//             </p>
//         </div>
//     );
// }

import React, { useState, useMemo } from 'react';
import { Input, Button, MultiComboBox, MultiComboBoxItem, TextArea } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit.js';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useGlobalData from '@docusaurus/useGlobalData';
import styles from './index.module.css';

// A small helper to safely format dates
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const date = new Date(timestamp);
        return isNaN(date.getTime())
            ? timestamp.split(',')[0]
            : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
                    <label className={styles.formLabel}>Title</label>
                    <Input
                        value={editableData.title}
                        className={styles.titleInput}
                        placeholder="Enter a title..."
                        onInput={(e) => setEditableData((d) => ({ ...d, title: e.target.value }))}
                    />
                </div>
                <div className={styles.formField}>
                    <label className={styles.formLabel}>Description</label>
                    <TextArea
                        value={editableData.description}
                        className={styles.descriptionTextarea}
                        placeholder="Enter a short description..."
                        onInput={(e) => setEditableData((d) => ({ ...d, description: e.target.value }))}
                    />
                </div>
                <div className={styles.formField}>
                    <label className={styles.formLabel}>Tags</label>
                    <MultiComboBox
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
                    <label className={styles.formLabel}>Authors</label>
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
