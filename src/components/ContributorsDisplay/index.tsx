import React from 'react';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/information.js';
import styles from './index.module.css';

interface ContributorsDisplayProps {
    contributors: string[];
}

const ContributorsDisplay: React.FC<ContributorsDisplayProps> = ({ contributors }) => {
    if (!contributors || contributors.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleWrapper}>
                <Icon name="information" className={styles.infoIcon} />
                <h3 className={styles.title}>Contributors</h3>
            </div>
            <div className={styles.list}>
                {contributors.map((username, index) => (
                    <a
                        key={username}
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contributor}
                    >
                        <img
                            src={`https://github.com/${username}.png`}
                            alt={`Profile picture of ${username}`}
                            className={styles.avatar}
                            width="20"
                            height="20"
                        />
                        <span className={styles.username}>{username}</span>
                        {index < contributors.length - 1 && ','}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ContributorsDisplay;
