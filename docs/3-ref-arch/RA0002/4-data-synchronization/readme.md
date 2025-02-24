---
id: id-ra0002-4
slug: /ref-arch/6c73e3575f/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Data Synchronization
description: Data synchronization in multi-region setups ensures consistency across locations. SAP HANA Cloud with Smart Data Access (SDA) enables efficient data replication and resiliency, providing real-time updates, failover capabilities, and robust data availability across regions.
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
|--------------------|---------------------------------|-----------------------|
| Solution Approach| Manual or using control plane            | in-built       | 
| Initial setup complexity    | High, medium with control plane                     | Low                  | 
| Maintenance complexity | High, but low with control plane       | Low               |
| Data Loss | Unknown   | Low | 
| Multi-Region Replication       | Write-Read                     | Write-Read          | 
| Failover Execution     | Manual / Automated (using control plane)  | Manual and Automatic           | 
| Approximate RTO       | ∼ 10 seconds per table and ~ 30 seconds for DNS refresh  |  ??     | 

<!-- 
## Achieving Multi-Region Resiliency with SDA

**Smart Data Access (SDA)** offers a simpler approach for data synchronization across regions by allowing direct access to remote tables. This eliminates the need for complex setups and additional tools, making SDA an appealing choice for many.

### Steps to Achieve Multi-Region Data Resiliency Using SDA

1. **Initial Setup**
   - Establish a primary SAP HANA Cloud instance in your main region.
   - Set up a secondary SAP HANA Cloud instance in the target region for redundancy.

2. **Creating the Data Source**
   - Create a certificate for remote sources. **[SAP Help: Certificates Creation](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-data-access-guide/import-certificates-for-ssl-connections-to-remote-sources)**
   - Create a Technical User. **[SAP Help: Technical User Creation for SDA](https://help.sap.com/docs/SAP_HANA_PLATFORM/b3ee5778bc2e4a089d3299b82ec762a7/1bd53b25a4e6446c8285f0f5e1af727c.html)**
   - Create the remote source. **[SAP Tutorials: Remote Table Replication - Step 1](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)**
   - Repeat these steps in the other region.

3. **Establish Replication**
   - In the secondary region, create virtual tables. **[SAP Tutorials: Remote Table Replication - Step 2](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)**
   - Create replica tables. **[SAP Tutorials: Remote Table Replication - Step 3](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)**
   - Create a remote table subscription to replicate data from the virtual table to the target table. **[SAP Tutorials: Remote Table Replication - Step 4](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)**
   - Activate the Remote Table Subscription. **[SAP Tutorials: Remote Table Replication - Step 5](https://developers.sap.com/tutorials/hana-cloud-mission-extend-09.html)**
   - This will replicate the data from primary region to the secondary region's tables.

4. **Region Switch on Failover to Secondary Region**

    When the primary region goes down, you need to make the secondary region SAP HANA Cloud database tables as normal tables by removing the subscription.
     - First, deactivate the replication. **[SAP Help: Suspend Remote Table Replication](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-data-access-guide/suspend-remote-table-replication)**
     - Next, drop the subscription. **[SAP Help: Configure Remote Table Replication (Smart Data Access HANA Adapter)](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-data-access-guide/configure-remote-table-replication-with-sda-hana-adapter)**

5. **Switch back from Secondary region to Primary region**
   
  If the primary region is back online, create the subscription again to replicate the data from the primary to the secondary region SAP HANA Cloud database.
 -->

<!-- ## Orchestration with Multi-Region Manager

These steps can be time-consuming and may need to be repeated for multiple tables. Continuous monitoring is also necessary to address any unexpected issues promptly.

To streamline this process, we developed an open-source project called **Multi-Region Manager**, which functions as a control plane to manage the SAP HANA Cloud synchronization, control the failover, and perform other functionalities. Learn more about it here: **[Multi-Region Manager for Orchestration](../RA0002/multi-region-manager)**. -->