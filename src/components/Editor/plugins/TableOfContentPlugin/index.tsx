import React, { useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface Heading {
    key: string;
    text: string;
    level: number;
}

export default function TableOfContentsPlugin() {
    const [editor] = useLexicalComposerContext();
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const { getActiveDocument } = usePageDataStore();

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            const activeDocument = getActiveDocument();
            if (!activeDocument) return;

            editorState.read(() => {
                const root = $getRoot();
                const newHeadings: Heading[] = [];

                if (activeDocument.title) {
                    newHeadings.push({
                        key: 'article-header',
                        text: activeDocument.title,
                        level: 1,
                    });
                }

                root.getChildren().forEach((node) => {
                    if ($isHeadingNode(node)) {
                        newHeadings.push({
                            key: node.getKey(),
                            text: node.getTextContent(),
                            level: parseInt(node.getTag().substring(1), 10),
                        });
                    }
                });

                if (JSON.stringify(headings) !== JSON.stringify(newHeadings)) {
                    setHeadings(newHeadings);
                }
            });
        });

        return () => unregister();
    }, [editor, getActiveDocument, headings]);

    const scrollToNode = (key: string) => {
        editor.update(() => {
            const domNode =
                key === 'article-header' ? document.getElementById('article-header') : editor.getElementByKey(key);

            if (domNode) {
                const navbar = document.querySelector('.navbar--fixed-top') as HTMLElement;
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const offset = 20;
                const nodeTop = domNode.getBoundingClientRect().top + window.scrollY;
                const targetScrollPosition = nodeTop - navbarHeight - offset;

                window.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth',
                });
            }
        });
    };

    const handleClick = (key: string) => {
        scrollToNode(key);
        setActiveKey(key);
    };

    return (
        <div className={styles.tocContainer}>
            <ul className={styles.tocList}>
                {headings.length > 0 ? (
                    headings.map((heading) => (
                        <li
                            key={heading.key}
                            className={`${styles.tocItem} ${heading.key === activeKey ? styles.active : ''}`}
                            data-level={heading.level}
                            onClick={() => handleClick(heading.key)}
                            title={heading.text}
                        >
                            {heading.text}
                        </li>
                    ))
                ) : (
                    <li className={styles.tocItem} data-level="1">
                        No headings yet.
                    </li>
                )}
            </ul>
        </div>
    );
}
