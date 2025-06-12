---
id: id-ra0002-7
slug: /ref-arch/81805673c0/7
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: HA/DR Sample Implementations
description: >-
  Implement HA/DR for SAP services using Azure Traffic Manager and AWS Route 53
  for stateless and stateful multi-region setups.
keywords:
  - sap
  - disaster recovery
  - ha dr solutions
  - azure traffic manager
  - aws route 53
sidebar_label: Sample Implementations
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
  date: 2025-05-12
---

This document presents sample implementations leveraging Microsoft Azure Traffic Manager and AWS Route 53 to achieve high availability and Disaster Recovery for SAP services. These patterns can also be realized using comparable offerings from other hyperscaler load balancers.

## Stateless Scenarios

In stateless scenarios, the applications don’t require replication of data or events across regions. Requests are simply rerouted to an alternative region in case of downtime in the primary region.

### Multi-Region Setup for SAP Cloud Integration
1. **Using Azure Traffic Manager**:
   - **Implementation Overview**: [GitHub Repository](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_azure)

2. **Using Google Cloud Services**: 
   - **Implementation Overview**:  [GitHub Repository](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_gcp)

### Multi-Region Setup for SAP Work Zone, Standard Edition

Achieve HA/DR for the SAP Build Work Zone, Standard Service, a SaaS application managed by SAP, using different load balancers.

1. **Using Azure Traffic Manager**:
   - **Implementation Overview**: [GitHub Repository](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/launchpad_azure)

2. **Using AWS Route 53**:
   - **Implementation Overview**: [GitHub Repository](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/launchpad_aws)

## Stateful Scenario

Stateful scenarios necessitate the replication of data and events across regions to maintain consistency and availability. This section covers the use of SAP HANA Cloud, SAP Advanced Event Mesh, and Azure Traffic Manager to ensure multi-region DR for SAP Cloud Integration flows.

### Multi-Region Disaster Recovery for SAP Cloud Integration

Implement a stateful setup that requires data replication for internal state storage and document storage, utilizing SAP HANA Cloud, SAP Advanced Event Mesh, and Azure Traffic Manager. Also, replace regional JMS queues with SAP Advanced Event Mesh for disaster recovery.

- **Implementation Overview**: [GitHub Repository](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_stateful_azure)