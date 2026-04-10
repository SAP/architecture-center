import React, { JSX } from 'react';
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, DecoratorNode } from 'lexical';

import ImageComponent from './ImageComponent';
import { getAssetContentUrl } from '@site/src/services/documentApi';

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src } = domNode;
        const node = $createImageNode({ altText, src });
        return { node };
    }
    return null;
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        assetId?: string; // NEW: Reference to DocumentAsset
        src?: string; // Keep for backward compatibility and migration
        width?: number;
        height?: number;
        type: 'image';
        version: 1;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width: number | 'inherit';
    __height: number | 'inherit';
    __assetId: string | null;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__width,
            node.__height,
            node.__assetId,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, src, assetId } = serializedNode;

        // Determine the source URL
        let resolvedSrc = src || '';

        // If we have an assetId, use it to construct the URL
        if (assetId) {
            resolvedSrc = getAssetContentUrl(assetId);
        }

        const node = $createImageNode({
            altText,
            height,
            width,
            src: resolvedSrc,
            assetId: assetId || null,
        });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        if (this.__assetId) {
            element.setAttribute('data-asset-id', this.__assetId);
        }
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: (node: Node) => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): boolean {
        return false;
    }

    constructor(
        src: string,
        altText: string,
        width?: number | 'inherit',
        height?: number | 'inherit',
        assetId?: string | null,
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
        this.__assetId = assetId || null;
    }

    exportJSON(): SerializedImageNode {
        const result: SerializedImageNode = {
            altText: this.getAltText(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
        };

        // Prefer assetId over src for serialization
        if (this.__assetId) {
            result.assetId = this.__assetId;
            // Don't include src when we have assetId - it will be reconstructed on import
        } else {
            // Fallback: include src (base64 or URL) for backward compatibility
            result.src = this.getSrc();
        }

        return result;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    getAssetId(): string | null {
        return this.__assetId;
    }

    setAssetId(assetId: string, newSrc?: string): void {
        const writable = this.getWritable();
        writable.__assetId = assetId;
        if (newSrc) {
            writable.__src = newSrc;
        }
    }

    /**
     * Check if this image has embedded base64 data (needs migration to asset)
     */
    hasEmbeddedData(): boolean {
        return !this.__assetId && this.__src.startsWith('data:image/');
    }

    decorate(): JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                nodeKey={this.getKey()}
                width={this.__width}
                height={this.__height}
            />
        );
    }
}

export function $createImageNode({
    altText,
    height,
    src,
    width,
    assetId,
    key,
}: {
    altText: string;
    height?: number | 'inherit';
    key?: NodeKey;
    src: string;
    width?: number | 'inherit';
    assetId?: string | null;
}): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, width, height, assetId, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
