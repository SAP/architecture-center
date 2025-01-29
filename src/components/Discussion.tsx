import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Admonition from '@theme/Admonition';
import { FlexBox } from '@ui5/webcomponents-react';
import { Button } from '@ui5/webcomponents-react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import "@ui5/webcomponents-icons/dist/discussion.js";
import "@ui5/webcomponents-icons/dist/write-new-document.js";

const CONVERSATION_URI_PREFIX_GH = 'github:';
const CONVERSATION_URI_PREFIX_SC = 'community:';
const GITHUB_HOST = 'https://github.com';
const SC_HOST = 'https://community.sap.com';
const SC_AC_BASEURL = '';

export default function Discussion(): JSX.Element | null {
    const { metadata } = useDoc();
    const discussion: string = metadata.frontMatter.discussion as string;

    if (!discussion) {
        return null;
    }

    return (
        <Admonition type="tip" title="Feedback: Engage & Support">
            If you have questions about components, services, or implementation, you can{' '}
            <b>join an existing discussion</b> or <b>start a new discussion</b> in the GitHub conversations section.
            <br />
            If you spot an inaccuracy or mistake on the page, feel free to create a <b>new GitHub issue</b> and include
            as many details as possible.
            <br />
            <br />
            <FlexBox direction="Row" justifyContent="SpaceAround" wrap="Wrap" style={{ gap: 8 }}>
                {discussion.startsWith(CONVERSATION_URI_PREFIX_GH) ? (
                    <a
                        href={
                            GITHUB_HOST +
                            useBaseUrl(`discussions/${discussion.substring(CONVERSATION_URI_PREFIX_GH.length)}`)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button design="Emphasized" icon="discussion">
                            Connect on GitHub Discussions
                        </Button>
                    </a>
                ) : discussion.startsWith(CONVERSATION_URI_PREFIX_SC) ? (
                    <a
                        href={SC_HOST + SC_AC_BASEURL + discussion.substring(CONVERSATION_URI_PREFIX_SC.length)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button design="Emphasized" icon="discussion">
                            Discuss on community.sap.com
                        </Button>
                    </a>
                ) : null}
                {discussion.startsWith(CONVERSATION_URI_PREFIX_GH) ? (
                    <a href={GITHUB_HOST + useBaseUrl(`issues/new/choose/`)} target="_blank">
                        <Button design="Emphasized" icon="write-new-document">
                            Create a new GitHub issue
                        </Button>
                    </a>
                ) : (
                    <></>
                )}
            </FlexBox>
        </Admonition>
    );
}
