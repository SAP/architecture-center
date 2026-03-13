import React, { JSX } from 'react';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/error.js';
import styles from './index.module.css';

export type PublishStage = 'idle' | 'forking' | 'packaging' | 'committing' | 'success' | 'error';

const STAGE_PUNS: { [key in PublishStage]?: string } = {
    forking: 'Charting the course to the cosmos...',
    packaging: 'Securing the payload for orbit...',
    committing: 'Final countdown engaged... ignition!',
};

interface LoadingModalProps {
    status: PublishStage;
    error: string | null;
    commitUrl: string | null;
    pullRequestUrl?: string | null;
    onClose: () => void;
    onSuccessFinish: () => void;
}

export default function LoadingModal({
    status,
    error,
    commitUrl,
    pullRequestUrl,
    onClose,
    onSuccessFinish,
}: LoadingModalProps): JSX.Element | null {
    if (status === 'idle') {
        return null;
    }

    const isInProgress = status === 'forking' || status === 'packaging' || status === 'committing';
    const rocketClassName = status === 'success' ? `${styles.rocket} ${styles.rocketLaunched}` : styles.rocket;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {status === 'success' && (
                    <img src="/img/fireworks.gif" alt="Success fireworks" className={styles.fireworks} />
                )}

                {isInProgress && (
                    <div className={styles.progressContainer}>
                        <h2>Preparing for Liftoff</h2>
                        <img src="/img/rocket.gif" alt="Rocket preparing for launch" className={rocketClassName} />
                        <p className={styles.punText}>{STAGE_PUNS[status]}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className={styles.resultContainer}>
                        <img src="/img/rocket.gif" alt="Rocket launching" className={rocketClassName} />
                        <h3>We Have Liftoff!</h3>
                        <p>Your document has been published and a pull request has been created successfully.</p>
                        <div className={styles.buttonGroup}>
                            <Button design="Emphasized" onClick={onSuccessFinish}>
                                {pullRequestUrl ? 'View Pull Request & Finish' : 'View on GitHub & Finish'}
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className={styles.resultContainer}>
                        <h3>Mission Aborted</h3>
                        <p className={styles.errorMessage}>{error || 'An unknown error occurred.'}</p>
                        <Button onClick={onClose}>Return to Hangar</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
