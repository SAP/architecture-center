import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';

export default function CommunitySection(): JSX.Element {
    return (
        <section>
            <br /> <br />
            <div className="container">
                <div className="community">
                    <div className="community_image">
                        <img src="/img/landingPage/community_puzzle.png" className="community_image_inside" />
                    </div>
                    <div className="community_body">
                        <h2>
                            <b>
                                <HighlightText>Let's Build Together!</HighlightText>
                            </b>
                        </h2>
                        <p>
                            Are you passionate about solution architecture and eager to share your knowledge and
                            expertise with others?
                            <br /> <br />
                            The <b>Architecture Center</b> is the perfect place for you! Whether you're an experienced
                            architect or someone just starting out, our community welcomes everyone who wants to
                            contribute and collaborate on creating and sharing reference architectures.
                            <br /> <br />
                            This is more than just a platform; it's a collective effort to advance the field of
                            architecture through shared knowledge and collaboration. Together, we can create a rich
                            repository of reference architectures that benefit everyone.
                            <br />
                        </p>
                        <Link to="/community/intro">
                            <Button design="Emphasized" style={{ width: 150 }}>
                                Let's go!
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <br /> <br />
        </section>
    );
}
export function HighlightText(props) {
    return (
        <strong className="bolder relative z-10 box-content before:absolute before:bottom-0 before:z-[-1] before:h-3 before:w-full before:bg-[#95DAFF50] before:duration-300 before:content-[''] hover:before:w-0">
            {props.children}
        </strong>
    );
}
