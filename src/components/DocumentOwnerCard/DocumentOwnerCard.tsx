import React from 'react';
import styles from './DocumentOwnerCard.module.css';

interface DocumentOwnerCardProps {
    name: string;
    title: string;
    image: string;
    link?: string;
}

export default function DocumentOwnerCard({ name, title, image, link }: DocumentOwnerCardProps) {
    const content = (
        <div className={styles.card}>
            <img src={image} alt={name} className={`${styles.photo} no-zoom`} />
            <div className={styles.info}>
                <span className={styles.name}>{name}</span>
                <span className={styles.title}>{title}</span>
            </div>
        </div>
    );

    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {content}
            </a>
        );
    }

    return content;
}
