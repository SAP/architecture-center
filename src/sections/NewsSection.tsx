import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './NewsSection.module.css';
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

export default function NewsSection(): JSX.Element {
    // Skip the first article (it's displayed in Spotlight tab) and take the next 3
    const latestPosts: BlogPost[] = latestNewsData.slice(1, 4) || [];

    // If no blog posts available, return null (don't show the section)
    if (latestPosts.length === 0) {
        return null;
    }

    return (
        <section className={styles.newsSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Latest News</h2>
                    <p className={styles.subtitle}>
                        A curated space dedicated to the latest advancements in research, publications, innovations, reference architectures, feature releases, and community contributions.
                    </p>
                </div>

                <div className={styles.newsGrid}>
                    {latestPosts.map((post) => (
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

                <div className={styles.viewAllContainer}>
                    <Link to="/news" className={styles.viewAllButton}>
                        View All News
                    </Link>
                </div>
            </div>
        </section>
    );
}