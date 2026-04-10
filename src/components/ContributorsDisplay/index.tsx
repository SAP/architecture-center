import React from 'react';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/information.js';
import styles from './index.module.css';

interface ContributorsDisplayProps {
    contributors: string[];
}

const ContributorsDisplay: React.FC<ContributorsDisplayProps> = ({ contributors }) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleWrapper}>
                <Icon name="information" className={styles.infoIcon} />
                <h3 className={styles.title}>Contributors</h3>
            </div>
            <div className={styles.list}>
                {contributors && contributors.length > 0 ? (
                    contributors.map((username, index) => (
                        <a
                            key={username}
                            href={`https://github.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contributor}
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
                        No contributors listed. Use the edit button above to add contributors.
                    </span>
                )}
            </div>
        </div>
    );
};

export default ContributorsDisplay;
