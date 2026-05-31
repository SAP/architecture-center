import React, { type ReactNode } from 'react';
import styles from './QuoteCard.module.css';
import blueQuotesIcon from '../../../docs/north-star-arch/ai-native-northstar-arch/foreword/images/blue-quotes.png';
import greyQuotesIcon from '../../../docs/north-star-arch/ai-native-northstar-arch/foreword/images/grey-quotes.png';

interface QuoteCardProps {
    quote: ReactNode;
    name: string;
    title: ReactNode;
    photo?: string;
    photoAlt?: string;
    orgLogo?: ReactNode;
    orgLogoHeight?: number;
    variant?: 'sap' | 'partner';
}

export default function QuoteCard({ quote, name, title, photo, photoAlt, orgLogo, orgLogoHeight, variant = 'sap' }: QuoteCardProps) {
    return (
        <div className={`${styles.card} ${variant === 'partner' ? styles.cardPartner : ''}`}>
            <div className={styles.quoteSection}>
                <img src={variant === 'partner' ? greyQuotesIcon : blueQuotesIcon} alt="" className={styles.quoteIcon} />
                <div className={styles.quoteText}>{quote}</div>
            </div>
            <div className={styles.footer}>
                <div className={styles.attribution}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.title}>{title}</span>
                    {orgLogo && (
                        <div
                            className={styles.orgLogo}
                            style={orgLogoHeight ? { '--org-logo-height': `${orgLogoHeight}px` } as React.CSSProperties : undefined}
                        >
                            {orgLogo}
                        </div>
                    )}
                </div>
                {photo && (
                    <img src={photo} alt={photoAlt ?? name} className={`${styles.photo} no-zoom`} />
                )}
            </div>
        </div>
    );
}
