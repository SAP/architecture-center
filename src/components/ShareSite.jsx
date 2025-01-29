import { EmailShareButton, EmailIcon, LinkedinShareButton, TwitterShareButton } from 'react-share';
import LinkedInIcon from '@theme/Icon/Socials/LinkedIn';
import XIcon from '@theme/Icon/Socials/X';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/paper-plane.js';
import '@ui5/webcomponents-icons/dist/email.js';
import { useDoc } from '@docusaurus/plugin-content-docs/lib/client/doc.js';

const ICON_SIZE = 18;
const ICON_MARGIN_LEFT = 6;

export default function ShareSite() {
    const { metadata } = useDoc();
    const pgTitle = metadata.frontMatter.title;
    // using this url until our site is public
    const url = 'https://www.sap.com/germany/index.html';
    return (
        <>
            <EmailShareButton
                url={url}
                style={{ display: 'flex' }}
                subject={'SAP Architecture Center - ' + pgTitle}
                body="I found this and thought you might like it. Enjoy!"
                // sets title of underlying button, so it shows tooltip
                htmlTitle="Send by email"
            >
                <Icon style={{ marginTop: -1, width: 20, height: 20, color: "#0070F2" }} name="paper-plane" design="Neutral" />
            </EmailShareButton>
            <LinkedinShareButton
                url={url}
                style={{ display: 'flex', marginLeft: ICON_MARGIN_LEFT }}
                htmlTitle="Share on LinkedIn"
            >
                <LinkedInIcon width={ICON_SIZE} height={ICON_SIZE} />
            </LinkedinShareButton>
            <TwitterShareButton
                url={url}
                style={{ marginLeft: ICON_MARGIN_LEFT, display: 'flex' }}
                title={`Just found this on ${pgTitle}. Check it out!`}
                htmlTitle="Share on X"
            >
                <XIcon width={ICON_SIZE} height={ICON_SIZE} />
            </TwitterShareButton>
        </>
    );
}
