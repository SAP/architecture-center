import React, { JSX } from 'react';
import { Card, Icon, Link, Title, Text } from "@ui5/webcomponents-react";

const domainsData = [
    {
        title: "AI & Machine Learning",
        icon: 'sap-icon://ai',
        links: [
            "Reference Solution Architecture 1",
            "Reference Solution Architecture 2",
            "Reference Solution Architecture 3",
            "Reference Solution Architecture 4",
            "Reference Solution Architecture 5",
        ],
    },
    {
        title: "Data & Analytics",
        icon: 'sap-icon://area-chart',
        links: [
            "Reference Solution Architecture 1",
            "Reference Solution Architecture 2",
            "Reference Solution Architecture 3",
            "Reference Solution Architecture 4",
            "Reference Solution Architecture 5",
        ],
    },
    {
        title: "Operation & Security",
        icon: 'sap-icon://shield',
        links: [
            "Reference Solution Architecture 1",
            "Reference Solution Architecture 2",
            "Reference Solution Architecture 3",
            "Reference Solution Architecture 4",
            "Reference Solution Architecture 5",
        ],
    },
    {
        title: "Application Dev. & Automation",
        icon: 'sap-icon://developer-settings',
        links: [
            "Reference Solution Architecture 1",
            "Reference Solution Architecture 2",
            "Reference Solution Architecture 3",
            "Reference Solution Architecture 4",
            "Reference Solution Architecture 5",
        ],
    },
    {
        title: "Integration",
        icon: 'sap-icon://step',
        links: [
            "Reference Solution Architecture 1",
            "Reference Solution Architecture 2",
            "Reference Solution Architecture 3",
            "Reference Solution Architecture 4",
            "Reference Solution Architecture 5",
        ],
    },
];

export default function Domain() {
    return (
        <section>
        <div style={{
            padding: '4rem 2rem',
            fontFamily: 'sans-serif',
            marginBottom: '320px',
        }}>
            <div style={{ 
                maxWidth: '1440px',
                margin: '0 auto 40px auto',
                padding: '0 10px'
            }}>
                <Title level="H1" style={{ fontSize: '36px', color: '#333', marginBottom: '10px' }}>
                    Technology Domains
                </Title>
                <Text style={{ fontSize: '20px', color: '#555' }}>
                    Explore architectures for different technology domains
                </Text>
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: '45px',
                maxWidth: '1440px',
                margin: '0 auto',
                height: '280px'
            }}>
                {domainsData.map((domain, index) => (
                    <Card key={index} style={{
                        width: '450px',
                    }}>
                        <div style={{
                            paddingTop: '10px',
                            marginLeft: '20px'
                        }}>
                            <Title level="H3" style={{ fontSize: '20px', fontWeight: 'bold',  }}>
                             <Icon name={domain.icon}/>    {domain.title}
                            </Title>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' , marginLeft: '35px', marginBottom: '20px', marginTop: '10px' }}>
                            {domain.links.map((linkText, linkIndex) => (
                                <div key={linkIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Icon name="sap-icon://circle-task" style={{ color: '#0b65d8', fontSize: '14px', flexShrink: 0 }} />
                                    <Link href="#" style={{ color: '#0b65d8', fontSize: '16px', textDecoration: 'none' }}>
                                        {linkText}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
        </section>
    );
}