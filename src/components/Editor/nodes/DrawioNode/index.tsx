import React, { useMemo, JSX } from 'react';
import type { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import styles from './index.module.css';

function DrawioComponent({ diagramXML }: { diagramXML: string }): JSX.Element {
    const embedUrl = useMemo(() => {
        return `https://viewer.diagrams.net/?lightbox=1&edit=_blank&layers=1&nav=1#R${encodeURIComponent(diagramXML)}`;
    }, [diagramXML]);

    return (
        <div className={styles.drawioContainer}>
            <iframe src={embedUrl} title="Draw.io Diagram Preview" />
        </div>
    );
}

export type SerializedDrawioNode = Spread<
    {
        diagramXML: string;
        type: 'drawio';
        version: 1;
    },
    SerializedLexicalNode
>;

export class DrawioNode extends DecoratorNode<JSX.Element> {
    __diagramXML: string;

    static getType(): string {
        return 'drawio';
    }

    static clone(node: DrawioNode): DrawioNode {
        return new DrawioNode(node.__diagramXML, node.__key);
    }

    static importJSON(serializedNode: SerializedDrawioNode): DrawioNode {
        return $createDrawioNode(serializedNode.diagramXML);
    }

    exportJSON(): SerializedDrawioNode {
        return {
            diagramXML: this.__diagramXML,
            type: 'drawio',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'contents';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    constructor(diagramXML: string, key?: NodeKey) {
        super(key);
        this.__diagramXML = diagramXML;
    }

    decorate(): JSX.Element {
        return <DrawioComponent diagramXML={this.__diagramXML} />;
    }
}

export function $createDrawioNode(diagramXML: string): DrawioNode {
    return $applyNodeReplacement(new DrawioNode(diagramXML));
}

export function $isDrawioNode(node: LexicalNode | null | undefined): node is DrawioNode {
    return node instanceof DrawioNode;
}
