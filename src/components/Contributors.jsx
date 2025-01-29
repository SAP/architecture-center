import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';
import { FlexBox } from '@ui5/webcomponents-react';
import contributorDetails from '../../docs/contributors';
import fallbackAvatar from '../../static/img/github-logo.png';
import { useDoc } from '@docusaurus/plugin-content-docs/lib/client/doc.js';

const GITHUB_HOST = 'https://github.com';

export default function Contributors() {
    const { metadata } = useDoc();
    const usernames = metadata.frontMatter.contributors;
    // the GitHub usernames of the contributors
    console.assert(Array.isArray(usernames), 'usernames should be an array of strings');
    return (
        <Admonition type="note" title="Contributors">
            <FlexBox direction="Row" wrap="Wrap" style={{ gap: 8 }}>
                {usernames.sort().map((user, index) => {
                    const isLast = index === usernames.length - 1;
                    // details like avatar url, full name
                    const dets = contributorDetails[user] ?? null;

                    return (
                        <FlexBox key={index} direction="Row" alignItems="Center">
                            <img
                                src={dets ? dets.avatarUrl : fallbackAvatar}
                                alt="avatar of contributor"
                                style={{ borderRadius: '50%', width: 26, height: 26 }}
                            />
                            <Link to={dets ? dets.profileUrl : GITHUB_HOST + '/' + user} style={{ marginLeft: 6 }}>
                                {dets && dets.fullName ? dets.fullName : user}
                            </Link>
                            {!isLast && <span>,</span>}
                        </FlexBox>
                    );
                })}
            </FlexBox>
        </Admonition>
    );
}
