import React, { JSX, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './ref-arch-updates.module.css';
// @ts-ignore - JSON import
import updatesData from '@site/src/data/ref-arch-updates.json';

interface RefArchUpdate {
    id: string;
    title: string;
    description: string;
    author: string;
    date: string;
    formattedDate: string;
    permalink: string;
}

const RA_PER_PAGE = 6;

export default function RefArchUpdates(): JSX.Element {
    const [currentPage, setCurrentPage] = useState(0);

    const allUpdates: RefArchUpdate[] = updatesData || [];

    const totalPages = Math.ceil(allUpdates.length / RA_PER_PAGE);
    const startIndex = currentPage * RA_PER_PAGE;
    const currentUpdates = allUpdates.slice(startIndex, startIndex + RA_PER_PAGE);

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Layout
            title="Recently Updated Reference Architectures"
            description="The most recently updated reference architectures from the SAP Architecture Center."
        >
            <main className={styles.updatesPage}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            Recently Updated Reference Architectures
                        </h1>
                        <p className={styles.subtitle}>
                            The most recently updated reference architectures, newest
                            first. Prefer a machine-readable version? The same updates
                            are available as{' '}
                            <Link to="/docs/community/feeds">RSS and Atom feeds</Link>.
                        </p>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.paginationContainer}>
                            <button
                                className={`${styles.paginationButton} ${currentPage === 0 ? styles.disabled : ''}`}
                                onClick={handlePrevious}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                            >
                                <span className={`${styles.arrow} ${styles.arrowLeft}`}></span>
                            </button>

                            <div className={styles.pageInfo}>
                                <span className={styles.pageText}>
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                            </div>

                            <button
                                className={`${styles.paginationButton} ${currentPage === totalPages - 1 ? styles.disabled : ''}`}
                                onClick={handleNext}
                                disabled={currentPage === totalPages - 1}
                                aria-label="Next page"
                            >
                                <span className={`${styles.arrow} ${styles.arrowRight}`}></span>
                            </button>
                        </div>
                    )}

                    <div className={styles.updatesGrid}>
                        {currentUpdates.map((item) => (
                            <Link
                                key={item.id}
                                to={item.permalink}
                                className={styles.updateCard}
                            >
                                <div className={styles.updateContent}>
                                    <div className={styles.updateMeta}>
                                        <time className={styles.updateDate}>
                                            {item.formattedDate}
                                        </time>
                                        {item.author && (
                                            <span className={styles.updateAuthor}>
                                                by {item.author}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={styles.updateTitle}>{item.title}</h3>
                                    {item.description && (
                                        <p className={styles.updateDescription}>
                                            {item.description}
                                        </p>
                                    )}
                                    <span className={styles.readMore}>
                                        <span className={styles.readMoreText}>Open</span>
                                        <span className={styles.readMoreArrow}>→</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </Layout>
    );
}
