import React, { useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, NodeKey } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import './index.module.css';

interface Heading {
    key: NodeKey;
    text: string;
    level: number;
}

export default function TableOfContentsPlugin() {
    const [editor] = useLexicalComposerContext();
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                const children = root.getChildren();
                const newHeadings: Heading[] = [];

                children.forEach((node) => {
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
    }, [editor, headings]);

    const scrollToNode = (key: NodeKey) => {
        editor.update(() => {
            const node = editor.getElementByKey(key);
            if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };

    return (
        <div className="toc-container">
            <h3 className="toc-title">Architecture</h3>
            {headings.length > 0 ? (
                <ul className="toc-list">
                    {headings.map((heading) => (
                        <li
                            key={heading.key}
                            className="toc-item"
                            onClick={() => scrollToNode(heading.key)}
                            style={{
                                paddingLeft: `${(heading.level - 1) * 20}px`,
                            }}
                        >
                            {heading.text}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
