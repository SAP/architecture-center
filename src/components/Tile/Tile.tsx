import { Card, Icon, Title } from '@ui5/webcomponents-react';
import React, { JSX } from 'react';
import styles from './index.module.css';
import useGlobalData from '@docusaurus/useGlobalData';
import Link from '@docusaurus/Link';
import { pageMapping, MappedDoc } from '@site/src/constant/pageMapping';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';

interface TileProps {
    title: string;
    icon: string;
    id: string;
}

interface DocFromGlobalData {
    id: string;
    path: string;
}

function truncateWords(text: string, wordLimit: number) {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
}

export default function Tile({ id, title, icon }: TileProps): JSX.Element {
    const setTechDomains = useSidebarFilterStore((state) => state.setTechDomains);
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

    const handleClick = () => {
        setTechDomains([id]);
    };

    return (
        <Card className={styles.default}>
            <div className={styles.header}>
                <Title level="H6">
                    <Icon name={icon} className={styles.icon} /> {title}
                </Title>
            </div>
            <div className={styles.content}>
                {top5Docs.length > 0 ? (
                    <ul className={styles.docList}>
                        {top5Docs.map((doc) => (
                            <li key={doc.id}>
                                <Icon name="sap-icon://example" />
                                <Link to={doc.permalink} title={doc.title} onClick={handleClick}>
                                    {truncateWords(doc.title, 7)}
                                </Link>
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
