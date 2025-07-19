import React, { JSX, useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import HighlightText from '../components/HighlightText';

export default function CommunitySection(): JSX.Element {
    const { colorMode } = useColorMode();
    const [mounted, setMounted] = useState(false);
    const getImg = (name: string) => useBaseUrl(`/img/landingPage/${name}`);

    useEffect(() => {
        setMounted(true);
    }, []);

    // WebP sources
    const lightSrcSet = [
        getImg('community_puzzle_light_150.webp') + ' 150w',
        getImg('community_puzzle_light_300.webp') + ' 300w',
        getImg('community_puzzle_light_500.webp') + ' 500w',
    ].join(', ');

    const darkSrcSet = [
        getImg('community_puzzle_dark_150.webp') + ' 150w',
        getImg('community_puzzle_dark_300.webp') + ' 300w',
        getImg('community_puzzle_dark_500.webp') + ' 500w',
    ].join(', ');

    const srcSet = mounted && colorMode === 'dark' ? darkSrcSet : lightSrcSet;
    const fallbackSrc = mounted && colorMode === 'dark'
        ? getImg('community_puzzle_dark_500.webp')
        : getImg('community_puzzle_light_500.webp');

    return (
        <section>
            <br /> <br />
            <div className="community-section-wrapper">
                <div className="community">
                    <div className="community_image">
                        <img
                            src={fallbackSrc}
                            srcSet={srcSet}
                            sizes="(max-width: 600px) 140px, (max-width: 996px) 280px, 400px"
                            className="community_image_inside"
                            alt="Community Puzzle"
                            width={500}
                            height={500}
                            loading="lazy"
                        />
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
                            <Button design="Emphasized" className="standard-button-width">
                                Let's team up!
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <br /> <br />
        </section>
    );
}
