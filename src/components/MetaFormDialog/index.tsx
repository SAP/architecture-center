import React, { useState, useMemo, useEffect, JSX, KeyboardEvent, useRef } from 'react';
import {
    Button,
    Dialog,
    Input,
    TextArea,
    MultiComboBox,
    MultiComboBoxItem,
    Bar,
    Title,
    Form,
    FormItem,
    Label,
    FlexBox,
    Avatar,
    Text,
} from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface Tag {
    label: string;
    description: string;
    count: number;
}
interface TagsData {
    [key: string]: Tag;
}
interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
}
interface GitHubSearchResponse {
    items: GitHubUser[];
}
interface MetadataFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default React.memo(function MetadataFormDialog({
    open,
    initialData,
    onDataChange,
    onSave,
    onCancel,
}: MetadataFormDialogProps): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const { user, token } = useAuth();

    const [contributorSearchQuery, setContributorSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});

    const pluginData: { tags?: TagsData } | undefined = usePluginData('docusaurus-tags');
    const tagsData: TagsData = pluginData?.tags || {};
    const backendUrl = siteConfig.customFields?.expressBackendUrl as string | undefined;

    const { availableTags, labelToKeyMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], labelToKeyMap: new Map() };
        }
        const tagsArray = Object.entries(tagsData).map(([key, value]) => ({
            key,
            label: value.label,
            description: value.description,
            count: value.count,
        }));
        const map = new Map(tagsArray.map((tag) => [tag.label, tag.key]));
        return { availableTags: tagsArray, labelToKeyMap: map };
    }, [tagsData]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const multiComboRef = useRef<any>(null);

    useEffect(() => {
        if (!backendUrl || contributorSearchQuery.trim().length < 3) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 200);
        return () => {
            clearTimeout(debounceTimer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [contributorSearchQuery, initialData.contributors, backendUrl, token]);

    useEffect(() => {
        if (!isSearching && searchResults.length > 0 && multiComboRef.current) {
            multiComboRef.current.open = true;
        }
    }, [isSearching, searchResults]);

    useEffect(() => {
        const newAvatars = { ...userAvatars };
        searchResults.forEach((user) => {
            if (!newAvatars[user.login]) {
                newAvatars[user.login] = user.avatar_url;
            }
        });
        setUserAvatars(newAvatars);
    }, [searchResults]);

    const fetchUsers = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const apiUrl = `${backendUrl}/user/github/search-users?q=${contributorSearchQuery}`;
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
                signal,
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data: GitHubSearchResponse = await response.json();
            console.log('Fetched user data:', data);
            const existingContributors = new Set(initialData.contributors || []);
            const filteredResults = data.items.filter((item) => !existingContributors.has(item.login));
            setSearchResults(filteredResults);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error searching for contributors:', error);
                setSearchResults([]);
            }
        } finally {
            setIsSearching(false);
            abortControllerRef.current = null;
        }
    };

    const fetchSingleUserAvatar = async (login: string): Promise<string | null> => {
        try {
            const apiUrl = `${backendUrl}/github/user/${encodeURIComponent(login)}`;
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });
            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();
            return data.avatar_url || null;
        } catch (error) {
            console.error('Error fetching single user:', error);
            return null;
        }
    };

    const handleTagUpdate = (event: any) => {
        const selectedItems: { text: string }[] = event.detail.items;
        const selectedKeys = selectedItems
            .map((item) => {
                const cleanLabel = item.text.replace(/ \(\d+\)$/, '');
                return labelToKeyMap.get(cleanLabel);
            })
            .filter((key): key is string => !!key);
        onDataChange({ tags: selectedKeys });
    };

    const handleContributorInput = (event: any) => {
        setContributorSearchQuery(event.target.value || '');
    };

    const handleContributorSelection = (event: any) => {
        const selectedItems: { text: string }[] = event.detail.items || [];
        onDataChange({ contributors: selectedItems.map((item) => item.text) });
    };

    const handleContributorKeyDown = async (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' && contributorSearchQuery.trim()) {
            event.preventDefault();
            const newContributor = contributorSearchQuery.trim();
            const currentContributors = initialData.contributors || [];

            if (!currentContributors.includes(newContributor)) {
                onDataChange({
                    contributors: [...currentContributors, newContributor],
                });
                if (!userAvatars[newContributor]) {
                    const avatar = await fetchSingleUserAvatar(newContributor);
                    if (avatar) {
                        setUserAvatars((prev) => ({ ...prev, [newContributor]: avatar }));
                    }
                }
            }
            setContributorSearchQuery('');
            setSearchResults([]);
        }
    };

    const contributorOptions = useMemo(() => {
        const optionsMap = new Map<string, { id: string | number; login: string; avatar_url?: string }>();

        initialData.contributors?.forEach((login) => {
            optionsMap.set(login, { id: login, login: login, avatar_url: userAvatars[login] });
        });

        searchResults.forEach((user) => {
            optionsMap.set(user.login, { id: user.id, login: user.login, avatar_url: user.avatar_url });
        });

        return Array.from(optionsMap.values());
    }, [searchResults, initialData.contributors, userAvatars]);

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
                            <Button design="Emphasized" onClick={onSave} disabled={!isFormValid}>
                                Create
                            </Button>
                            <Button onClick={onCancel}>Cancel</Button>
                        </>
                    }
                />
            }
        >
            <Form style={{ padding: '1rem' }}>
                <FormItem labelContent={<Label required>Title</Label>}>
                    <Input
                        value={initialData?.title || ''}
                        onInput={(e: any) => onDataChange({ title: e.target.value })}
                        required
                        placeholder="Add your title..."
                    />
                </FormItem>

                <FormItem labelContent={<Label>Description</Label>}>
                    <TextArea
                        style={{ minHeight: '80px', width: '100%' }}
                        value={initialData?.description || ''}
                        onInput={(e: any) => onDataChange({ description: e.target.value })}
                        placeholder="Add a short description (max 300 characters)..."
                    />
                </FormItem>

                <FormItem labelContent={<Label required>Author</Label>}>
                    <FlexBox alignItems="Center">
                        {
                            <img
                                src={user.avatar}
                                alt={user.username}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        }
                        <Text style={{ marginLeft: '0.5rem' }}>{user?.username || 'Loading...'}</Text>
                    </FlexBox>
                </FormItem>

                <FormItem labelContent={<Label>Contributors</Label>}>
                    <MultiComboBox
                        ref={multiComboRef}
                        filter="None"
                        placeholder="Search or add a GitHub username..."
                        noValidation
                        value={contributorSearchQuery}
                        onInput={handleContributorInput}
                        onSelectionChange={handleContributorSelection}
                        onKeyDown={handleContributorKeyDown}
                        disabled={!backendUrl}
                    >
                        {isSearching && <MultiComboBoxItem text="Searching..." />}
                        {!isSearching &&
                            contributorOptions.map((user) => (
                                <MultiComboBoxItem
                                    key={user.id}
                                    text={user.login}
                                    selected={initialData.contributors?.includes(user.login)}
                                    // additionalText={<Avatar size="XS" icon={user.avatar_url} />}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Avatar size="XS" icon={user.avatar_url} />
                                        <span>{user.login}</span>
                                    </div>
                                </MultiComboBoxItem>
                            ))}
                    </MultiComboBox>
                </FormItem>

                <FormItem labelContent={<Label required>Tags</Label>}>
                    <MultiComboBox onSelectionChange={handleTagUpdate} placeholder="Select at least one tag...">
                        {availableTags.map((tag) => (
                            <MultiComboBoxItem
                                key={tag.key}
                                text={`${tag.label} (${tag.count})`}
                                selected={initialData?.tags.includes(tag.key)}
                            />
                        ))}
                    </MultiComboBox>
                </FormItem>
            </Form>
        </Dialog>
    );
});
