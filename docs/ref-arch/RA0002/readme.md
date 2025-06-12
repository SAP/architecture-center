---
id: id-ra0002
slug: /ref-arch/81805673c0
sidebar_position: 2
sidebar_custom_props:
  category_index:
    - appdev
    - integration
    - aws
    - azure
title: Architecting Multi-Region HA/DR resiliency patterns
description: >-
  Learn how to architect multi-region resiliency for SAP solutions such to
  ensure high availability and business continuity. This guide covers
  strategies, best practices, and sample implementations for a robust, compliant
  multi-region setup with failover and disaster recovery capabilities.
keywords:
  - sap
  - multi-region architecture
  - ha dr strategies
  - business reliability
  - failover management
sidebar_label: Architecting Multi-Region Resiliency
image: img/ac-soc-med.png
tags:
  - aws
  - azure
  - appdev
  - integration
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - martinfrick
  - maxstreifeneder
  - kshanth
  - mahesh0431
  - anirban-sap
  - jmsrpp
  - uklasing
  - alperdedeoglu
  - arajsinha
discussion: 
last_update:
  author: mahesh0431
  date: 2025-02-19
---

In today's interconnected business landscape, ensuring the resilience of mission-critical applications is paramount. Organizations face diverse challenges ranging from natural disasters to cyber threats, making a robust disaster recovery (DR) strategy essential. A multi-region disaster recovery setup serves as a safeguard, ensuring that applications and data are replicated across geographically dispersed locations. This not only enhances data resilience and business continuity but also helps meet regulatory compliance requirements by guaranteeing uninterrupted access to essential services.

While many SAP products support multi-region disaster recovery as part of their architecture, certain solutions, like SAP BTP, require customers to architect the setup. Although SAP BTP services offer multi-Availability Zone (multi-AZ) resiliency by default, some customers need additional robustness and regulatory compliance through a multi-region configuration. This documentation will guide you through the concepts, strategies, and best practices for implementing multi-region architectures on SAP BTP.

## Architecture

SAP BTP offers a global infrastructure that allows deployment across various regions which helps our customers achieve multi-region setup for their services. The following diagram presents a comprehensive reference architecture for multi-region deployment on SAP BTP:

![drawio](drawio/architecting-multi-region-resiliency-for-sap-btp-use-cases.drawio)


### Workflow

The reference architecture diagram shows the Muti-Region Resilient architecture for the SAP BTP Services and the applications built on SAP BTP.

1. DNS-based load balancers like Azure Traffic Manager or Amazon Route 53 oversee the health of application endpoints distributed across multiple regions (two SAP BTP subaccounts). They employ DNS-based load balancing to direct user traffic to the operational service endpoint by updating DNS records accordingly. Users access the application via the URL provided by the load balancer.
2. Implementing a multi-region architecture requires two different SAP BTP subaccounts in separate hyperscaler regions. If one subaccount experiences service interruptions, the other can take over without disrupting operations. Using the SAP Custom Domain service is crucial to maintain a single, customized URL for a consistent user experience.
3. SAP BTP Services achieve high availability by leveraging multiple availability zones in a single hyperscaler region. For disaster recovery, such as a regional switch, a cross-region HA and DR setup is essential for adequate protection. This requires the SAP BTP services or applications to be available in both the subaccounts.
4. SAP Integration Suite, Advanced Event Mesh Message Replication can be configured to duplicate messages/events across different regions using DMR (Dynamic Message Routing) cluster replication. The DMR cluster is a feature that ensures events and messages are replicated from one region to another. This is particularly useful in maintaining data consistency and availability during regional outages. For more information, refer to the [SAP Integration Suite documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE). With two separate subaccounts set up for SAP HANA Cloud and employing Smart Data Access (SDA) – Remote Table Replication, the data is replicated to another region's SAP HANA Cloud. Smart Data Access (SDA) allows for real-time data access and integration across different databases, while Remote Table Replication ensures that data changes in one region are mirrored in another. For more details, see the [SAP HANA Cloud documentation](https://help.sap.com/docs/HANA_CLOUD).
5. An open-source application, called Multi-Region Manager (MRM) on SAP BTP orchestrates the topology change between regions, controlling the data synchronization of SAP HANA Cloud and the event synchronization of SAP Integration Suite’s Advanced Event Mesh. It acts as a control plane in orchestrating the failover process and providing flexibility for both manual and automated failover scenarios.
6. SAP Continuous Integration and Delivery (CI/CD) or the project “Piper” can be used to manage the creation and deployment of numerous SAP BTP services' artifacts or applications ensuring seamless synchronization and consistency across the two subaccounts in the multi-region setup.
7. An external scheduler with multi-region HA capabilities ensures HA setup for scheduled jobs that regularly call SAP BTP services or custom services built on SAP BTP.

