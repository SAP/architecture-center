import React from 'react';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/information.js';
import '@ui5/webcomponents-icons/dist/person-placeholder.js';
import styles from './index.module.css';

const ContributorAvatar = ({ name }: { name: string }) => {
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    const initials =
        name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || '';

    return (
        <div className={styles.avatarPlaceholder} style={{ backgroundColor: stringToColor(name) }}>
            {initials}
        </div>
    );
};

export default function ContributorsDisplay() {
    const activeDocument = usePageDataStore((state) => state.getActiveDocument());

    if (!activeDocument?.metadata) {
        return null;
    }

    const { authors = [], contributors = [] } = activeDocument.metadata;

    const allContributors = Array.from(new Set([...authors, ...contributors]));

    if (allContributors.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Icon name="information" className={styles.infoIcon} />
                <span className={styles.title}>Contributors</span>
            </div>
            <div className={styles.list}>
                {allContributors.map((name, index) => (
                    <span key={name} className={styles.contributorItem}>
                        <ContributorAvatar name={name} />
                        <a href={`#`} className={styles.link}>
                            {name}
                        </a>
                        {index < allContributors.length - 1 && ','}
                    </span>
                ))}
            </div>
        </div>
    );
}
