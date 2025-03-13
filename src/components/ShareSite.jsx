import { EmailShareButton, LinkedinShareButton } from 'react-share';
import LinkedInIcon from '@theme/Icon/Socials/LinkedIn';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/paper-plane.js';
import '@ui5/webcomponents-icons/dist/email.js';
import { useDoc } from '@docusaurus/plugin-content-docs/lib/client/doc.js';
import useIsBrowser from '@docusaurus/useIsBrowser';

const ICON_SIZE = 18;
const ICON_MARGIN_LEFT = 6;

export default function ShareSite() {
    const { metadata } = useDoc();
    const isBrowser = useIsBrowser();
    const pgTitle = metadata.frontMatter.title;
    const url = isBrowser ? window.location.toString() : '';
    return (
        <>
            <EmailShareButton
                url={url}
                style={{ lineHeight: 1 }}
                subject={'SAP Architecture Center - ' + pgTitle}
                body={`Hey,\n\nI found this and thought you might like it.\n\n`}
                // sets title of underlying button, so it shows tooltip
                htmlTitle="Send by email"
            >
                <Icon style={{ width: 20, height: 20, color: '#0070F2' }} name="paper-plane" />
            </EmailShareButton>
            <LinkedinShareButton
                url={url}
                style={{ marginLeft: ICON_MARGIN_LEFT, lineHeight: 1 }}
                htmlTitle="Share on LinkedIn"
            >
                <LinkedInIcon width={ICON_SIZE} height={ICON_SIZE} />
            </LinkedinShareButton>
        </>
    );
}
