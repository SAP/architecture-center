import React, { JSX } from 'react';
import Link from '@docusaurus/Link';

export default function CommunitySection(): JSX.Element {
    return (
        <section>
            <div className="container">
                <div className="community">
                    <h2>
                        <b>
                            <HighlightText>Connect with Community</HighlightText>
                        </b>
                    </h2>
                    <div className="community_image">
                        <img src="/img/landingPage/community.jpg" className="community_image_inside" />
                    </div>
                    <div className="community_body">
                        <p>
                            Are you an architect, or someone in a similar role, with experience creating solution
                            diagrams? Would you like to dive deeper into the subject or get involved enhancing the BTP
                            Solution Diagram Design Guideline? <br />
                            Why not share your expertise with us and enjoy the opportunity to interact with a wider
                            network of architects and like-minded individuals across numerous platforms? Here's how you
                            can initiate and build on these connections. <br />
                            <br />
                            <b>Visit the communities to help us help each other!</b>
                        </p>
                        <div className="community_buttons">
                            <Link className="button_filled_community" to="/community/intro">
                                Connect with Community
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
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
