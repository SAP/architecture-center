import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

export default function HeroSection(): JSX.Element {
    const { colorMode } = useColorMode();
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);

    // Responsive srcSets for light and dark, now using .webp for compression
    const lightSrcSet = [
        getImg('architecture_center_banner5_rounded_700x206_light.webp') + ' 700w',
        getImg('architecture_center_banner5_rounded_1200x353_light.webp') + ' 1200w',
        getImg('architecture_center_banner5_rounded_1440x424_light.webp') + ' 1440w',
    ].join(', ');

    const darkSrcSet = [
        getImg('architecture_center_banner5_rounded_700x206_dark.webp') + ' 700w',
        getImg('architecture_center_banner5_rounded_1200x353_dark.webp') + ' 1200w',
        getImg('architecture_center_banner5_rounded_1440x424_dark.webp') + ' 1440w',
    ].join(', ');

    const srcSet = colorMode === 'dark' ? darkSrcSet : lightSrcSet;
    const fallbackSrc =
        colorMode === 'dark'
            ? getImg('architecture_center_banner5_rounded_1440x424_dark.webp')
            : getImg('architecture_center_banner5_rounded_1440x424_light.webp');

    return (
        <section>
            <div
                className="hero_banner"
                style={{
                    width: '100%',
                    height: '424px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <img
                    src={fallbackSrc}
                    srcSet={srcSet}
                    sizes="(max-width: 600px) 350px, (max-width: 1200px) 700px, 1440px"
                    width={1440}
                    height={424}
                    alt="SAP Architecture Center Banner"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                    loading="eager"
                    fetchPriority="high"
                />
                <div
                    className="container"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '0',
                    }}
                >
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
