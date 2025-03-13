---
# id: 
sidebar_position: 2
sidebar_custom_props: {}
title: Perform a Scoping of Your Integration Styles
description: SAP's integration strategy focuses on creating a seamless, intelligent suite of business applications by integrating end-to-end processes across SAP, partner, and third-party solutions, aiming to accelerate innovation and deliver significant business value. A key component of this strategy is the SAP Integration Solution Advisory Methodology, which provides a comprehensive framework for defining, documenting, and executing enterprise integration strategies, covering both technical and organizational aspects, and can be adapted to various integration technologies and organizational needs.
# slug: 
keywords:
  - sap
  - btp
  - business suite
  - integration
  - solution
  - advisory
  - methodology
image: img/logo.svg
sidebar_label: Perform a Scoping of Your Integration Styles
tags:
  - sapintsoladvmetho
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: PO
  date: 2025-02-24
---

<!-- loio189e05d7319245e0a93f9b6080b5ddb4 -->

Get the second level of integration architecture assessment by selecting integration styles that are relevant for your organization.

***

<a name="loio189e05d7319245e0a93f9b6080b5ddb4__section_d4h_bbb_rwb"/>

## Context

After you have determined relevant integration domains, you take the next step by identifying relevant integration styles. Integration styles represent key integration archetypes, which describe how an integration scenario between a business application and its target is realized.

The current version of the methodology includes five integration styles, which are:

-   Process integration: Connects business processes across business applications and further entities.
-   Data integration: Synchronizes or accesses data across business applications and data sources.
-   Analytics integration: Derives and exposes data from data sources to support business intelligence, augmented analytics and/or enterprise planning scenarios.
-   User integration: Integrates user-centric applications with business applications.
-   Thing integration: Integrates real-world things with business applications.

All integration styles are technology agnostic and are applicable within multiple integration domains.

Cross use pattern can complement an integration style. These build a category for all integration-related use cases that can be combined with one or more of the five core integration styles. For example, “API-managed integration” provides full-lifecycle management for APIs that you can use in user- or process-centric integration scenarios.

  
  
**Overview of Integration Styles**

![](images/loiof4b9b6471d3447a5a09310a55cbef15a_LowRes.png "Overview of Integration Styles")

Each integration style has specific requirements toward integration. The following table provides an overview of decision criteria, which can help you to identify relevant integration styles.

**Integration Styles Decision Criteria**

| |Process integration|Data integration|Analytics integration|User integration|Thing integration|
|---|-------------------|----------------|---------------------|----------------|-----------------|
|Objective|Chaining of business processes|Synchronization of data|Deriving business insights from business applications and data sources|Omni-channel access to back-end applications|Capturing and processing of real-world data|
|Interaction type|System-2-system|System-2-system|System-2-user|User-2-system|Thing-2-system|
|Coupling to application|Process-level|Data-level|Data-level / business-level|User interface level|Thing event|
|Primary trigger|Application event|Schedule or application event|User event|User event|Thing event|
|Urgency of completion|\(Near\) real time|Batch or near real time|\(Near\) real time or batch|\(Near\) real time|\(Near\) real time or batch|
|Unit of data exchange|Single objects|Bulk-data or single objects|From aggregated to line-item data|Single objects or bulk-data|Single objects or bulk-data|
|Specific requirements|-   Transactional integrity
-   Reliable messaging
-   Message orchestration
-   B2B protocol support

|-   Data orchestration
-   Complex transformations
-   Data quality management
-   Big Data processing

|-   Local and remote data sources
-   Data & predictive modeling, planning
-   Data privacy & authentication
-   Data volume

|-   Online / offline support
-   Device management
-   End-user management
-   Application management

|-   Thing management
-   Edge intelligence
-   IoT protocol support
-   Event stream processing

|

Typically an integration architect who has a solid understanding of integration requirements across business applications performs the scoping of integration styles.

***

<a name="loio189e05d7319245e0a93f9b6080b5ddb4__section_efy_wdb_rwb"/>

## Procedure

1.  Templates-based approach

      
      
    **Integration Style Scoping Template**

    ![](images/loio5e98a5dc10544025b50a499d302300d0_LowRes.png "Integration Style Scoping Template")

    Download the "Integration Style Scoping Template" and fill it out as follows:

    -   Specify the relevance of each integration style for your organization.
    -   For every integration style, add the integration technologies, which are currently in use, if existing.

2.  Tool-based approach

    Perform this step using the Integration Assessment capability within SAP Integration Suite. For more information, see: [Integration Styles](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/51ab953548be4459bfe8539ecaeee98d/957de135ee4c4d5d9778355d76760572.html?q=Integration%20Assessment#integration-styles).


.

**Related Information**  


[Download the Integration Style Scoping Template](https://d.dam.sap.com/a/v8XuKfy?rc=10)