:::note
- This architecture is adaptable. Your specific implementation may vary based on your unique requirements, the services you choose to use, and your existing infrastructure.
- The architecture and strategies outlined in these approaches are reference designs and not turnkey solutions. Our assessment provides an architectural perspective on disaster recovery approaches using selected SAP BTP services and hyperscaler offerings such as Azure Traffic Manager and Amazon Route 53. This represents one possible method for managing stateless and stateful failovers. Additionally, these designs do not encompass the evaluation of customer-specific requirements or custom scenarios. Actual implementations will necessitate careful planning, customization, and development to address unique business needs and constraints.
:::

<!-- ## Overview of Multi-Region Resiliency

Multi-region resiliency refers to the capability of an application or system to sustain its functionality and performance across multiple geographically dispersed data centers. This approach safeguards against large-scale outages and disasters that could impact an entire region, ensuring continuous service availability.

Multi-region resiliency is essential not only for disaster recovery but also for several other critical reasons:

- **Minimizing Downtime and Service Disruptions**: By distributing applications and data across multiple regions, businesses can ensure that if one region experiences an outage, another can take over, thereby minimizing downtime and maintaining service continuity.
- **Ensuring Compliance with Local Regulations**: Different regions may have specific regulatory requirements regarding data storage and processing. Multi-region setups help organizations comply with these local regulations by keeping data within the required geographical boundaries.
- **Reducing Latency**: Serving users from the nearest data center reduces latency, leading to faster response times and a better user experience. This is particularly important for global applications with a diverse user base.
- **Seamless User Experiences Across the Globe**: A multi-region architecture ensures that users have a consistent and seamless experience, regardless of their geographical location. This is achieved by intelligently routing traffic to the nearest or most optimal data center.

In the industry, multi-region resiliency is used to enhance the reliability, performance, and compliance of applications. It is particularly valuable for businesses that operate on a global scale, providing them with the ability to deliver high-quality services to users worldwide while mitigating the risks associated with regional outages and disasters. -->


## Implementing the Reference Architecture

While this reference architecture provides a comprehensive reference, implementing a multi-region architecture requires careful planning and execution:

1. **Assessment**: Evaluate your current architecture and identify resilience requirements. 
2. **Design**: Adapt the reference architecture to your specific needs and constraints.
3. **Development**: Implement necessary changes in your applications to support multi-region deployment.
4. **Testing**: Rigorously test failover scenarios and performance across regions.
5. **Deployment**: Gradually roll out your multi-region architecture, starting with non-critical workloads.
6. **Monitoring**: Continuously monitor and optimize your multi-region setup.

SAP provides various open-source sample projects and architectures, but the ultimate implementation and customization responsibility lies with you, the customer or partner.

## Target Audience

This documentation is intended for:

- Solution Architects
- Developers
- IT Administrators


## Deep Dive

Implementing multi-region setup is a journey that involves understanding, planning, implementation, and continuous improvement. You can find below various concepts, tools and services that were used in the architecture below or directly deep dive into the resources section for the sample implementations.

1. Fundamentals
    - [Single-region resiliency](1-fundamentals/1-single-region-resiliency/readme.md)
    - [Multi-region resiliency](1-fundamentals/2-multi-region-resiliency/readme.md)
3. [Geographic Redundancy](2-geographic-redundancy/readme.md)
4. [Load Balancers](3-loadbalancers/readme.md)
5. [Data Synchronization](4-data-synchronization/readme.md)
6. [Events Synchronization](5-event-synchronization/readme.md)
7. [Control Plane](6-control-plane/readme.md)
8. [Sample Implementations](7-sample-implementations/readme.md)

## Services and Components

- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) 
- [SAP Custom Domain service](https://discovery-center.cloud.sap/serviceCatalog/custom-domain) 
- [SAP Build Work Zone, standard edition](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-standard-edition) 
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region) 
- [SAP Integration Suite, advanced event mesh](https://discovery-center.cloud.sap/serviceCatalog/advanced-event-mesh) 
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) 

## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/btp-services-intelligent-routing)

<!-- ## Related Missions 

- [Route Multi-Region Traffic to SAP BTP Services Intelligently](https://discovery-center.cloud.sap/missiondetail/3603/3646/) -->