import { FlexBox, Button } from '@ui5/webcomponents-react';
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';
import LinkDrawioViewer from './LinkDrawioViewer';
import useBaseUrl from '@docusaurus/useBaseUrl';

// eventually, the drawio image won't be there locally. we'll generate it before deployment
// locally, use fallback image
const FALLBACK_IMG = '/img/fallback-drawio-img.svg';

export default function DrawioResources({ drawioFile, drawioXml, drawioImg }) {
    const path = useBaseUrl(FALLBACK_IMG);
    return (
        // current selector to apply zoom (see docusaurus.config) doesn't select img if directly
        // under div with class 'markdown' => wrap img in paragraph for now
        <>
            <p>
                <img
                    decoding="async"
                    loading="lazy"
                    src={drawioImg ?? path}
                    alt="image of solution diagram"
                    className={drawioImg ? '' : 'fallback-image'}
                    style={{ height: 'auto'}}
                />
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
