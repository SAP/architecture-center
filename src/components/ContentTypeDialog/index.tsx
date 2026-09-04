import React, { JSX } from 'react';
import { Bar, Button, Dialog, Icon, Title } from '@ui5/webcomponents-react';
import styles from './index.module.css';

export type ContentType = 'ref-arch' | 'article';

interface ContentTypeDialogProps {
    open: boolean;
    onSelect: (type: ContentType) => void;
    onCancel: () => void;
    isArticleLocked?: boolean;
    onRequestSapLogin?: () => void;
}

export default function ContentTypeDialog({
    open,
    onSelect,
    onCancel,
    isArticleLocked = false,
    onRequestSapLogin,
}: ContentTypeDialogProps): JSX.Element {
    const handleArticleClick = () => {
        if (isArticleLocked) {
            onRequestSapLogin?.();
        } else {
            onSelect('article');
        }
    };

    return (
        <Dialog
            open={open}
            style={{ width: '560px' }}
            header={
                <Bar>
                    <Title>What would you like to create?</Title>
                </Bar>
            }
            footer={
                <Bar endContent={<Button onClick={onCancel}>Cancel</Button>} />
            }
        >
            <div className={styles.cardGrid}>
                <button className={styles.typeCard} onClick={() => onSelect('ref-arch')}>
                    <Icon name="org-chart" className={styles.cardIcon} />
                    <div className={styles.cardTitle}>Reference Architecture</div>
                    <div className={styles.cardDescription}>
                        A proven blueprint showcasing how SAP offerings come together to deliver business value
                    </div>
                </button>
                <button
                    className={styles.typeCard}
                    onClick={handleArticleClick}
                    title={isArticleLocked ? 'Sign in with your SAP account to access articles' : undefined}
                >
                    <Icon name="document-text" className={styles.cardIcon} />
                    <div className={styles.cardTitle}>Article</div>
                    <div className={styles.cardDescription}>
                        Share insights, best practices, or technical guides with the community
                    </div>
                </button>
            </div>
        </Dialog>
    );
}
