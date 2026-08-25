import { FlexBox, Button } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';
import '@ui5/webcomponents-icons/dist/copy.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import logger from '@site/src/utils/logger';
import LinkDrawioViewer from './LinkDrawioViewer';

// eventually, the drawio image won't be there locally. we'll generate it before deployment
// locally, use fallback image
const FALLBACK_IMG = '/img/fallback-drawio-img.svg';

export default function DrawioResources({ drawioFile, drawioXml, drawioImg, drawioTitle }) {
    const path = useBaseUrl(FALLBACK_IMG);
    const [copied, setCopied] = useState(false);
    const [imgSrc, setImgSrc] = useState(drawioImg ?? path);

    useEffect(() => {
        let blobUrl = null;

        if (!drawioImg || !drawioTitle) {
            setImgSrc(drawioImg ?? path);
            return;
        }

        fetch(drawioImg)
            .then((r) => r.text())
            .then((svgText) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');
                const titleEl = doc.getElementById('drawio-title');
                if (titleEl) {
                    titleEl.textContent = drawioTitle;
                }
                const blob = new Blob([new XMLSerializer().serializeToString(doc.documentElement)], {
                    type: 'image/svg+xml',
                });
                blobUrl = URL.createObjectURL(blob);
                setImgSrc(blobUrl);
            });

        // Cleanup: revoke blob URL on unmount or before next effect run
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [drawioImg, drawioTitle, path]);

    function utf8ToBase64(str) {
        const utf8Bytes = new TextEncoder().encode(str);
        let binary = '';
        utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary);
    }
    async function handleCopyAsImage() {
        // Safari requires navigator.clipboard.write to be initiated synchronously within the user gesture.
        // We pass a Promise to ClipboardItem to satisfy this, while generating the image asynchronously.
        const blobPromise = new Promise(async (resolve, reject) => {
            try {
                const r = await fetch(imgSrc);
                const text = await r.text();

                const viewBox = text.match(/viewBox="([^"]*)"/)[1].split(' ');
                const height = parseInt(viewBox[3]);
                const width = parseInt(viewBox[2]);

                // Increase scale to supersample the SVG for much sharper rasterized text,
                // especially noticeable when pasting into PowerPoint from Safari.
                const SCALE = 3;

                let canvas = document.createElement('canvas');
                canvas.width = width * SCALE;
                canvas.height = height * SCALE;

                let img = new Image();
                img.onload = function () {
                    let ctx = canvas.getContext('2d');
                    ctx.scale(SCALE, SCALE);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    }, 'image/png');
                };
                img.onerror = function (e) {
                    logger.error('The clipboard image failed to load', e);
                    reject(e);
                };
                img.src = 'data:image/svg+xml;base64,' + utf8ToBase64(text);
            } catch (err) {
                // Must manually reject because errors thrown inside an async executor 
                // are not automatically caught by the outer Promise constructor.
                reject(err);
            }
        });

        try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            logger.error('Failed to copy image to clipboard:', err);
            setCopied(false);
        }
    }
    return (
        // current selector to apply zoom (see docusaurus.config) selects img as direct child
        // using single div with inline-block display to maintain zoom functionality
        <>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                    decoding="async"
                    loading="lazy"
                    src={imgSrc}
                    alt="image of solution diagram"
                    className={drawioImg ? '' : 'fallback-image'}
                    style={{ height: 'auto' }}
                />
                {drawioImg && (
                    <div className="tooltip">
                        <IconButton
                            onClick={() => {
                                setCopied(true), handleCopyAsImage();
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
                        <Button design="Emphasized" style={{ width: 150, borderRadius: '24px' }}>
                            Download
                        </Button>
                    </a>
                    <LinkDrawioViewer drawioXml={drawioXml} />
                </FlexBox>
            </Admonition>
        </>
    );
}
