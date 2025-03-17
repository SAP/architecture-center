---
id: id-ra0002-4
slug: /ref-arch/6c73e3575f/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Data Synchronization
description: >-
  Data synchronization in multi-region setups ensures consistency across
  locations. SAP HANA Cloud with Smart Data Access (SDA) enables efficient data
  replication and resiliency, providing real-time updates, failover
  capabilities, and robust data availability across regions.
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
sidebar_label: Data Synchronization across regions
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

In a multi-region setup, data synchronization is a critical aspect that ensures consistency and availability across different geographic locations. It involves replicating databases, files, configuration settings, and other pertinent information to multiple regions, which demands sophisticated strategies and robust tools. Additionally, regulatory compliance, data sovereignty laws, and other legal considerations play a pivotal role in shaping data synchronization strategies within a multi-region architecture.

![SAP HANA Cloud](images/data-replication.svg?raw=true)

SAP recommends using SAP HANA Cloud that provides built-in Disaster Recovery (DR) and High Availability (HA) capabilities, using availability zones, provide robust data resiliency within a single region. This ensures that operations can continue seamlessly even if one availability zone experiences an outage. However, for multi-region data resiliency and availability, enterprises often require redundancy that spans multiple geographic regions. This requires setting up SAP HANA Cloud in multiple regions and synchronizing data across different regions using **Smart Data Integration (SDI)** or **Smart Data Access (SDA)**.

### Smart Data Integration (SDI)

**Smart Data Integration (SDI)** offers advanced data transformation and real-time replication capabilities. It is suitable for scenarios where complex data transformations are required before data is synchronized across regions. SDI involves setting up additional tools and configurations, making it a more complex solution compared to SDA. However, its robust features make it ideal for enterprises needing detailed control over their data synchronization processes.

- [SAP Help: Smart Data Integration](https://help.sap.com/docs/HANA_SMART_DATA_INTEGRATION/018757bb7f5c4700a8840976c8730f34/9de79dee4ddb40aa9c8004e9873a9ebb.html)

### Smart Data Access (SDA)

**Smart Data Access (SDA)** provides a simpler approach for data synchronization by allowing direct access to remote tables. This method eliminates the need for complex setups and additional tools, making SDA an appealing choice for many enterprises looking for straightforward multi-region data synchronization.

- [SAP Help: Smart Data Access](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-data-access-guide/creating-remote-sources-smart-data-access)
- [SAP Tutorials: SDA Replication](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)

Given its simplicity and effectiveness, this architecture will focus on achieving multi-region data resiliency using Smart Data Access (SDA).

### Multi-Region Replication

For SAP HANA cloud multi-region synchronization, SDA must be active in the secondary region by replicating data from primary to secondary. In this setup, primary is write-enabled while the secondary remains read-only. When the primary region experiences failure, the replication topology has to be changed from primary to secondary. As this process requires a series of steps that needed to be executed based on the region switch, and to simplify this a custom application can be developed that can act as a control plane.

### Hyperscaler Services (Alternatives)

There are also other ways to achieve data synchronization across geographic regions using globally distributed databases like AWS Aurora, Google AlloyDB, Azure Cosmos DB etc.,

### Comparative Analysis
This comparative assessment provides valuable insights to assist decision-makers in developing resilient and efficient distributed systems equipped with strong state replication capabilities across geographical regions.

|                    | SAP HANA Cloud with SDA             | Hyperscaler global databases |
|