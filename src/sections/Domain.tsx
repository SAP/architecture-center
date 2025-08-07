import React, { JSX } from 'react';
import { Title, Text } from '@ui5/webcomponents-react';
import { TECH_DOMAIN } from '../constant/constants';
import Tile from '../components/Tile/Tile';

export default function Domain(): JSX.Element {
    return (
        <section>
            <div
                style={{
                    maxWidth: '1440px',
                    margin: '40px auto 40px auto',
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
                        gridTemplateColumns: 'repeat(3, 1fr)',
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
