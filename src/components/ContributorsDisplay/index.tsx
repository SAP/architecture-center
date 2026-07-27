import React, { useState, useMemo, useRef, KeyboardEvent } from 'react';
import { Icon, MultiComboBox, MultiComboBoxItem, Avatar, Button, FlexBox } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/information.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import styles from './index.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';

interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
}
interface GitHubSearchResponse {
    items: GitHubUser[];
}

interface ContributorsDisplayProps {
    contributors: string[];
    onContributorsChange?: (updatedContributors: string[]) => void;
    readOnly?: boolean;
}

const ContributorsDisplay: React.FC<ContributorsDisplayProps> = ({ contributors, onContributorsChange, readOnly = false }) => {
    const { siteConfig } = useDocusaurusContext();
    const { token } = useAuth();
    const backendUrl = siteConfig.customFields?.expressBackendUrl as string | undefined;

    const [isEditing, setIsEditing] = useState(false);
    const [editingContributors, setEditingContributors] = useState<string[]>([]);
    const [contributorSearchQuery, setContributorSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUsers = async (query: string) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const apiUrl = `${backendUrl}/user/github/search-users?q=${query}`;
            const response = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
                signal,
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data: GitHubSearchResponse = await response.json();
            const existingContributors = new Set(editingContributors || []);
            setSearchResults(data.items.filter((item) => !existingContributors.has(item.login)));
        } catch (error: unknown) {
            const err = error as Error;
            if (err.name !== 'AbortError') console.error('Error searching:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleContributorInput = (event: React.ChangeEvent<HTMLInputElement> & { target: { value: string } }) => {
        const query = event.target.value || '';
        setContributorSearchQuery(query);

        // Debounced search
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();

        if (!backendUrl || query.trim().length < 3 || !isEditing) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceTimerRef.current = setTimeout(() => fetchUsers(query), 300);
    };

    const handleContributorSelection = (event: { detail: { items: { text: string }[] } }) => {
        const selectedItems: { text: string }[] = event.detail.items || [];
        const newlySelectedLogins = selectedItems.map((item) => item.text);

        setEditingContributors((prevContributors) => {
            const preservedOrder = prevContributors.filter((login) => newlySelectedLogins.includes(login));

            const newAdditions = newlySelectedLogins.filter((login) => !prevContributors.includes(login));

            return [...preservedOrder, ...newAdditions];
        });
    };

    const handleContributorKeyDown = async (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' && contributorSearchQuery.trim()) {
            event.preventDefault();
            const newContributor = contributorSearchQuery.trim();
            const currentContributors = editingContributors || [];
            if (!currentContributors.includes(newContributor)) {
                setEditingContributors([...currentContributors, newContributor]);
            }
            setContributorSearchQuery('');
            setSearchResults([]);
        }
    };

    const contributorOptions = useMemo(() => {
        const optionsMap = new Map<string, { id: string | number; login: string; avatar_url?: string }>();
        editingContributors?.forEach((login) => {
            optionsMap.set(login, { id: login, login: login });
        });
        searchResults.forEach((user) => {
            optionsMap.set(user.login, { id: user.id, login: user.login, avatar_url: user.avatar_url });
        });

        const options = Array.from(optionsMap.values());

        // FIX: Sort to show unselected items first, then selected items at the end.
        options.sort((a, b) => {
            const isASelected = editingContributors.includes(a.login);
            const isBSelected = editingContributors.includes(b.login);
            return Number(isASelected) - Number(isBSelected);
        });

        return options;
    }, [searchResults, editingContributors]);

    const handleEditClick = () => {
        setEditingContributors([...contributors]);
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        onContributorsChange?.(editingContributors); // FIX: Safely call the function
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleWrapper}>
                <Icon name="information" className={styles.infoIcon} />
                <h3 className={styles.title}>Contributors</h3>
            </div>
            {isEditing ? (
                <div className={styles.editContainer}>
                    <MultiComboBox
                        filter="None"
                        placeholder="Search or add a GitHub username..."
                        value={contributorSearchQuery}
                        onInput={handleContributorInput}
                        onSelectionChange={handleContributorSelection}
                        onKeyDown={handleContributorKeyDown}
                        disabled={!backendUrl}
                        className={styles.multiComboBox}
                    >
                        {isSearching && <MultiComboBoxItem text="Searching..." />}
                        {contributorOptions.map((user) => (
                            <MultiComboBoxItem
                                key={user.id}
                                text={user.login}
                                selected={editingContributors.includes(user.login)}
                            >
                                <div className={styles.comboItem}>
                                    <Avatar size="XS" image={`https://github.com/${user.login}.png`} />
                                    <span>{user.login}</span>
                                </div>
                            </MultiComboBoxItem>
                        ))}
                    </MultiComboBox>
                    <FlexBox gap="0.5rem">
                        <Button design="Emphasized" onClick={handleSaveClick}>
                            Save
                        </Button>
                        <Button onClick={handleCancelClick}>Cancel</Button>
                    </FlexBox>
                </div>
            ) : (
                <div className={styles.list} onClick={!readOnly ? handleEditClick : undefined} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                    {contributors && contributors.length > 0 ? (
                        contributors.map((username, index) => (
                            <a
                                key={username}
                                href={`https://github.com/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.contributor}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={`https://github.com/${username}.png`}
                                    alt={`Profile of ${username}`}
                                    className={styles.avatar}
                                />
                                <span className={styles.username}>{username}</span>
                                {index < contributors.length - 1 && ','}
                            </a>
                        ))
                    ) : (
                        <span className={styles.noContributors}>
                            {readOnly ? 'No contributors listed.' : 'Click to add contributors.'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContributorsDisplay;
