import React, { useState, useEffect, JSX } from 'react';
import { Bar, Button, Dialog, Form, FormItem, Input, Label, TextArea, Title, FlexBox, Text } from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';

export interface AuthorProfileData {
    name: string;
    title: string;
    linkedin: string;
}

interface ArticleFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: (authorProfile?: AuthorProfileData) => void;
    onCancel: () => void;
    isEditMode?: boolean;
    showAuthorSetup?: boolean;
}

interface InputEvent { target: { value: string }; }

export default function ArticleFormDialog({
    open,
    initialData,
    onDataChange,
    onSave,
    onCancel,
    isEditMode = false,
    showAuthorSetup = false,
}: ArticleFormDialogProps): JSX.Element {
    const { user } = useAuth();
    const [authorName, setAuthorName] = useState('');
    const [authorTitle, setAuthorTitle] = useState('');
    const [linkedin, setLinkedin] = useState('');

    // Auto-fetch real name from GitHub when author setup is needed
    useEffect(() => {
        if (!open || !showAuthorSetup || !user?.username) return;
        fetch(`https://api.github.com/users/${encodeURIComponent(user.username)}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.name) setAuthorName(data.name); })
            .catch(() => {});
    }, [open, showAuthorSetup, user?.username]);

    const articleValid = initialData?.title?.trim().length > 0;
    const authorValid = !showAuthorSetup || (authorName.trim().length > 0 && authorTitle.trim().length > 0);
    const isFormValid = articleValid && authorValid;

    const handleSave = () => {
        if (showAuthorSetup) {
            onSave({ name: authorName.trim(), title: authorTitle.trim(), linkedin: linkedin.trim() });
        } else {
            onSave();
        }
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

                {showAuthorSetup && (
                    <>
                        <FormItem labelContent={<Label required>Your Name</Label>}>
                            <Input
                                value={authorName}
                                onInput={(e: InputEvent) => setAuthorName(e.target.value)}
                                placeholder="Your full name"
                                required
                            />
                        </FormItem>

                        <FormItem labelContent={<Label required>Title / Role</Label>}>
                            <Input
                                value={authorTitle}
                                onInput={(e: InputEvent) => setAuthorTitle(e.target.value)}
                                placeholder="e.g. Senior Architect, Head of Office of the CTO"
                                required
                            />
                        </FormItem>

                        <FormItem labelContent={<Label>LinkedIn Handle</Label>}>
                            <Input
                                value={linkedin}
                                onInput={(e: InputEvent) => setLinkedin(e.target.value)}
                                placeholder="e.g. john-doe (optional)"
                            />
                        </FormItem>
                    </>
                )}
            </Form>
        </Dialog>
    );
}
