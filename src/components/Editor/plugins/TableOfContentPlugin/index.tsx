import React, { useState, useEffect, useContext } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, NodeKey } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { usePageDataStore } from '@site/src/store/pageDataStore';

import styles from './index.module.css';

interface Heading {
    key: NodeKey;
    text: string;
    level: number;
}

export default function TableOfContentsPlugin() {
    const [editor] = useLexicalComposerContext();
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeKey, setActiveKey] = useState<NodeKey | null>(null);
    const pageData = usePageDataStore((state) => state.pageData);

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                const newHeadings: Heading[] = root
                    .getChildren()
                    .filter($isHeadingNode)
                    .map((node) => ({
                        key: node.getKey(),
                        text: node.getTextContent(),
                        level: parseInt(node.getTag().substring(1), 10),
                    }));

                if (JSON.stringify(headings) !== JSON.stringify(newHeadings)) {
                    setHeadings(newHeadings);
                }
            });
        });
        return () => unregister();
    }, [editor, headings]);

    const scrollToNode = (key: NodeKey) => {
        editor.update(() => {
            const domNode = editor.getElementByKey(key);

            if (domNode) {
                const navbar = document.querySelector('.navbar--fixed-top') as HTMLElement;
                const navbarHeight = navbar ? navbar.offsetHeight : 0;

                const offset = 40;

                const nodeTop = domNode.getBoundingClientRect().top + window.scrollY;
                const targetScrollPosition = nodeTop - navbarHeight - offset;

                window.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth',
                });
            }
        });
    };

    const handleClick = (key: NodeKey) => {
        scrollToNode(key);
        setActiveKey(key);
    };

    const placeholderTitle = pageData?.title || 'Table of Contents';

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
                        {placeholderTitle}
                    </li>
                )}
            </ul>
        </div>
    );
}
