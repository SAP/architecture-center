---
id: id-ra0002-1-1
slug: /ref-arch/6c73e3575f/1/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Single-region resiliency
description: This guide explains single-region resiliency for SAP BTP using Availability Zones (AZs), ensuring high availability, low-latency replication, and failover within a region. While reliable, Multi-AZ setups are vulnerable to region-wide outages and may not meet global performance or compliance needs.
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
sidebar_label: Single-region resiliency
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

Before diving into multi-region architectures, let's understand how single region resiliency is provided for SAP BTP using Availability Zones.

### What is an Availability Zone?

![drawio](drawio/multi-az.drawio)

An Availability Zone is a physically separate data center within a cloud provider's region. Each AZ has independent power, cooling, and networking to ensure that failures in one AZ do not affect others. AZs are connected through high-speed, low-latency networks, allowing for synchronous data replication and seamless failover.

### Examples of SAP BTP Services Implementing Multi-AZ

1. **SAP HANA Cloud**: Utilizes Multi-AZ deployments to ensure database availability and resilience. Data is synchronously replicated across AZs to prevent data loss and provide quick recovery.
2. **SAP Integration Suite**: Deployed across multiple AZs to maintain service continuity and high availability. If one AZ fails, the service can continue to operate from another AZ without interruption.
3. **SAP Business Technology Platform (BTP) Services**: Many core services, such as SAP Cloud Platform Integration and SAP WorkZone, standard edition, are designed to leverage Multi-AZ architecture to enhance reliability and performance within a region.

By deploying services across multiple AZs, SAP BTP ensures that applications remain available and performant, even in the face of hardware failures or other localized issues.

### Benefits of Multi-AZ:

1. **High Availability**: In the event of hardware failures in one AZ, other AZs can seamlessly take over, ensuring uninterrupted service availability.
2. **Low-Latency Interconnects**: AZs within the same region are linked by high-speed, low-latency networks, facilitating rapid data transfer and communication.
3. **Efficient Data Replication**: The close proximity of AZs allows for synchronous data replication, minimizing the risk of data loss and ensuring data consistency.
4. **Unified Compliance**: All AZs within a region adhere to the same regulatory standards, simplifying compliance management and ensuring consistent adherence to regional laws.

### Limitations of Multi-AZ:

1. **Susceptibility to Regional Failures**: While Multi-AZ architecture provides high availability within a region, it remains vulnerable to region-wide disruptions such as natural disasters or significant outages that can impact all AZs in the region.
2. **Geographic Limitations**: Multi-AZ deployments are confined to a single region, which may not deliver optimal performance for users distributed globally due to increased latency and potential network bottlenecks.
3. **Compliance Challenges**: Certain regulatory requirements mandate data storage and processing within specific geographic boundaries. Multi-AZ architecture, being region-centric, may not fully address these compliance needs, particularly for disaster recovery (DR) scenarios.
