import React from 'react';
import styles from './ContributorCard.module.css';

interface ContributorCardProps {
    name: string;
}

export default function ContributorCard({ name }: ContributorCardProps) {
    const parts = name.split(' ');
    const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (
        <div className={styles.card}>
            <div className={styles.avatar}>
                <span className={styles.initials}>{initials}</span>
            </div>
            <span className={styles.name}>{name}</span>
        </div>
    );
}
