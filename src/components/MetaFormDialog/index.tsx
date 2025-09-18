// src/components/MetaFormDialog.tsx

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
    Label,
} from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';

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
    const { user } = useAuth();
    const [contributorInputValue, setContributorInputValue] = useState('');

    const handleContributorAdd = (event) => {
        const newContributor = event.target.value.trim();
        if (newContributor && !initialData?.contributors?.includes(newContributor)) {
            const updatedContributors = [...(initialData?.contributors || []), newContributor];
            onDataChange({ contributors: updatedContributors });
        }
        setContributorInputValue('');
    };

    const handleTagUpdate = (event) => {
        const tags = event.detail.items.map((item) => item.text);
        onDataChange({ tags });
    };

    const isFormValid = initialData?.title?.trim().length > 0 && initialData?.tags?.length > 0;

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
                <FormItem labelContent={<Label required>Title</Label>}>
                    <Input
                        value={initialData?.title || ''}
                        onInput={(e) => onDataChange({ title: e.target.value })}
                        required
                        placeholder="Add your title..."
                    />
                </FormItem>
                <FormItem labelContent={<Label required>Author</Label>}>
                    <Input value={user?.username || 'Loading...'} readonly />
                </FormItem>
                <FormItem labelContent={<Label>Contributors</Label>}>
                    <MultiInput
                        value={contributorInputValue}
                        onInput={(e) => setContributorInputValue(e.target.value)}
                        onChange={handleContributorAdd}
                        onTokenDelete={(e) => {
                            const deletedTokens = e.detail.tokens;
                            if (deletedTokens && deletedTokens.length > 0) {
                                const tokenText = deletedTokens[0].text;
                                const updatedContributors = (initialData?.contributors || []).filter(
                                    (contributor) => contributor !== tokenText
                                );
                                onDataChange({ contributors: updatedContributors });
                            }
                        }}
                        tokens={initialData?.contributors?.map((c) => <Token key={c} text={c} />) || []}
                        placeholder="Add more contributors (optional)..."
                    />
                </FormItem>
                <FormItem labelContent={<Label required>Tags</Label>}>
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
