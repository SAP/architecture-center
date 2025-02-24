---
id: id-ra0002-6
slug: /ref-arch/6c73e3575f/6
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Control Plane for Orchestration
description: Multi-Region Manager (MRM) is an open-source CAP-based application that orchestrates multi-region processes like replication topology, failover management, load balancer control, and monitoring. It enables seamless failover between regions, ensuring business continuity and service availability.
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
sidebar_label: Multi-region Control Plane
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

Implementing a multi-region architecture involves multiple complex steps for both SAP BTP services and third-party services, which can quickly become overwhelming. Complexities include:

**Replication Topology Management**: Data replication between SAP HANA Cloud instances in different regions can be achieved using Smart Data Access (SDA) and Remote Table Replication (RTR) which involves executing multiple steps in both the regions. Moreover, SAP Integration Suite’s Advanced Event Mesh requires events/messages replication by maintaining the cluster statuses as either standby or active, depending on the region availability.
- [Data Synchronization](../4-data-synchronization/readme.md)
- [Events Synchronization](../5-event-synchronization/readme.md)

**Load Balancer Configuration**: A load balancer is critical for routing traffic to the healthy region during regional downtimes. The control plane needs to update the load balancer’s configurations to adjust the primary and secondary regions, supporting both automatic and manual failover scenarios.
- [Load Balancers](../3-loadbalancers/readme.md)

**Centralized Monitoring and Logging**: Unified monitoring provides a single portal to oversee data replication status and access logs, facilitating efficient decision-making and quick response times to any issues.

**Service-Specific Adaptations**: Each service may necessitate unique configurations for multi-region compatibility. For example, SAP Cloud Integration flows might require redeployment, while SAP Build Work Zone needs consistent synchronization of business content across regions.
- [Geographic Redundancy](../2-geographic-redundancy/readme.md)

**Failover Management**: In both manual and automated failover scenarios, it is crucial to switch over to a healthy region during an outage. This involves configuring a series of steps to ensure business continuity with minimal disruption.

To address these complex requirements and orchestrate multi-region process, a custom application that acts as a control plane can be developed for orchestration.

### Multi-Region Manager (MRM)

![Multi-Region Manager](images/multi-region-manager.svg?raw=true)

 MRM is an open-source sample CAP-based application that can orchestrate the process of switching between regions. The orchestration process involves changes in replication topology, failover management, load balancer control, centralized monitoring and logging, and service-specific adaptations. It offers both manual and automatic failover options, requiring detailed analysis to choose the appropriate method based on the requirement. It can be deployed in both regions, so if one region is not available, the application could be accessed from the other region to initiate the failover.

- [Multi-Region Manager implementation for SAP Cloud Integration flows](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_stateful_azure).