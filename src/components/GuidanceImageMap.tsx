// src/components/InteractiveImageMap.tsx

import React, { useEffect, useState } from 'react';
import btpFrameworkImage from '/guidance/images/loio289a6bd8bcba4b209e24de6773cb2412_LowRes.png';

const GuidanceImageMap: React.FC = () => {
    const [tooltip, setTooltip] = useState({
        visible: false,
        text: '',
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const areas = document.querySelectorAll('area');

        const showTooltip = (event: MouseEvent) => {
            const target = event.target as HTMLAreaElement;
            setTooltip({
                visible: true,
                text: target.title || '',
                x: event.pageX + 10,
                y: event.pageY + 10,
            });
        };

        const moveTooltip = (event: MouseEvent) => {
            setTooltip((prev) => ({ ...prev, x: event.pageX + 10, y: event.pageY + 10 }));
        };

        const hideTooltip = () => {
            setTooltip((prev) => ({ ...prev, visible: false }));
        };

        areas.forEach((area) => {
            area.addEventListener('mouseenter', showTooltip);
            area.addEventListener('mousemove', moveTooltip);
            area.addEventListener('mouseleave', hideTooltip);
        });

        return () => {
            areas.forEach((area) => {
                area.removeEventListener('mouseenter', showTooltip);
                area.removeEventListener('mousemove', moveTooltip);
                area.removeEventListener('mouseleave', hideTooltip);
            });
        };
    }, []);

    return (
        <div className="image-container" style={{ position: 'relative' }}>
            <img
                src={btpFrameworkImage}
                alt="SAP BTP Guidance Framework"
                className="no-zoom"
                useMap="#d178e96"
                style={{ width: '100%', height: 'auto' }}
            />

            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        backgroundColor: '#fff',
                        borderLeft: '5px solid #0c66ff',
                        padding: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 999,
                        maxWidth: '250px',
                        color: '#000',
                        pointerEvents: 'painted',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <p style={{ margin: 0 }}>{tooltip.text}</p>
                </div>
            )}

            <map name="d178e96" id="d178e96">
                <area
                    coords="83,85,190,95"
                    shape="rect"
                    className="icolor000000 forcegroup"
                    href="/guidance/intro"
                    alt="Consult this guide to understand how you can evolve your existing integration architecture based on SAP BTP and the SAP technology offerings available today. Link to another SAP-owned site."
                    title="Consult this guide to understand how you can evolve your existing integration architecture based on SAP BTP and the SAP technology offerings available today. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="280,91,381,101"
                    shape="rect"
                    href="https://help.sap.com/docs/btp/btp-developers-guide/what-is-btp-developers-guide?version=Cloud"
                    alt="Learn about the SAP BTP Developer’s Guide and how you can use it to improve the process of implementing a business application on SAP BTP. Link to another SAP-owned site."
                    title="Learn about the SAP BTP Developer’s Guide and how you can use it to improve the process of implementing a business application on SAP BTP. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="97,218,214,228"
                    shape="rect"
                    href="/explore"
                    alt="Reference architecture diagrams of SAP BTP describe which services to choose for implementing a specific use case pattern and how these interact with each other and together with business applications from SAP, partners or third-party. Link to another SAP-owned site."
                    title="Reference architecture diagrams of SAP BTP describe which services to choose for implementing a specific use case pattern and how these interact with each other and together with business applications from SAP, partners or third-party. Link to another SAP-owned site."
                    target=""
                />

                <area
                    coords="183,230,286,240"
                    shape="rect"
                    href="https://hub.sap.com/allprocess"
                    alt="Accelerate integration by using process blueprints. Link to another SAP-owned site."
                    title="Accelerate integration by using process blueprints. Link to another SAP-owned site."
                    target=""
                />

                <area
                    coords="479,222,577,231"
                    shape="rect"
                    href="https://help.sap.com/docs/btp/sap-btp-security-recommendations-c8a9bb59fe624f0981efa0eff2497d7d/sap-btp-security-recommendations"
                    alt="These recommendations help you evaluate the security of the configuration of SAP BTP. Link to another SAP-owned site."
                    title="These recommendations help you evaluate the security of the configuration of SAP BTP. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="388,156,470,166"
                    shape="rect"
                    href="https://help.sap.com/docs/DEVOPS_OVERVIEW?version=Cloud"
                    alt="Apply DevOps principles in your application development on SAP BTP. Link to another SAP-owned site."
                    title="Apply DevOps principles in your application development on SAP BTP. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="54,143,216,153"
                    shape="rect"
                    href="https://help.sap.com/docs/sap_btp_guidance_framework/f64ada51d9f44c83a751b96f955aad5a?locale=en-US&state=PRODUCTION&version=Cloud"
                    alt="The SAP Integration Solution Advisory Methodology helps you to define, document and execute an enterprise integration strategy for your organization. Link to another SAP-owned site."
                    title="The SAP Integration Solution Advisory Methodology helps you to define, document and execute an enterprise integration strategy for your organization. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="66,155,206,165"
                    shape="rect"
                    href="https://help.sap.com/docs/sap_btp_guidance_framework/2f804cb5e53d4279879009100a2b2082?locale=en-US&state=PRODUCTION&version=Cloud"
                    alt="The SAP Application Extension Methodology helps you to define, document and execute an enterprise extension strategy for your organization. Link to another SAP-owned site."
                    title="The SAP Application Extension Methodology helps you to define, document and execute an enterprise extension strategy for your organization. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="56,167,215,177"
                    shape="rect"
                    href="https://help.sap.com/docs/sap_btp_guidance_framework/a87bb2600925461190e14920a69bff7e?locale=en-US&state=PRODUCTION&version=Cloud"
                    alt="The SAP Data and Analytics Advisory Methodology is a structured approach to develop tailored Solution Architectures for data-driven business outcomes and plan their implementation. Link to another SAP-owned site."
                    title="The SAP Data and Analytics Advisory Methodology is a structured approach to develop tailored Solution Architectures for data-driven business outcomes and plan their implementation. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="471,91,582,101"
                    shape="rect"
                    href="https://help.sap.com/docs/btp/btp-admin-guide/btp-admin-guide"
                    alt="Learn how you can use the SAP BTP Administrator's Guide to plan and set up your landscape and your lifecycle management for running applications on SAP BTP. Link to another SAP-owned site."
                    title="Learn how you can use the SAP BTP Administrator's Guide to plan and set up your landscape and your lifecycle management for running applications on SAP BTP. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="295,263,410,275"
                    shape="rect"
                    href="https://learning.sap.com/products/business-technology-platform"
                    alt="Learn about SAP Business Technology Platform (SAP BTP) Link to another SAP-owned site."
                    title="Learn about SAP Business Technology Platform (SAP BTP) Link to another SAP-owned site."
                    target=""
                />

                <area
                    coords="414,263,472,275"
                    shape="rect"
                    href="https://pages.community.sap.com/topics/business-technology-platform"
                    alt="SAP Business Technology Platform (SAP BTP) brings together application development, data and analytics, integration, and AI capabilities into one unified environment optimized for SAP applications. Link to another SAP-owned site."
                    title="SAP Business Technology Platform (SAP BTP) brings together application development, data and analytics, integration, and AI capabilities into one unified environment optimized for SAP applications. Link to another SAP-owned site."
                    target=""
                />

                <area
                    coords="185,298,481,317"
                    shape="rect"
                    href="https://help.sap.com/docs/btp?version=Cloud"
                    alt="SAP BTP offers users the ability to turn data into business value, compose end-to-end business processes, and build and extend SAP applications quickly. Link to another SAP-owned site."
                    title="SAP BTP offers users the ability to turn data into business value, compose end-to-end business processes, and build and extend SAP applications quickly. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="85,97,188,107"
                    shape="rect"
                    href="https://help.sap.com/docs/sap_btp_guidance_framework/0d65087f886b45488953c28f0ad29c05?locale=en-US&state=PRODUCTION&version=Cloud"
                    alt="Consult this guide to understand how you can evolve your existing extension architecture based on SAP BTP and the SAP technology offerings available today. Link to another SAP-owned site."
                    title="Consult this guide to understand how you can evolve your existing extension architecture based on SAP BTP and the SAP technology offerings available today. Link to another SAP-owned site."
                    target="_blank"
                />

                <area
                    coords="218,218,370,228"
                    shape="rect"
                    href="https://sap.github.io/btp-solution-diagrams/"
                    alt="The repository includes latest updates and ready-to-use templates to develop high quality diagrams of architectural landscapes. Link to a site that is not hosted by SAP."
                    title="The repository includes latest updates and ready-to-use templates to develop high quality diagrams of architectural landscapes. Link to a site that is not hosted by SAP."
                    target=""
                />

                <area
                    coords="190,263,289,275"
                    shape="rect"
                    href="https://discovery-center.cloud.sap/index.html"
                    alt="Discover, evaluate, and adopt SAP Business Technology Platform services and AI features to create tailored business solutions. Link to another SAP-owned site."
                    title="Discover, evaluate, and adopt SAP Business Technology Platform services and AI features to create tailored business solutions. Link to another SAP-owned site."
                    target=""
                />
            </map>
        </div>
    );
};

export default GuidanceImageMap;
