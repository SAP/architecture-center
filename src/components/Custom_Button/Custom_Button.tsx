import React, { JSX } from 'react';
import { Button, Icon } from '@ui5/webcomponents-react';
import styles from './index.module.css';
import Link from '@docusaurus/Link';

interface CustomButtonProps {
    title: string;
    icon: string;
    link: string;
}

export default function Custom_Button({ icon, title, link }: CustomButtonProps): JSX.Element {
    return (
        <Link to={link}>
            <Button className={styles.default}>
                <Icon name={icon} />
                {title}
            </Button>
        </Link>
    );
}
