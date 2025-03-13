import { useEffect, useState } from 'react';
import pako from 'pako';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit-outside.js';

const HOST_DRAWIO_VIEWER =
    'https://viewer.diagrams.net/?tags={}&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=diagram.drawio#R';

// we expect the raw xml string of the drawio file as prop here
export default function LinkDrawioViewer({ drawioXml }) {
    const [encodedLink, setEncodedLink] = useState(null);

    useEffect(() => {
        const p = new DOMParser();
        const xmlDoc = p.parseFromString(drawioXml, 'text/xml');
        const serializer = new XMLSerializer();
        for (const diagram of xmlDoc.querySelectorAll('diagram')) {
            const enc = encodeDiagramChild(serializer.serializeToString(diagram.firstElementChild));
            // modifies xml doc inplace, which is what we want
            diagram.replaceChildren([enc]);
        }

        const link = HOST_DRAWIO_VIEWER + encodeURIComponent(serializer.serializeToString(xmlDoc));
        setEncodedLink(link);
    }, [drawioXml]);

    return (
        <a href={encodedLink} target="_blank">
            <Button design="Emphasized" icon="edit-outside">
                View & Edit on draw.io
            </Button>
        </a>
    );
}

// This is the diagram encoding that they use, see https://github.com/jgraph/drawio-tools/blob/master/tools/convert.html#L11
function encodeDiagramChild(childXml) {
    // replace different kinds of line breaks
    let s = childXml.replace(/(\r\n|\n|\r)/gm, '');
    s = encodeURIComponent(s);
    // compress data with zlib deflate algorithm, then convert to string
    s = [...pako.deflateRaw(s)].map((c) => String.fromCodePoint(c)).join('');
    // base64 encode
    return btoa(s);
}
