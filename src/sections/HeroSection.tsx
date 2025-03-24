import React, { JSX } from 'react';
import Link from '@docusaurus/Link';

export default function HeroSection(): JSX.Element {
    return (
        <section>
            <div className="hero_banner">
                {/* <div className="banner-overlay"></div> */}
                <div className="container">
                    <div className="welcome">
                        <h1>
                            <b className="header_text">SAP Architecture Center</b>
                        </h1>

                        <div className="header_body">
                            <p className="header_body_p">
                                The SAP Architecture Center offers a place that provides solution reference <br />
                                architectures, helping businesses adopt SAP solution to turn data into valuable <br />
                                business insights.
                            </p>
                        </div>

                        <div className="header_button">
                            <Link className="button_hero" to="/docs/exploreallrefarch">
                                Explore the Reference Architecture
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
