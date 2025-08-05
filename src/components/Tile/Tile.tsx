import { Card, Icon, Title } from '@ui5/webcomponents-react';
import React, { JSX } from 'react';
import styles from './index.module.css';
import useGlobalData from '@docusaurus/useGlobalData';
import Link from '@docusaurus/Link';
import { pageMapping, MappedDoc } from '@site/src/constant/pageMapping';

interface TileProps {
    title: string;
    icon: string;
    id: string;
}

interface DocFromGlobalData {
    id: string;
    path: string;
}

export default function Tile({ id, title, icon }: TileProps): JSX.Element {
    const globalData = useGlobalData();
    const docsPluginData = globalData['docusaurus-plugin-content-docs']['default'] as {
        versions: { docs: DocFromGlobalData[] }[];
    };
    const allDocs = docsPluginData.versions[0].docs as DocFromGlobalData[];

    const docsById = new Map(allDocs.map((doc) => [doc.id, doc]));

    const docsForCategory: MappedDoc[] = pageMapping[id] || [];

    const relevantDocs = docsForCategory
        .map((mappedDoc) => {
            const fullDoc = docsById.get(mappedDoc.id);
            if (!fullDoc) {
                return null;
            }
            return {
                id: mappedDoc.id,
                title: mappedDoc.title,
                permalink: fullDoc.path,
            };
        })
        .filter(Boolean);

    const top5Docs = relevantDocs.slice(0, 5);

    return (
        <Card className={styles.default}>
            <div className={styles.header}>
                <Title level="H3">
                    <Icon name={icon} className={styles.icon} /> {title}
                </Title>
            </div>
            <div className={styles.content}>
                {top5Docs.length > 0 ? (
                    <ul className={styles.docList} style={{ listStyleType: 'none' }}>
                        {top5Docs.map((doc) => (
                            <li key={doc.id}>
                                <Icon name="sap-icon://example" />
                                <Link to={doc.permalink}>{doc.title}</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noDocsMessage}>No reference architectures found for this category.</p>
                )}
            </div>
        </Card>
    );
}
