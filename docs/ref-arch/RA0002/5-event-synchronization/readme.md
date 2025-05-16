---
id: id-ra0002-5
slug: /ref-arch/81805673c0/5
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Events Synchronization
description: >-
  Event synchronization in multi-region setups is enabled by SAP's Advanced
  Event Mesh (AEM) with Dynamic Message Routing (DMR), ensuring real-time,
  resilient, and scalable event processing across regions, maintaining
  continuity and high availability during infrastructure failures.
keywords:
  - sap
  - integration
  - application development
  - ha dr
  - high availability
  - disaster recovery
  - resiliency
  - business continuity
  - failover
  - eda
sidebar_label: Events Synchronization across regions
image: img/ac-soc-med.png
tags:
  - aws
  - azure
  - appdev
  - integration
  - eda
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
  author: arajsinha
  date: 2025-01-31
---

Event-Driven Architectures (EDA) play a crucial role in modern distributed systems by facilitating asynchronous communication between services through events.  SAP offers a robust suite of services to support various EDA use cases, ensuring seamless integration and event processing. Key offerings include [SAP Integration Suite's Event Mesh capability](https://help.sap.com/docs/integration-suite/sap-integration-suite/event-mesh), [SAP Integration Suite's  Advanced Event Mesh (AEM)](https://help.sap.com/docs/sap-integration-suite) and [SAP Event Broker for SAP cloud applications](https://help.sap.com/docs/sap-cloud-application-event-hub), which provide real-time, decoupled messaging capabilities. SAP Integration Suite, Cloud Integration service further extend this by facilitating smooth event-based integrations across different platforms, both SAP and non-SAP.

The SAP Integration Suite's Cloud Integration service further enhances these capabilities by enabling smooth event-based integrations across diverse platforms, whether SAP or non-SAP. Furthermore, SAP's programming models, the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/guides/messaging/event-broker) and [ABAP Restful Programming Model (RAP)](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html) come with built-in functionalities for efficient consumption and production of events. These integrated solutions empower enterprises to implement responsive and scalable event-driven architectures effortlessly, making it easier to adapt to dynamic business requirements.

