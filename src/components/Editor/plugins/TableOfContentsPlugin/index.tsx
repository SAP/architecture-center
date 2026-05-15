import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { HeadingNode } from '../../core/types';
import styles from './index.module.css';

interface Heading {
  key: string;
  text: string;
  level: number;
}

export default function TableOfContentsPlugin() {
  const { core, state } = useEditor();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const extractHeadings = useCallback(() => {
    if (!state) return;

    const newHeadings: Heading[] = [];

    // Extract headings from editor state only
    const rootNode = state.nodeMap.get(state.root);
    if (rootNode && 'children' in rootNode) {
      for (const childKey of rootNode.children) {
        const node = state.nodeMap.get(childKey);
        if (node && node.type === 'heading') {
          const headingNode = node as HeadingNode;
          // Get text content from heading's children
          let text = '';
          for (const textKey of headingNode.children) {
            const textNode = state.nodeMap.get(textKey);
            if (textNode && textNode.type === 'text' && 'text' in textNode) {
              text += textNode.text;
            }
          }
          if (text.trim()) {
            newHeadings.push({
              key: headingNode.key,
              text: text,
              level: headingNode.level,
            });
          }
        }
      }
    }

    setHeadings(newHeadings);
  }, [state]);

  useEffect(() => {
    extractHeadings();
  }, [extractHeadings]);

  // Subscribe to editor changes
  useEffect(() => {
    if (!core) return;
    const unsubscribe = core.subscribe(extractHeadings);
    return unsubscribe;
  }, [core, extractHeadings]);

  const scrollToNode = (key: string) => {
    let domNode: HTMLElement | null = null;

    if (key === 'article-header') {
      domNode = document.getElementById('article-header');
      if (domNode) {
        domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (core) {
      // Find the DOM element for this node key using the editor's container
      const container = core.getContainer();
      if (container) {
        domNode = container.querySelector(`[data-editor-key="${key}"]`);
        if (domNode) {
          // Scroll within the editor container
          domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
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
