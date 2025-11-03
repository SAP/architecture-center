import React from 'react';
import { Document } from '@site/src/store/pageDataStore';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/home.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import styles from './index.module.css';

interface BreadcrumbsProps {
    path: Document[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path }) => {
    if (!path || path.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
            <ol className={styles.breadcrumbList}>
                <li className={styles.breadcrumbItem}>
                    <a href="/" className={styles.breadcrumbLink}>
                        <Icon name="home" className={styles.homeIcon} />
                    </a>
                </li>
                {path.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                        <li className={styles.separator}>
                            <Icon name="slim-arrow-right" />
                        </li>
                        <li
                            className={styles.breadcrumbItem}
                            aria-current={index === path.length - 1 ? 'page' : undefined}
                        >
                            {index === path.length - 1 ? (
                                <span className={styles.breadcrumbCurrent}>{doc.title}</span>
                            ) : (
                                <a href="#" className={styles.breadcrumbLink}>
                                    {doc.title}
                                </a>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
