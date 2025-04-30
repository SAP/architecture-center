import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';

export default function HeroSection(): JSX.Element {
    return (
        <section>
            <br />
            <br />
            <br />
            <div className="hero_banner">
                <div className="container">
                    <div className="welcome">
                        <h1 className="header_title">
                            <b className="header_text">SAP Architecture Center</b>
                        </h1>

                        <div className="header_body">
                            <p className="header_body_p">
                                The SAP Architecture Center offers a place that provides solution reference
                                architectures, helping businesses adopt SAP solutions to turn data into valuable
                                business insights.
                            </p>
                        </div>

                        <Link to="/docs/exploreallrefarch">
                            <Button style={{ width: 150 }}>Explore Now</Button>
                        </Link>
                    </div>
                </div>
            </div>
            <br />
            <br />
            <br />
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
