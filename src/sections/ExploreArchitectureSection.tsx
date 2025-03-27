import React, { useRef, useState } from 'react';
import DocCard from '@theme/DocCard';
// @ts-ignore
import exploreSidebar from '../data/exploreArch.json';
import { Text, Title, Button, FlexBox } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/navigation-left-arrow";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow";

export default function ExploreAllArchitecturesSection() {
    // Extract sidebar items
    let items = exploreSidebar[0]?.items || [];

    // Group items into sets of 3 for each slide
    const groupedItems = [];
    for (let i = 0; i < items.length; i += 3) {
        groupedItems.push(items.slice(i, i + 3));
    }

    // Carousel Reference
    const carouselRef = useRef(null);
    const [activeDirection, setActiveDirection] = useState<'left' | 'right'>('right');

    // Function to Scroll Carousel
    const goNext = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth, behavior: "smooth" });
            setActiveDirection('left');
        }
    };

    const goPrevious = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth, behavior: "smooth" });
        }
        setActiveDirection('right');
    };

    return (
        <div style={{ backgroundColor: '#eaf3fc', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1300px' }}>

                {/* Header Section with Title and Browse Arrows */}
                <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ marginLeft: '10px', marginBottom: '20px' }}>
                    <Title>Explore the latest Reference Architectures</Title>

                    {/* Browse + Arrows */}
                    <FlexBox alignItems="Center" style={{ gap: '10px' }}>
                        <Text style={{ fontWeight: 'bold' }}>Browse</Text>
                        <Button design={activeDirection === 'left' ? 'Emphasized' : 'Transparent'} icon="navigation-left-arrow" onClick={goPrevious} disabled={items.length < 4} />
                        <Button design={activeDirection === 'right' ? 'Emphasized' : 'Transparent'} icon="navigation-right-arrow" onClick={goNext} disabled={items.length < 4} />
                    </FlexBox>
                </FlexBox>

                {/* Carousel Section (Now with Hidden Scrollbar) */}
                <div
                    ref={carouselRef}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollBehavior: 'smooth',
                        gap: '16px',
                        padding: '10px',
                        whiteSpace: 'nowrap',

                        /* Hide scrollbar */
                        scrollbarWidth: 'none', /* Firefox */
                        msOverflowStyle: 'none' /* IE & Edge */
                    }}
                >
                    {/* Hide scrollbar for Webkit (Chrome, Safari) */}
                    <style>
                        {`
                        div::-webkit-scrollbar {
                            display: none;
                        }

                        .card-container {
                            flex-shrink: 0;
                            width: 100%;
                            max-width: 410px;
                        }

                        @media (max-width: 900px) {
                        .card-container {
                            width: 48%;
                        }
                        }

                        @media (max-width: 600px) {
                        .card-container {
                            width: 100%;
                        }
                        }
                        `}
                    </style>

                    {groupedItems.map((group, index) => (
                        <div key={index} style={{ display: 'flex', flex: '0 0 auto', width: '100%', justifyContent: 'space-between' }}>
                            {group.map((item) => (
                                <div key={item.id} className='card-container'>
                                    <DocCard item={item} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
