import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $isElementNode, LexicalNode } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { Search, FileText, Hash, ChevronRight, Folder } from 'lucide-react';
import styles from './index.module.css';

// Global store for pending heading navigation (survives component remounts)
declare global {
    interface Window {
        __pendingHeadingScroll?: {
            headingText: string;
            timestamp: number;
        };
    }
}

interface SearchResult {
    id: string;
    type: 'architecture' | 'page' | 'heading';
    title: string;
    pageTitle?: string;
    pageId?: string;
    architectureId?: string;
    architectureTitle?: string;
    level?: number;
    headingText?: string;
}

export default function SpotlightSearchPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [allHeadings, setAllHeadings] = useState<SearchResult[]>([]);

    const {
        documents,
        setActiveDocumentId,
        setSelectedArchitecture,
        getRootArchitectures
    } = usePageDataStore();

    const architectures = getRootArchitectures();

    // Check for pending heading scroll on mount
    useEffect(() => {
        const checkPendingScroll = () => {
            const pending = window.__pendingHeadingScroll;
            if (!pending) return;

            // Only process if recent (within 3 seconds)
            if (Date.now() - pending.timestamp > 3000) {
                window.__pendingHeadingScroll = undefined;
                return;
            }

            const headingText = pending.headingText;

            editor.update(() => {
                const root = $getRoot();
                let targetNode: LexicalNode | null = null;

                const findHeading = (node: LexicalNode) => {
                    if (targetNode) return;
                    if ($isHeadingNode(node)) {
                        const text = node.getTextContent().trim();
                        if (text === headingText) {
                            targetNode = node;
                            return;
                        }
                    }
                    if ($isElementNode(node)) {
                        node.getChildren().forEach(findHeading);
                    }
                };
                root.getChildren().forEach(findHeading);

                if (targetNode && $isHeadingNode(targetNode)) {
                    window.__pendingHeadingScroll = undefined;
                    targetNode.selectEnd();

                    const nodeKey = targetNode.getKey();
                    setTimeout(() => {
                        const element = editor.getElementByKey(nodeKey);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        editor.focus();
                    }, 50);
                }
            });
        };

        // Check after a delay to allow editor to initialize
        const timeout = setTimeout(checkPendingScroll, 200);
        return () => clearTimeout(timeout);
    }, [editor]);

    // Get all pages grouped by architecture
    const allPages = useMemo(() => {
        const pages: SearchResult[] = [];

        architectures.forEach((arch) => {
            // Add the architecture itself
            pages.push({
                id: `arch-${arch.id}`,
                type: 'architecture',
                title: arch.title || 'Untitled Architecture',
                architectureId: arch.id,
            });

            // Get all descendants of this architecture
            const getDescendants = (parentId: string): typeof documents => {
                const children = documents.filter((d) => d.parentId === parentId);
                return children.reduce(
                    (acc, child) => [...acc, child, ...getDescendants(child.id)],
                    [] as typeof documents
                );
            };

            const descendants = getDescendants(arch.id);
            descendants.forEach((page) => {
                pages.push({
                    id: `page-${page.id}`,
                    type: 'page',
                    title: page.title || 'Untitled',
                    pageId: page.id,
                    architectureId: arch.id,
                    architectureTitle: arch.title || 'Untitled',
                });
            });
        });

        return pages;
    }, [documents, architectures]);

    // Extract headings from ALL documents
    useEffect(() => {
        const extractAllHeadings = () => {
            const headings: SearchResult[] = [];

            documents.forEach((doc) => {
                if (!doc.editorState) return;

                // Find the root architecture for this document
                let archId = doc.id;
                let archTitle = doc.title;
                let currentDoc = doc;
                while (currentDoc.parentId) {
                    const parent = documents.find((d) => d.id === currentDoc.parentId);
                    if (parent) {
                        archId = parent.id;
                        archTitle = parent.title;
                        currentDoc = parent;
                    } else {
                        break;
                    }
                }

                try {
                    const editorState = editor.parseEditorState(doc.editorState);

                    editorState.read(() => {
                        const root = $getRoot();
                        const traverse = (node: LexicalNode) => {
                            if ($isHeadingNode(node)) {
                                const text = node.getTextContent().trim();
                                if (text) {
                                    const tag = node.getTag();
                                    const level = parseInt(tag.replace('h', ''), 10);
                                    headings.push({
                                        id: `heading-${doc.id}-${text.slice(0, 20)}`,
                                        type: 'heading',
                                        title: text,
                                        level,
                                        headingText: text, // Store to find later
                                        pageId: doc.id,
                                        pageTitle: doc.title || 'Untitled',
                                        architectureId: archId,
                                        architectureTitle: archTitle || 'Untitled',
                                    });
                                }
                            }
                            if ($isElementNode(node)) {
                                node.getChildren().forEach(traverse);
                            }
                        };
                        root.getChildren().forEach(traverse);
                    });
                } catch (e) {
                    // Skip documents with invalid editor state
                }
            });

            setAllHeadings(headings);
        };

        extractAllHeadings();
    }, [editor, documents]);

    // Build search results
    const searchResults = useMemo((): SearchResult[] => {
        const results: SearchResult[] = [...allPages, ...allHeadings];

        // Filter by query
        if (!query.trim()) {
            // Show architectures first, then some pages when no query
            return results
                .sort((a, b) => {
                    const order = { architecture: 0, page: 1, heading: 2 };
                    return order[a.type] - order[b.type];
                })
                .slice(0, 12);
        }

        const lowerQuery = query.toLowerCase();
        return results
            .filter((r) => r.title.toLowerCase().includes(lowerQuery))
            .sort((a, b) => {
                // Prioritize results that start with the query
                const aStarts = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
                const bStarts = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
                if (aStarts !== bStarts) return aStarts - bStarts;

                // Then by type
                const order = { architecture: 0, page: 1, heading: 2 };
                return order[a.type] - order[b.type];
            })
            .slice(0, 15);
    }, [allPages, allHeadings, query]);

    // Handle keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setQuery('');
                setSelectedIndex(0);
            }

            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Handle navigation within modal
    const handleModalKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
                e.preventDefault();
                handleSelect(searchResults[selectedIndex]);
            }
        },
        [searchResults, selectedIndex]
    );

    // Handle selection
    const handleSelect = useCallback(
        (result: SearchResult) => {
            setIsOpen(false);

            if (result.type === 'architecture' && result.architectureId) {
                // Switch to architecture and set it as active
                setSelectedArchitecture(result.architectureId);
            } else if (result.type === 'page' && result.pageId) {
                // Switch to the architecture first, then the page
                if (result.architectureId) {
                    setSelectedArchitecture(result.architectureId);
                }
                setActiveDocumentId(result.pageId);
            } else if (result.type === 'heading' && result.pageId) {
                // Store pending scroll in global - editor will pick it up after remount
                const headingText = result.headingText || result.title;
                window.__pendingHeadingScroll = {
                    headingText,
                    timestamp: Date.now(),
                };

                // Switch to architecture and page
                if (result.architectureId) {
                    setSelectedArchitecture(result.architectureId);
                }
                setActiveDocumentId(result.pageId);
            }
        },
        [setActiveDocumentId, setSelectedArchitecture]
    );

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchResults.length]);

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.searchHeader}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search all architectures, pages, and headings..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleModalKeyDown}
                        autoFocus
                    />
                    <span className={styles.shortcutHint}>esc to close</span>
                </div>

                <div className={styles.results}>
                    {searchResults.length === 0 ? (
                        <div className={styles.noResults}>No results found</div>
                    ) : (
                        searchResults.map((result, index) => (
                            <div
                                key={result.id}
                                className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className={styles.resultIcon}>
                                    {result.type === 'architecture' ? (
                                        <Folder size={16} />
                                    ) : result.type === 'page' ? (
                                        <FileText size={16} />
                                    ) : (
                                        <Hash size={16} />
                                    )}
                                </span>
                                <span className={styles.resultContent}>
                                    <span className={styles.resultTitle}>
                                        {result.type === 'heading' && result.level && (
                                            <span className={styles.headingLevel}>H{result.level}</span>
                                        )}
                                        {result.title}
                                    </span>
                                    {(result.type === 'page' || result.type === 'heading') && result.architectureTitle && (
                                        <span className={styles.resultMeta}>
                                            {result.architectureTitle}
                                            {result.type === 'heading' && result.pageTitle && (
                                                <>
                                                    <ChevronRight size={12} />
                                                    {result.pageTitle}
                                                </>
                                            )}
                                        </span>
                                    )}
                                </span>
                                {index === selectedIndex && (
                                    <span className={styles.enterHint}>↵</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Select</span>
                    <span><kbd>esc</kbd> Close</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
