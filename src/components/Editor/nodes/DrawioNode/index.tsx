import React, { useMemo, JSX, useState, useEffect } from 'react';
import type { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import styles from './index.module.css';
import { getAssetContentUrl, downloadAssetContent } from '@site/src/services/documentApi';

interface DrawioComponentProps {
    diagramXML?: string;
    assetId?: string | null;
}

function DrawioComponent({ diagramXML, assetId }: DrawioComponentProps): JSX.Element {
    const [xml, setXml] = useState<string | null>(diagramXML || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If we have an assetId but no XML, fetch the XML from the backend
    useEffect(() => {
        if (assetId && !diagramXML) {
            setLoading(true);
            setError(null);

            downloadAssetContent(assetId)
                .then(async ({ blob }) => {
                    const text = await blob.text();
                    setXml(text);
                })
                .catch((err) => {
                    setError(err.message || 'Failed to load diagram');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [assetId, diagramXML]);

    const embedUrl = useMemo(() => {
        if (!xml) return null;
        return `https://viewer.diagrams.net/?lightbox=1&edit=_blank&layers=1&nav=1#R${encodeURIComponent(xml)}`;
    }, [xml]);

    if (loading) {
        return (
            <div className={styles.drawioContainer}>
                <div className={styles.drawioLoading}>Loading diagram...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.drawioContainer}>
                <div className={styles.drawioError}>Failed to load diagram: {error}</div>
            </div>
        );
    }

    if (!embedUrl) {
        return (
            <div className={styles.drawioContainer}>
                <div className={styles.drawioPlaceholder}>No diagram data</div>
            </div>
        );
    }

    return (
        <div className={styles.drawioContainer}>
            <iframe src={embedUrl} title="Draw.io Diagram Preview" />
        </div>
    );
}

export type SerializedDrawioNode = Spread<
    {
        assetId?: string; // NEW: Reference to DocumentAsset
        diagramXML?: string; // Keep for backward compatibility and migration
        type: 'drawio';
        version: 1;
    },
    SerializedLexicalNode
>;

export class DrawioNode extends DecoratorNode<JSX.Element> {
    __diagramXML: string | null;
    __assetId: string | null;

    static getType(): string {
        return 'drawio';
    }

    static clone(node: DrawioNode): DrawioNode {
        return new DrawioNode(node.__diagramXML, node.__assetId, node.__key);
    }

    static importJSON(serializedNode: SerializedDrawioNode): DrawioNode {
        const { diagramXML, assetId } = serializedNode;
        return $createDrawioNode({
            diagramXML: diagramXML || null,
            assetId: assetId || null,
        });
    }

    exportJSON(): SerializedDrawioNode {
        const result: SerializedDrawioNode = {
            type: 'drawio',
            version: 1,
        };

        // Prefer assetId over diagramXML for serialization
        if (this.__assetId) {
            result.assetId = this.__assetId;
            // Don't include diagramXML when we have assetId - it will be fetched on import
        } else if (this.__diagramXML) {
            // Fallback: include diagramXML for backward compatibility
            result.diagramXML = this.__diagramXML;
        }

        return result;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'contents';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    constructor(diagramXML: string | null, assetId?: string | null, key?: NodeKey) {
        super(key);
        this.__diagramXML = diagramXML;
        this.__assetId = assetId || null;
    }

    getDiagramXML(): string | null {
        return this.__diagramXML;
    }

    getAssetId(): string | null {
        return this.__assetId;
    }

    setAssetId(assetId: string): void {
        const writable = this.getWritable();
        writable.__assetId = assetId;
        // Clear the XML since it's now stored in the asset
        writable.__diagramXML = null;
    }

    /**
     * Check if this diagram has embedded XML (needs migration to asset)
     */
    hasEmbeddedData(): boolean {
        return !this.__assetId && !!this.__diagramXML;
    }

    decorate(): JSX.Element {
        return <DrawioComponent diagramXML={this.__diagramXML || undefined} assetId={this.__assetId} />;
    }
}

export function $createDrawioNode({
    diagramXML,
    assetId,
}: {
    diagramXML?: string | null;
    assetId?: string | null;
}): DrawioNode {
    return $applyNodeReplacement(new DrawioNode(diagramXML || null, assetId));
}

// Legacy overload for backward compatibility
export function $createDrawioNodeLegacy(diagramXML: string): DrawioNode {
    return $applyNodeReplacement(new DrawioNode(diagramXML, null));
}

export function $isDrawioNode(node: LexicalNode | null | undefined): node is DrawioNode {
    return node instanceof DrawioNode;
}
