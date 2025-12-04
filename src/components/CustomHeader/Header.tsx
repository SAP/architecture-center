import React from 'react';
import { FlexBox, Title, Text, Icon } from '@ui5/webcomponents-react';
import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    subtitle: string | React.ReactNode;
    breadcrumbCurrent: string;
}

export default function Header({ title, subtitle, breadcrumbCurrent }: HeaderProps) {
    return (
        <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
                <div className={styles.breadCrumbs}>
                    <a href="/" className={styles.homeLink}>
                        <Icon name="home" />
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
