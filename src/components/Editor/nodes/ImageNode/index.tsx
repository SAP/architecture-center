import React, { JSX } from 'react';
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, DecoratorNode } from 'lexical';

import ImageComponent from './ImageComponent';

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
        src: string;
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

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, src } = serializedNode;
        const node = $createImageNode({
            altText,
            height,
            width,
            src,
        });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
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

    constructor(src: string, altText: string, width?: number | 'inherit', height?: number | 'inherit', key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            src: this.getSrc(),
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
        };
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
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
    key,
}: {
    altText: string;
    height?: number | 'inherit';
    key?: NodeKey;
    src: string;
    width?: number | 'inherit';
}): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, width, height, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
