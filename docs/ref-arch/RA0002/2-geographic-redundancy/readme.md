---
id: id-ra0002-2
slug: /ref-arch/6c73e3575f/2
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Geographic Redundancy
description: Geographic redundancy ensures continuous service availability by distributing data and resources across multiple locations. It minimizes downtime, enables disaster recovery, and synchronizes critical components across regions for SAP BTP services and applications.
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
sidebar_label: Geographic Redundancy
image: img/logo.svg
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
last_update:
  author: arajsinha
  date: 2025-01-31
---

Geographic redundancy involves distributing data and resources across multiple geographic locations to ensure continuous service availability or for disaster recovery purposes 

![Basic Geographic Redundancy](images/geographic-redundancy.svg?raw=true)

A basic setup of geographic redundancy involves SAP BTP Application or a service subscribed to multiple subaccounts in different regions. These services or applications also need artifacts, data, events, etc., to be synchronized across the regions and often require more sophisticated strategies and additional components.

The following sections provide sample strategies for various SAP BTP services and applications to achieve geographic redundancy which needs to be used based on specific use cases

### SAP Build Work Zone, Standard Edition
This service can be subscribed to in both regions. If one region becomes unavailable, the other region’s Work Zone can handle all requests. However, this setup results in different personalization data in each region’s SAP Build Work Zone, affecting the look and feel. Additionally, users, roles, and business content such as HTML5 applications, Content Providers, and other configurations including Sites, must be synchronized between the two regions to ensure consistency. For more information, refer to the [SAP Build Work Zone documentation](https://help.sap.com/docs/SAP_BUILD_WORK_ZONE).

Various work zone artifacts can be transported across regions using the Transport management service or manually. For more information, refer to [SAP Build Work Zone - Transporting Content](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/transporting-content).

### SAP Integration Suite - Cloud Integration 
Setting up Integration Suite instances in both subaccounts supports multi-region capabilities for simple cloud integration iFlows. However, for more complex iFlows requiring data persistence, the data becomes region-specific and is managed internally by Cloud Integration. Using external data persistence typically requires SAP HANA Cloud, which is region-specific and does not automatically replicate data across regions. An additional solution is needed to manage this. For more details, see the [SAP Integration Suite documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)

### SAP Integration Suite - Advanced Event Mesh
The Advanced Event Mesh DMR clusters can help replicate messages across regions instead of using region-specific JMS queues, which are region bound, but this requires an extra solution to manage the process. Deploying and undeploying iFlows to reestablish event connectivity per region must also be managed. For more details, see the [SAP Integration Suite, Advanced Event Mesh](https://help.sap.com/docs/sap-integration-suite).

### SAP HANA Cloud
SAP HANA Cloud does not natively support data replication across regions. To ensure that applications built on SAP BTP using SAP HANA Cloud DB are multi-region compatible, data must be replicated across different regions. Smart Data Access (SDA) and Remote Table Replication (RTR) can be used to replicate data from one region to another, but a custom solution is required to manage replication topology changes during regional unavailability. For more information, refer to the [SAP HANA Cloud documentation](https://help.sap.com/docs/HANA_CLOUD).

### SAP CAP Applications
Applications built using the SAP Cloud Application Programming Model (CAP) must be deployed in both subaccounts, and SAP HANA Cloud data synchronization between the two subaccounts is required. For more details, see the [SAP CAP documentation](https://cap.cloud.sap/docs/).

While the multi-region architecture is viable for several SAP BTP services, challenges arise when stateful components such as a database or events come into play. Synchronizing these across regions requires numerous steps, adding complexity to the architecture. To simplify this orchestration process, we developed an open-source project called Multi-Region Manager, which functions as a control plane to manage synchronization, to control the failover and for other functionalities. Learn more about this here: [Multi-Region Manager](6)

These examples illustrate only a few of the SAP BTP services, and as new services/applications are need to adapt this architecture, a thorough analysis is necessary to ensure they are compliant with multi-region requirements. The priority and characteristics of each service will dictate the strategies required for achieving robust multi-region setup.