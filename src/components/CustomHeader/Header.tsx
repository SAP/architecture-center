import React from 'react';
import { FlexBox, Title, Text } from '@ui5/webcomponents-react';
import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    subtitle: string | React.ReactNode;
    breadcrumbCurrent: string;
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" {...props}>
            <path
                d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"
                fill="currentColor"
            />
        </svg>
    );
}

export default function Header({ title, subtitle, breadcrumbCurrent }: HeaderProps) {
    return (
        <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
                <div className={styles.breadCrumbs}>
                    <a href="/" className={styles.homeLink}>
                        <HomeIcon className={styles.homeIcon} />
                    </a>
                    <Text className={styles.breadcrumbSeparator}>&gt;</Text>
                    <Text className={styles.breadcrumbCurrent}>{breadcrumbCurrent}</Text>
                </div>

                <FlexBox direction="Column" alignItems="Start" justifyContent="Center">
                    <Title className={styles.heroTitle}>{title}</Title>
                    <Text className={styles.heroSubtitle}>{subtitle}</Text>
                </FlexBox>
            </div>
        </div>
    );
}
