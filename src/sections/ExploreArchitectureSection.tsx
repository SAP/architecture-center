import React, { JSX } from 'react';
import { BUTTON_TOPIC } from '../constant/constants';
import Custom_Button from '../components/Custom_Button/Custom_Button';

export default function ExploreArchitectureSection(): JSX.Element {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '1425px',
                }}
            >
                {BUTTON_TOPIC.map((product, index) => (
                    <div key={index}>
                        <Custom_Button title={product.title} icon={product.icon} link={product.link} />
                    </div>
                ))}
            </div>
        </div>
    );
}
