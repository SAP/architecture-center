import { FlexBox, Button } from '@ui5/webcomponents-react';
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';
import LinkDrawioViewer from './LinkDrawioViewer';
import '@ui5/webcomponents-icons/dist/download.js';

export default function DrawioResources({ drawioFile }) {
    return (
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
                    <Button design="Emphasized" icon="download">
                        Download as .drawio file
                    </Button>
                </a>
                <LinkDrawioViewer drawioFile={drawioFile} />
            </FlexBox>
        </Admonition>
    );
}
