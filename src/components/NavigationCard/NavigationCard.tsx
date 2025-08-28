import React, { JSX } from 'react';
import { Card, Icon } from '@ui5/webcomponents-react';
import styles from './NavigationCard.module.css';
import Link from '@docusaurus/Link';

interface CustomButtonProps {
  title: string;
  subtitle?: string;
  icon?: string;
  logo?: string;
  link: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function NavigationCard({
  icon,
  title,
  subtitle,
  link,
  onMouseEnter,
  onMouseLeave,
}: CustomButtonProps): JSX.Element {
return (
  <Link to={link} className={styles.cardLink}>
    <Card
      className={styles.default}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={styles.inline}>
        <Icon className={styles.icon} name={icon} />
        {subtitle ? (
          <div className={styles.spacing}>
            <div>{title}</div>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        ) : (
          <div>{title}</div>
        )}
      </span>
    </Card>
  </Link>
);

}
