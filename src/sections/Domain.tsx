import React, { JSX, useState, useEffect } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { TECH_DOMAIN } from '../constant/constants';
import Tile from '../components/Tile/Tile';

export default function Domain(): JSX.Element {
    const [columns, setColumns] = useState(3);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width <= 600) {
                setColumns(1);
            } else if (width <= 992) {
                setColumns(2);
            } else {
                setColumns(3);
            }
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    return (
        <section>
            <div
                style={{
                    maxWidth: '1440px',
                    margin: '40px auto',
                    padding: '0 10px',
                }}
            >
                <Title level="H1" style={{ fontSize: '36px', color: '#333', marginBottom: '10px' }}>
                    Technology Domains
                </Title>
                <Text style={{ fontSize: '20px', color: '#555' }}>
                    Explore architectures for different technology domains
                </Text>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: '24px',
                        width: '100%',
                        maxWidth: '1425px',
                        marginTop: '40px',
                    }}
                >
                    {TECH_DOMAIN.map((domain, index) => (
                        <Tile id={domain.id} key={index} title={domain.title} icon={domain.icon} />
                    ))}
                </div>
            </div>
        </section>
    );
}
