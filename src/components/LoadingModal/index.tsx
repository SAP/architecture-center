import React, { JSX } from 'react';
import { Icon, BusyIndicator, Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/pending.js';
import '@ui5/webcomponents-icons/dist/sys-enter-2.js';
import '@ui5/webcomponents-icons/dist/error.js';
import styles from './index.module.css';

export type PublishStage = 'idle' | 'forking' | 'packaging' | 'committing' | 'success' | 'error';

interface Stage {
    key: PublishStage;
    label: string;
}

const STAGES: Stage[] = [
    { key: 'forking', label: 'Forking Repository' },
    { key: 'packaging', label: 'Packaging Your Work' },
    { key: 'committing', label: 'Committing to GitHub' },
];

interface LoadingModalProps {
    status: PublishStage;
    error: string | null;
    commitUrl: string | null;
    onClose: () => void;
    onSuccessFinish: () => void;
}

const StageItem: React.FC<{ stage: Stage; currentStatus: PublishStage }> = ({ stage, currentStatus }) => {
    const stageIndex = STAGES.findIndex((s) => s.key === stage.key);
    const currentStatusIndex = STAGES.findIndex((s) => s.key === currentStatus);

    let icon;
    if (currentStatus === 'error' && stage.key === currentStatus) {
        icon = <Icon name="error" className={`${styles.icon} ${styles.iconError}`} />;
    } else if (currentStatusIndex > stageIndex || currentStatus === 'success') {
        icon = <Icon name="sys-enter-2" className={`${styles.icon} ${styles.iconSuccess}`} />;
    } else if (currentStatusIndex === stageIndex) {
        icon = <BusyIndicator active className={styles.spinner} />;
    } else {
        icon = <Icon name="pending" className={`${styles.icon} ${styles.iconPending}`} />;
    }

    return (
        <li className={styles.stageItem}>
            {icon}
            <span>{stage.label}</span>
        </li>
    );
};

export default function LoadingModal({
    status,
    error,
    commitUrl,
    onClose,
    onSuccessFinish,
}: LoadingModalProps): JSX.Element | null {
    if (status === 'idle') {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Publishing Your Document</h2>

                {status !== 'success' && status !== 'error' && (
                    <ul className={styles.stageList}>
                        {STAGES.map((stage) => (
                            <StageItem key={stage.key} stage={stage} currentStatus={status} />
                        ))}
                    </ul>
                )}

                {status === 'success' && (
                    <div className={styles.resultContainer}>
                        {/* <Icon name="sys-enter-2" className={`${styles.resultIcon} ${styles.iconSuccess}`} /> */}
                        <h3>Published Successfully!</h3>
                        {/* <p>Your changes have been committed to your forked repository.</p> */}
                        <div className={styles.buttonGroup}>
                            <Button design="Emphasized" onClick={onSuccessFinish}>
                                View on GitHub & Finish
                            </Button>
                            {/* <Button design="Transparent" onClick={onClose}>
                                Close
                            </Button> */}
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className={styles.resultContainer}>
                        <Icon name="error" className={`${styles.resultIcon} ${styles.iconError}`} />
                        <h3>An Error Occurred</h3>
                        <p className={styles.errorMessage}>{error || 'An unknown error occurred.'}</p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
