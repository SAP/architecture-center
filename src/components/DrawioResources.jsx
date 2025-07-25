import { FlexBox, Button } from '@ui5/webcomponents-react';
import { useState } from 'react';
import '@ui5/webcomponents-icons/dist/copy.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';
import LinkDrawioViewer from './LinkDrawioViewer';
import useBaseUrl from '@docusaurus/useBaseUrl';

// eventually, the drawio image won't be there locally. we'll generate it before deployment
// locally, use fallback image
const FALLBACK_IMG = '/img/fallback-drawio-img.svg';

export default function DrawioResources({ drawioFile, drawioXml, drawioImg }) {
    const path = useBaseUrl(FALLBACK_IMG);
    const [copied, setCopied] = useState(false);

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
                    setTimeout(() => {
                        setCopied(false);
                    }, 2000);
                };
                img.onerror = function (e) {
                    console.error('The clipboard image failed to load', e);
                };
                img.src = 'data:image/svg+xml;base64,' + utf8ToBase64(text);
            });
    }
    return (
        // current selector to apply zoom (see docusaurus.config) selects img as direct child
        // using single div with inline-block display to maintain zoom functionality
        <>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                    decoding="async"
                    loading="lazy"
                    src={drawioImg ?? path}
                    alt="image of solution diagram"
                    className={drawioImg ? '' : 'fallback-image'}
                    style={{ height: 'auto' }}
                />
                {drawioImg && (
                    <div className="tooltip">
                        <IconButton
                            onClick={() => {
                                setCopied(true), handleDownload();
                            }}
                            className="iconButton"
                            variant="default"
                        >
                            {copied ? (
                                <CheckIcon style={{ fontSize: 20 }} />
                            ) : (
                                <ContentCopyIcon style={{ fontSize: 20 }} />
                            )}
                        </IconButton>
                        <span className="tooltip_text">{copied ? 'Copied!' : 'Copy to clipboard'}</span>
                    </div>
                )}
            </div>
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
