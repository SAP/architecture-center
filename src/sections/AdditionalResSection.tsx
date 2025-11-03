import React, { JSX } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { addResData } from '../constant/constants';
import NavigationCard from '../components/NavigationCard/NavigationCard';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './AdditionalResSection.module.css';

export default function HeroSection(): JSX.Element {
    return (
        <section>
            <div className={styles.container}>
                <Title className={styles.title}>
                    Additional Resources
                </Title>
                <Text className={styles.subtitle}>Explore other external resources</Text>            
                {/* Navigation Cards */}
                <div className={styles.cardsGrid}>
                    {addResData.map((item, index) => (
                        <NavigationCard
                            key={index}
                            title={item.title}
                            subtitle={item.subtitle}
                            logoLight={item.logoLight}
                            logoDark={item.logoDark}
                            link={item.link}
                        />
                    ))}
                </div>               
            </div>
        </section>
    );
}
