import React, { useState, useMemo } from 'react';
import {
    Button,
    Dialog,
    Input,
    TextArea,
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
import useGlobalData from '@docusaurus/useGlobalData';

interface MetadataFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function MetadataFormDialog({
    open,
    initialData,
    onDataChange,
    onSave,
    onCancel,
}: MetadataFormDialogProps) {
    const { user } = useAuth();
    const [contributorInputValue, setContributorInputValue] = useState('');

    const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

    const { availableTags, labelToKeyMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], labelToKeyMap: new Map() };
        }

        const tagsArray = Object.entries(tagsData)
            .filter(([key]) => key !== 'demo')
            .map(([key, value]: [string, any]) => ({
                key: key,
                label: value.label,
                description: value.description,
            }));

        const map = new Map(tagsArray.map((tag) => [tag.label, tag.key]));
        return { availableTags: tagsArray, labelToKeyMap: map };
    }, [tagsData]);

    const handleContributorAdd = (event) => {
        const newContributor = event.target.value.trim();
        if (newContributor && !initialData?.contributors?.includes(newContributor)) {
            const updatedContributors = [...(initialData?.contributors || []), newContributor];
            onDataChange({ contributors: updatedContributors });
        }
        setContributorInputValue('');
    };

    const handleTagUpdate = (event) => {
        const selectedLabels = event.detail.items.map((item) => item.text);
        const selectedKeys = selectedLabels.map((label) => labelToKeyMap.get(label)).filter(Boolean);
        onDataChange({ tags: selectedKeys });
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

                <FormItem labelContent={<Label>Description</Label>}>
                    <TextArea
                        style={{ minHeight: '80px', width: '100%' }}
                        value={initialData?.description || ''}
                        onInput={(e) => onDataChange({ description: e.target.value })}
                        placeholder="Add a short description (max 300 characters)..."
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
                        {availableTags.map((tag) => (
                            <MultiComboBoxItem key={tag.key} text={tag.label} />
                        ))}
                    </MultiComboBox>
                </FormItem>
            </Form>
        </Dialog>
    );
}
