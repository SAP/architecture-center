import React, { JSX } from 'react';
import { Card, Icon } from '@ui5/webcomponents-react';
import styles from './index.module.css';
import Link from '@docusaurus/Link';

interface CustomButtonProps {
  title: string;
  icon: string;
  link: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function NavigationCard({
  icon,
  title,
  link,
  onMouseEnter,
  onMouseLeave,
}: CustomButtonProps): JSX.Element {
  return (
    <Link to={link} >
      <Card
        className={styles.default}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <span className={styles.inline}>
          <Icon name={icon} />
          {title}
        </span>
      </Card>
    </Link>
  );
}
