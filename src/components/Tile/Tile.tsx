import { Card, Icon, Title } from '@ui5/webcomponents-react';
import React, { JSX } from 'react';
import styles from './index.module.css';
import useGlobalData from '@docusaurus/useGlobalData';
import Link from '@docusaurus/Link';
import { pageMapping, MappedDoc } from '@site/src/constant/pageMapping';
import { useSidebarFilterStore } from '@site/src/store/sidebar-store';
import useBaseUrl from '@docusaurus/useBaseUrl';

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
            if (!fullDoc) return null;
            return {
                id: mappedDoc.id,
                title: mappedDoc.title,
                permalink: fullDoc.path,
            };
        })
        .filter(Boolean) as { id: string; title: string; permalink: string }[];

    const top5Docs = relevantDocs.slice(0, 5);

    const handleCardClick = () => {
        setTechDomains([id]);
    };
    const docsUrl = useBaseUrl('/docs');

    return (
        <Card className={styles.tileCard}>
            <div className={styles.tileInner}>
                <div className={styles.cardContent}>
                    <div className={styles.header}>
                        <Icon name={icon} className={styles.icon} />
                        <Title className={styles.title}>{title}</Title>
                    </div>

                    {top5Docs.length > 0 ? (
                        <ul className={styles.docList}>
                            {top5Docs.map((doc) => (
                                <li key={doc.id}>
                                    <Icon name="document-text" className={styles.docIcon} />
                                    <Link to={doc.permalink} title={doc.title} onClick={handleCardClick}>
                                        <span className={styles.truncate}>{doc.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.noDocsMessage}>No reference architectures found.</p>
                    )}
                </div>
                <Link
                    to={`${docsUrl}?techDomains=${id}`}
                    className={styles.footerLink}
                    onClick={() => setTechDomains([id])}
                >
                <div className={styles.footer}>
                    <span>View All</span>
                </div>
                </Link>
            </div>
        </Card>
    );
}
