import React, { useState } from 'react';
import {
    Button,
    Dialog,
    Input,
    MultiComboBox,
    MultiComboBoxItem,
    MultiInput,
    Bar,
    Title,
    Form,
    FormItem,
    Token,
} from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';

interface MetadataFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const AVAILABLE_TAGS = [
    'Generative AI',
    'Amazon Web Services',
    'Microsoft Azure',
    'Google Cloud Platform',
    'Application Development & Automation',
    'Data & Analytics',
];

export default function MetadataFormDialog({
    open,
    initialData,
    onDataChange,
    onSave,
    onCancel,
}: MetadataFormDialogProps) {
    const [authorInputValue, setAuthorInputValue] = useState('');

    const handleAuthorAdd = (event) => {
        const newAuthor = event.target.value.trim();
        if (newAuthor && !initialData?.authors.includes(newAuthor)) {
            const updatedAuthors = [...(initialData?.authors || []), newAuthor];
            onDataChange({ authors: updatedAuthors });
        }

        setAuthorInputValue('');
    };

    const handleAuthorDelete = (event) => {
        const authorToRemove = event.detail.token.text;
        const updatedAuthors = initialData?.authors.filter((author) => author !== authorToRemove);
        onDataChange({ authors: updatedAuthors });
    };

    const handleTagUpdate = (event) => {
        const tags = event.detail.items.map((item) => item.text);
        onDataChange({ tags });
    };

    const isFormValid =
        initialData?.title?.trim().length > 0 && initialData?.authors?.length > 0 && initialData?.tags?.length > 0;

    return (
        <Dialog
            open={open}
            style={{ width: '650px' }}
            header={
                <Bar>
                    <Title>Create New Reference Architecture</Title>
                </Bar>
            }
            footer={
                <Bar
                    endContent={
                        <>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Button design="Emphasized" onClick={onSave} disabled={!isFormValid}>
                                Create
                            </Button>
                        </>
                    }
                />
            }
        >
            <Form style={{ padding: '1rem' }}>
                <FormItem label="Title (Required)">
                    <Input
                        value={initialData?.title || ''}
                        onInput={(e) => onDataChange({ title: e.target.value })}
                        required
                    />
                </FormItem>
                <FormItem label="Authors (Required)">
                    {/* Use the corrected props for MultiInput */}
                    <MultiInput
                        value={authorInputValue}
                        onInput={(e) => setAuthorInputValue(e.target.value)}
                        onChange={handleAuthorAdd}
                        onTokenDelete={handleAuthorDelete}
                        tokens={initialData?.authors?.map((author) => <Token key={author} text={author} />) || []}
                        placeholder="Add at least one author..."
                    />
                </FormItem>
                <FormItem label="Tags (Required)">
                    <MultiComboBox onSelectionChange={handleTagUpdate} placeholder="Select at least one tag...">
                        {AVAILABLE_TAGS.map((tag) => (
                            <MultiComboBoxItem key={tag} text={tag} />
                        ))}
                    </MultiComboBox>
                </FormItem>
            </Form>
        </Dialog>
    );
}