For more insights on EDA:
- [Martin Fowler's blog on Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html).
- [SAP Learning Journey - Event-Driven Architecture](https://learning.sap.com/learning-journeys/discovering-event-driven-integration-with-sap-integration-suite-advanced-event-mesh/explaining-event-driven-architecture_d02a51bb-1ce4-4c2d-a25d-8b9c9198ffd2)


![drawio](drawio/event-replication.drawio)

While services such as SAP Event Mesh and SAP Event Broker, including JMS queues from SAP Cloud Integration flows, may not offer multi-region resiliency, SAP Integration Suite's Advanced Event Mesh (AEM) excels in this area. AEM provides robust multi-region capabilities, enabling the construction of resilient and geo-distributed event meshes. By utilizing Dynamic Message Routing (DMR), messages can be seamlessly replicated across different regions, ensuring continuous availability and maintaining business continuity even during infrastructure outages. This feature is pivotal for enterprises aiming to achieve high availability and fault tolerance in their event-driven architectures.

### What is Dynamic Message Routing (DMR)?
Dynamic Message Routing (DMR) is the mechanism that powers SAP Advanced Event Mesh by connecting multiple event brokers into a network that dynamically routes event messages in real time. It also boosts the resilience and availability of your messaging infrastructure. If one broker or node goes down, DMR automatically reroutes messages through other brokers in the mesh, minimizing the impact of failures and ensuring business continuity. With DMR, brokers form an event mesh that connects systems within the same site (horizontal scaling) or across different sites (multi-site scaling). 

Here’s how it works:
- **Automatic Routing**: Once the event brokers are connected, DMR automatically determines the best path for routing messages across the mesh. No need for manual configuration or constant maintenance—DMR handles the complexities behind the scenes.
- **Scalability Across Sites**: Instead of relying on a single, over-provisioned broker, you can link multiple brokers together in a mesh. Each broker participates in forwarding events, allowing the system to handle larger traffic volumes while maintaining high performance.
- **Real-Time Event Distribution**: With DMR, messages are routed in real time across regions, ensuring low-latency communication for critical applications, whether they’re in the cloud, on-premises, or at the edge.

DMR plays a critical role in ensuring resilience and disaster recovery by enabling the creation of a geo-distributed event mesh. This event mesh connects multiple event brokers (or nodes) across regions, clouds, or data centers, ensuring that events can continue flowing seamlessly, even during infrastructure outages or regional failures.

- [SAP Advanced Event Mesh - Dynamic Message Routing](https://help.pubsub.em.services.cloud.sap/Features/DMR/DMR-Overview.htm)

### Multi-Region Replication
DMR replication setup has to be configured to enable the replication of messages from one cluster to another. A single instance of Advanced Event Mesh within a subaccount is sufficient to manage clusters across multiple regions, easily configured through the Advanced Event Mesh Admin UI. One cluster operates in active mode while others remain in standby, adapting based on the active region. When downtime is detected, the topology must be updated accordingly. This process can be streamlined using a custom application that functions as a control plane.

- [SAP Advanced Event Mesh - DMR Replication Setup](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_stateful_azure/tutorial/03-SetupAEM)

<!-- ## Regional Limitations and Disaster Recovery

JMS queues are region-specific and do not replicate messages across different regions. This may result in failures of cloud integration flows integrated with JMS queues if the primary region is down. To mitigate downtime and data loss that occur during disasters, SAP offers replication as a solution for disaster recovery using the Advanced Event Mesh service using DMR clusters.

### Advanced Event Mesh Adapter

The Advanced Event Mesh adapter enables the SAP Integration Suite to connect to the SAP Integration Suite, Advanced Event Mesh. Advanced Event Mesh offers extreme scalability and a myriad of sophisticated features. For more details, see [Get Started with SAP Integration Suite, Advanced Event Mesh](https://help.pubsub.em.services.cloud.sap/Get-Started/get-started-lp.htm) and [Advanced Event Mesh Adapter for SAP Integration Suite](https://api.sap.com/package/AdvancedEventMeshAdapterforSAPIntegrationSuite/overview). -->


<!-- ### Steps to Set Up DMR Clusters and Replication for Cloud Integration flows

1. Follow this guide to set up primary and secondary DMR clusters in different regions. This setup replicates events from the Primary Site (replication-active status) to the Backup Site (replication-standby). Refer to the [Replication Setup Guide](https://github.com/SAP-samples/btp-services-intelligent-routing/blob/ci_stateful_azure/tutorial/03-SetupAEM/AEM-Replication-For-Disaster-Recovery_CA.pdf).
2. Configure the SAP Advanced Event Mesh adapter in the cloud integration flows for both regions.
3. When a message/event is sent to the queue, the cloud integration flows in both regions will get triggered. To solve this, the cloud integration flows in the secondary region should be in an undeployed state.
4. The active region’s cloud integration flow should be in a deployed state, and the standby/inactive region’s cloud integration flow should be in an undeployed state. When a switch happens from the active to the standby region, the AEM (Advanced Event Mesh) replication status should be changed to active in the standby region and to standby in the originally active region.
5. Simultaneously, the cloud integration flows should also be deployed in the new active region (previously standby) and undeployed in the new standby region (previously active).
6. This process needs to be repeated whenever there is regional downtime. -->

<!-- ## Orchestration with Multi-Region Manager

These steps can be time-consuming and should ideally be automated. Continuous monitoring is also necessary to address any unexpected issues promptly.

To streamline this process, we developed an open-source project called **Multi-Region Manager**. This tool functions as a control plane to manage SAP Advanced Event Mesh DMR clusters, handle replication, enable deploy/undeploy failover, control failover, and perform other functionalities. Learn more about it here: [Multi-Region Manager for Orchestration](../RA0002/multi-region-manager). -->