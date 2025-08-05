import React, { JSX } from 'react';
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
            <div className="hero_banner">
                <img
                    src={fallbackSrc}
                    srcSet={srcSet}
                    sizes="(max-width: 600px) 350px, (max-width: 1200px) 700px, 1440px"
                    width={1440}
                    height={424}
                    alt="SAP Architecture Center Banner"
                    loading="eager"
                    fetchPriority="high"
                />
                <div className="hero_banner__overlay">
                    <div className="welcome">
                        <h1 className="header_title">
                            <b className="header_text">SAP Architecture Center</b>
                        </h1>

                        <br />
                        <h3>Give you the tools to shape your future</h3>

                        <br />

                        <div className="header_body">
                            <p className="header_body_p">
                                Put AI, data and application to work with comprehensive architectures of SAP solutions
                                tailored to your needs and read to extends as you grow.
                            </p>
                        </div>

                        {/* <Link to="/docs/exploreallrefarch">
                            <Button style={{ width: 150 }}>Explore Now</Button>
                        </Link> */}
                    </div>
                </div>
            </div>
        </section>
    );
}
