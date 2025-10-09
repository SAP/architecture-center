import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Button,
    Dialog,
    Input,
    TextArea,
    MultiInput,
    SuggestionItem,
    Bar,
    Title,
    Form,
    FormItem,
    Token,
    Label,
    MultiComboBox,
    MultiComboBoxItem,
} from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';
import useGlobalData from '@docusaurus/useGlobalData';
import siteConfig from '@generated/docusaurus.config';

interface GitHubUser {
    login: string;
    id: number;
}

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
    const { user, token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const expressBackendUrl = siteConfig.customFields.expressBackendUrl as string;

    useEffect(() => {
        if (open && user?.username) {
            if (!initialData?.contributors || initialData.contributors.length === 0) {
                onDataChange({ contributors: [user.username] });
            }
        }
    }, [open, user]);

    const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

    const { availableTags, labelToKeyMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], labelToKeyMap: new Map() };
        }
        const tagsArray = Object.entries(tagsData)
            .filter(([key]) => key !== 'demo')
            .map(([key, value]: [string, any]) => ({ key: key, label: value.label }));
        const map = new Map(tagsArray.map((tag) => [tag.label, tag.key]));
        return { availableTags: tagsArray, labelToKeyMap: map };
    }, [tagsData]);

    const searchGitHubUsers = useCallback(
        async (query: string) => {
            if (!query || query.length < 3 || !token) {
                setSearchResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const response = await fetch(`${expressBackendUrl}/user/github/search-users?q=${query}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                });
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.items || []);
                } else {
                    console.error('Failed to search users via backend proxy!', {
                        status: response.status,
                        statusText: response.statusText,
                    });
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Network or other error during proxied search:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        [token, expressBackendUrl]
    );

    useEffect(() => {
        const timerId = setTimeout(() => {
            searchGitHubUsers(searchQuery);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery, searchGitHubUsers]);

    const handleTagUpdate = (event) => {
        const selectedLabels = event.detail.items.map((item) => item.text);
        const selectedKeys = selectedLabels.map((label) => labelToKeyMap.get(label)).filter(Boolean);
        onDataChange({ tags: selectedKeys });
    };

    const handleContributorChange = (event) => {
        if (event.detail?.suggestionItem) {
            const selectedUsername = event.detail.suggestionItem.text;
            const currentContributors = initialData?.contributors || [];

            if (!currentContributors.includes(selectedUsername)) {
                const updatedContributors = [...currentContributors, selectedUsername];
                onDataChange({ contributors: updatedContributors });
            }

            setTimeout(() => {
                setSearchQuery('');
                setSearchResults([]);
            }, 0);
        }
    };

    const handleTokenDelete = (event) => {
        const deletedTokenText = event.detail.tokens[0].text;
        const updatedContributors = (initialData?.contributors || []).filter((c) => c !== deletedTokenText);
        onDataChange({ contributors: updatedContributors });
    };

    const isFormValid = initialData?.title?.trim().length > 0 && initialData?.tags?.length > 0;

    const filteredSearchResults = useMemo(() => {
        const currentContributors = initialData?.contributors || [];
        return searchResults.filter((ghUser) => !currentContributors.includes(ghUser.login));
    }, [searchResults, initialData?.contributors]);

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
                        value={searchQuery}
                        onInput={(e) => setSearchQuery(e.target.value)}
                        onChange={handleContributorChange}
                        onTokenDelete={handleTokenDelete}
                        showSuggestions={searchQuery.length > 2}
                        tokens={initialData?.contributors?.map((c) => <Token key={c} text={c} />) || []}
                        placeholder="Search for GitHub users..."
                    >
                        {isLoading && <SuggestionItem text="Searching..." />}
                        {!isLoading && filteredSearchResults.length === 0 && searchQuery.length > 2 && (
                            <SuggestionItem text="No users found." />
                        )}
                        {filteredSearchResults.map((ghUser) => (
                            <SuggestionItem key={ghUser.id} text={ghUser.login} />
                        ))}
                    </MultiInput>
                </FormItem>
                <FormItem labelContent={<Label required>Tags</Label>}>
                    <MultiComboBox onSelectionChange={handleTagUpdate} placeholder="Select at least one tag...">
                        {availableTags.map((tag) => (
                            <MultiComboBoxItem
                                key={tag.key}
                                text={tag.label}
                                selected={initialData?.tags.includes(tag.key)}
                            />
                        ))}
                    </MultiComboBox>
                </FormItem>
            </Form>
        </Dialog>
    );
}
