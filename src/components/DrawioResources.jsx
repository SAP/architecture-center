import { FlexBox, Button } from '@ui5/webcomponents-react';
import { useState } from 'react';
import '@ui5/webcomponents-icons/dist/copy.js';
import "@ui5/webcomponents-icons/dist/accept.js";
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';
import LinkDrawioViewer from './LinkDrawioViewer';
import useBaseUrl from '@docusaurus/useBaseUrl';

// eventually, the drawio image won't be there locally. we'll generate it before deployment
// locally, use fallback image
const FALLBACK_IMG = '/img/fallback-drawio-img.svg';

export default function DrawioResources({ drawioFile, drawioXml, drawioImg }) {
    const path = useBaseUrl(FALLBACK_IMG);
    const [icon, setIcon] = useState('copy');

    function utf8ToBase64(str) {
        const utf8Bytes = new TextEncoder().encode(str);
        let binary = '';
        utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary);
    }
    function handleDownload() {
        fetch(drawioImg)
            .then((r) => r.text())
            .then((text) => {
                const viewBox = text.match(/viewBox="([^"]*)"/)[1].split(' ');
                const height = parseInt(viewBox[3]);
                const width = parseInt(viewBox[2]);

                //create canvas with svg values
                let canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                //create png from canvas and write on clipboard
                let img = new Image();
                img.onload = async function () {
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    //change icon on click
                    setIcon('accept');
                    setTimeout(() => {
                        setIcon('copy');
                    }, 1500);
                };
                img.onerror = function (e) {
                    console.error('The clipboard image failed to load', e);
                };
                img.src = 'data:image/svg+xml;base64,' + utf8ToBase64(text);
            });
    }
    return (
        // current selector to apply zoom (see docusaurus.config) doesn't select img if directly
        // under div with class 'markdown' => wrap img in paragraph for now
        <>
            <p>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        decoding="async"
                        loading="lazy"
                        src={drawioImg ?? path}
                        alt="image of solution diagram"
                        className={drawioImg ? '' : 'fallback-image'}
                        style={{ height: 'auto' }}
                    />
                    <a
                        onClick={(e) => {
                            handleDownload();
                            e.currentTarget.querySelector('ui5-button')?.blur();
                        }}
                    >
                        <Button
                            design="Transparent"
                            icon={`sap-icon://${icon}`}
                            tooltip="Copy Solution Diagram to Clipboard"
                            style={{ position: 'absolute', top: -15, right: 0, width: 30 }}
                        ></Button>
                    </a>
                </div>
            </p>
            <Admonition type="info" title="Solution Diagram Resources">
                You can download the Solution Diagram as a{' '}
                <b>
                    <code>.drawio</code>
                </b>{' '}
                file for offline use. Alternatively, you may view and edit the Solution Diagram directly on{' '}
                <Link to="https://www.draw.io">draw.io</Link>.<br />
                Please note that any changes made online will need to be saved locally if you wish to keep them.
                <FlexBox
                    direction="Row"
                    justifyContent="SpaceAround"
                    wrap="Wrap"
                    style={{ marginTop: 22, gap: '8px normal' }}
                >
                    <a href={drawioFile} download>
                        <Button design="Emphasized" style={{ width: 150 }}>
                            Download
                        </Button>
                    </a>
                    <LinkDrawioViewer drawioXml={drawioXml} />
                </FlexBox>
            </Admonition>
        </>
    );
}
