import React, { JSX, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './news-all.module.css';
// @ts-ignore - JSON import
import latestNewsData from '@site/src/data/latest-news.json';

interface BlogPost {
    id: string;
    title: string;
    description: string;
    date: string;
    formattedDate: string;
    permalink: string;
    authors: string[];
    image: string | null;
}

const NEWS_PER_PAGE = 6;

export default function NewsAll(): JSX.Element {
    const [currentPage, setCurrentPage] = useState(0);

    // Sort news from most recent to oldest (already sorted in the JSON, but ensuring it)
    const allNews: BlogPost[] = latestNewsData || [];

    // Calculate pagination
    const totalPages = Math.ceil(allNews.length / NEWS_PER_PAGE);
    const startIndex = currentPage * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const currentNews = allNews.slice(startIndex, endIndex);

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
            title="All News"
            description="Browse all news from SAP Architecture Center"
        >
            <main className={styles.newsAllPage}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>All News</h1>
                        <p className={styles.subtitle}>
                            A curated space dedicated to the latest advancements in research, publications, innovations, reference architectures, feature releases, and community contributions.
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

                    <div className={styles.newsGrid}>
                        {currentNews.map((post) => (
                            <Link
                                key={post.id}
                                to={post.permalink}
                                className={styles.newsCard}
                            >
                                <div className={styles.newsContent}>
                                    <div className={styles.newsMeta}>
                                        <time className={styles.newsDate}>
                                            {post.formattedDate}
                                        </time>
                                        {post.authors && post.authors.length > 0 && (
                                            <span className={styles.newsAuthor}>
                                                by {post.authors[0]}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={styles.newsTitle}>{post.title}</h3>
                                    <p className={styles.newsDescription}>
                                        {post.description}
                                    </p>
                                    <span className={styles.readMore}>
                                        <span className={styles.readMoreText}>Read More</span>
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
