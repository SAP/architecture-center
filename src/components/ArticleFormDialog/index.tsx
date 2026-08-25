import React, { JSX } from 'react';
import {
    Button,
    Dialog,
    Input,
    TextArea,
    Bar,
    Title,
    Form,
    FormItem,
    Label,
    FlexBox,
    Text,
} from '@ui5/webcomponents-react';
import { PageMetadata } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';

interface ArticleFormDialogProps {
    open: boolean;
    initialData: PageMetadata;
    onDataChange: (data: Partial<PageMetadata>) => void;
    onSave: () => void;
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
    const { user } = useAuth();

    const isFormValid = initialData?.title?.trim().length > 0;

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
                            <Button design="Emphasized" onClick={onSave} disabled={!isFormValid}>
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
            </Form>
        </Dialog>
    );
}
