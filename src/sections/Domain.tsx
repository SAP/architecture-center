import React, { JSX } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { TECH_DOMAIN } from '../constant/constants';
import Tile from '../components/Tile/Tile';
import styles from './Domain.module.css';

export default function Domain(): JSX.Element {
    return (
        <section className={styles.domainSection}>
            <div className={styles.container}>
                <Title level="H1" className={styles.title}>
                    Technology Domains
                </Title>
                <Text className={styles.subtitle}>Explore architectures for different technology domains</Text>

                <div className={styles.tilesGrid}>
                    {TECH_DOMAIN.map((domain, index) => (
                        <Tile id={domain.id} key={index} title={domain.title} icon={domain.icon} />
                    ))}
                </div>
            </div>
        </section>
    );
}
