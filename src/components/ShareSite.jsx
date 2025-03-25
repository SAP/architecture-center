import LinkedInIcon from '@theme/Icon/Socials/LinkedIn';
import { Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/paper-plane.js';
import '@ui5/webcomponents-icons/dist/email.js';
import { useDoc } from '@docusaurus/plugin-content-docs/lib/client/doc.js';
import useIsBrowser from '@docusaurus/useIsBrowser';

const LINKEDIN_SHARE_URL = 'https://www.linkedin.com/sharing/share-offsite/?url=';
const MAIL_ICON_SIZE = 20;
const LINKEDIN_ICON_SIZE = 18;

export default function ShareSite() {
    const { metadata } = useDoc();
    const isBrowser = useIsBrowser();
    const pgTitle = metadata.frontMatter.title;
    const url = isBrowser ? window.location.toString() : '';

    const mailSubject = 'SAP Architecture Center - ' + pgTitle;
    const mailBody = 'Hey,\n\nI came across this on the SAP Architecture Center and thought you would find it interesting.\n\nCheck it out here: ' + url + '\n\nEnjoy the read!\n';

    return (
        <>
            <a
                href={`mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}
                role="button"
                // shows tooltip
                title="Send by email"
                style={{
                    display: 'inline flow-root',
                    width: MAIL_ICON_SIZE,
                    height: MAIL_ICON_SIZE,
                }}
            >
                <Icon style={{ width: MAIL_ICON_SIZE, height: MAIL_ICON_SIZE, color: '#0070F2' }} name="paper-plane" />
            </a>
            <a
                href={LINKEDIN_SHARE_URL + encodeURIComponent(url)}
                target="_blank"
                role="button"
                title="Share on LinkedIn"
                style={{
                    marginLeft: 6,
                    display: 'inline flow-root',
                    width: LINKEDIN_ICON_SIZE,
                    height: LINKEDIN_ICON_SIZE,
                }}
            >
                <LinkedInIcon width={LINKEDIN_ICON_SIZE} height={LINKEDIN_ICON_SIZE} />
            </a>
        </>
    );
}
