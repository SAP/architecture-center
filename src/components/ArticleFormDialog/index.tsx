import React, { useState, useEffect, useRef, JSX } from 'react';
import { Bar, Button, Dialog, Form, FormItem, Icon, Input, Label, TextArea, Title, FlexBox, Text } from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface AuthorProfileData {
    name: string;
    title: string;
    linkedin: string;
}

interface ArticleFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: (newAuthor?: AuthorProfileData) => void;
    onCancel: () => void;
    isEditMode?: boolean;
}

interface InputEvent { target: { value: string }; }

export default function ArticleFormDialog({
    open,
    initialData,
    onDataChange,
    onSave,
    onCancel,
    isEditMode = false,
}: ArticleFormDialogProps): JSX.Element {
    const { user, token } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const { expressBackendUrl } = siteConfig.customFields as { expressBackendUrl: string };
    const [authorName, setAuthorName] = useState('');
    const [authorTitle, setAuthorTitle] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [keywordsInput, setKeywordsInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load author profile: localStorage → authors.yml (backend) → GitHub API
    useEffect(() => {
        if (!open || !user?.username) return;
        const stored = localStorage.getItem(`author_profile_${user.username}`);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setAuthorName(data.name || '');
                setAuthorTitle(data.title || '');
                setLinkedin(data.linkedin || '');
            } catch {}
        } else {
            fetch(`${expressBackendUrl}/api/author-profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.ok ? r.json() : null)
                .then((data) => {
                    if (data?.found) {
                        setAuthorName(data.name || '');
                        setAuthorTitle(data.title || '');
                        setLinkedin(data.linkedin || '');
                    } else {
                        fetch(`https://api.github.com/users/${encodeURIComponent(user.username)}`)
                            .then((r) => r.ok ? r.json() : null)
                            .then((ghData) => { if (ghData?.name) setAuthorName(ghData.name); })
                            .catch(() => {});
                    }
                })
                .catch(() => {
                    fetch(`https://api.github.com/users/${encodeURIComponent(user.username)}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((ghData) => { if (ghData?.name) setAuthorName(ghData.name); })
                        .catch(() => {});
                });
        }
        setKeywordsInput((initialData.keywords || []).join(', '));
        setImagePreview(initialData.spotlightImage?.data || null);
    }, [open, user?.username]);

    // Sync keywords/image when initialData changes while form is open
    useEffect(() => {
        if (open) {
            setKeywordsInput((initialData.keywords || []).join(', '));
            setImagePreview(initialData.spotlightImage?.data || null);
        }
    }, [initialData.keywords, initialData.spotlightImage]);

    const handleKeywordsChange = (e: InputEvent) => {
        const raw = e.target.value;
        setKeywordsInput(raw);
        const keywords = raw.split(',').map((k) => k.trim()).filter(Boolean);
        onDataChange({ keywords });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            setImagePreview(data);
            onDataChange({ spotlightImage: { data, filename: file.name } });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        onDataChange({ spotlightImage: undefined });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const articleValid = initialData?.title?.trim().length > 0;
    const authorValid = authorName.trim().length > 0 && authorTitle.trim().length > 0;
    const isFormValid = articleValid && authorValid;

    // Always pass author data — localStorage updated immediately, authors.yml updated on publish
    const handleSave = () => {
        onSave({ name: authorName.trim(), title: authorTitle.trim(), linkedin: linkedin.trim() });
    };

    return (
        <Dialog
            open={open}
            style={{ width: '650px' }}
            header={
                <Bar>
                    <Title>{isEditMode ? 'Edit Article' : 'Create New Article'}</Title>
                </Bar>
            }
            footer={
                <Bar
                    endContent={
                        <>
                            <Button design="Emphasized" onClick={handleSave} disabled={!isFormValid}>
                                {isEditMode ? 'Save' : 'Create'}
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
                        onInput={(e: InputEvent) => onDataChange({ title: e.target.value })}
                        required
                        placeholder="Add your article title..."
                    />
                </FormItem>

                <FormItem labelContent={<Label>Description</Label>}>
                    <TextArea
                        style={{ minHeight: '80px', width: '100%' }}
                        value={initialData?.description || ''}
                        onInput={(e: InputEvent) => onDataChange({ description: e.target.value })}
                        placeholder="Add a short description (max 300 characters)..."
                    />
                </FormItem>

                <FormItem labelContent={<Label>Author</Label>}>
                    <FlexBox alignItems="Center">
                        {user?.avatar && (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        )}
                        <Text style={{ marginLeft: '0.5rem' }}>{user?.username || 'Loading...'}</Text>
                    </FlexBox>
                </FormItem>

                <FormItem labelContent={<Label required>Your Name</Label>}>
                    <Input
                        value={authorName}
                        onInput={(e: InputEvent) => setAuthorName(e.target.value)}
                        required
                        placeholder="Your display name"
                    />
                </FormItem>

                <FormItem labelContent={<Label required>Title / Role</Label>}>
                    <Input
                        value={authorTitle}
                        onInput={(e: InputEvent) => setAuthorTitle(e.target.value)}
                        required
                        placeholder="e.g. Senior Architect"
                    />
                </FormItem>

                <FormItem labelContent={<Label>LinkedIn Handle</Label>}>
                    <Input
                        value={linkedin}
                        onInput={(e: InputEvent) => setLinkedin(e.target.value)}
                        placeholder="e.g. john-doe"
                    />
                </FormItem>

                <FormItem labelContent={<Label>Keywords</Label>}>
                    <Input
                        value={keywordsInput}
                        onInput={handleKeywordsChange}
                        placeholder="e.g. SAP BTP, AI, Cloud (comma-separated)"
                        style={{ width: '100%' }}
                    />
                </FormItem>

                <FormItem labelContent={<Label>Spotlight Image</Label>}>
                    <FlexBox direction="Column" style={{ gap: '0.4rem' }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        {!imagePreview ? (
                            <>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sapSelectedColor, #0a6ed1)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--sapSelectedColor, #0a6ed1)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sapField_BorderColor, #89919a)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--sapContent_LabelColor, #6a6d70)'; }}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 1rem',
                                        border: '1px dashed var(--sapField_BorderColor, #89919a)',
                                        borderRadius: '0.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--sapContent_LabelColor, #6a6d70)',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        transition: 'border-color 0.15s, color 0.15s',
                                    }}
                                >
                                    <Icon name="upload" style={{ fontSize: '1rem' }} />
                                    Upload a file
                                </div>
                                <Text style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor, #6a6d70)' }}>
                                    Optional. Default image used if not provided.
                                </Text>
                            </>
                        ) : (
                            <FlexBox alignItems="Center"
                                onClick={() => fileInputRef.current?.click()}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sapSelectedColor, #0a6ed1)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sapField_BorderColor, #89919a)'; }}
                                style={{ gap: '0.5rem', padding: '0.4rem 0.6rem', border: '1px solid var(--sapField_BorderColor, #89919a)', borderRadius: '0.375rem', width: 'fit-content', cursor: 'pointer', transition: 'border-color 0.15s' }}
                            >
                                <img
                                    src={imagePreview}
                                    alt="Spotlight preview"
                                    style={{ height: '32px', width: '48px', objectFit: 'cover', borderRadius: '3px' }}
                                />
                                <Text style={{ fontSize: '0.8125rem', color: 'var(--sapTextColor, #32363a)' }}>
                                    {initialData.spotlightImage?.filename || 'image'}
                                </Text>
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                                    style={{ cursor: 'pointer', color: 'var(--sapContent_LabelColor, #6a6d70)', fontSize: '0.75rem', marginLeft: '0.25rem' }}
                                >
                                    ✕
                                </span>
                            </FlexBox>
                        )}
                    </FlexBox>
                </FormItem>
            </Form>
        </Dialog>
    );
}
