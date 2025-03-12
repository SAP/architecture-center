---
# id: 
sidebar_position: 1
sidebar_custom_props: {}
title: Perform a Scoping of Your Integration Domains
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
sidebar_label: Perform a Scoping of Your Integration Domains
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

<!-- loio3a1b8817a2d7464caddb907262e22e9d -->

Get the first level of integration architecture assessment by selecting integration domains that are relevant for your organization.

***

## Context

You conduct the first level of scoping of your to-be integration architecture with the help of integration domains. Integration domains provide the entry point into the methodology and can be used as a “big picture” for integration. They represent different integration touchpoints of business applications in today’s cloud and hybrid IT landscapes such as business applications, user-centric applications, and real-world objects. Integration domains are defined in a technology agnostic fashion. They can therefore also help in blueprinting a hybrid integration platform, which can consist of integration technologies from different vendors \(SAP/third-party\).

  
  
**Overview of Integration Domains**

![](images/loio424361f9e8044ac296bd210ff25a2afa_LowRes.png "Overview of Integration Domains")

**Current Scope of Integration Domains**

|Integration Domain|Description|
|------------------|-----------|
|Cloud2Cloud|Integration of cloud-based business applications with other cloud-based business applications|
|Cloud2OnPremise|Integration of cloud-based business applications with business applications that are deployed on premises|
|OnPremise2OnPremise|Integration of business applications that are deployed on premises|
|User2Cloud|Integration of cloud-based business applications with user-centric applications|
|User2OnPremise|Integration of business applications that are deployed on premises with user-centric applications|
|Thing2Cloud|Integration of cloud-based business applications with real world objects \(Internet of Things\)|
|Thing2OnPremise|Integration of business applications that are deployed on premises with real world objects \(Internet of Things\)|

> ### Note:  
> Integration domains also cover the opposite direction. Example: The integration domain Cloud2OnPremise is also applicable for integration scenarios sending data from business applications that are deployed on premises to cloud-based business applications.
> 
> Typically an enterprise architect conducts the scoping of integration domains who oversees the entire IT landscape in an organization.

***

## Procedure

1.  Templates-based approach

      
      
    **Integration Domain Scoping Template**

    ![](images/loio212e94b5eaf641aa9c4ccb8819d742b8_LowRes.png "Integration Domain Scoping Template")

    Download this “Integration Domain Scoping Template” and fill it out as follows:

    -   Specify the relevance of each integration domain for your organization.
    -   For every integration domain, which is currently in use, add the integration technologies, if existing.

2.  Tool-based approach

    Perform this step using the Integration Assessment capability within SAP Integration Suite. For more information, see: [Integration Domains](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/51ab953548be4459bfe8539ecaeee98d/957de135ee4c4d5d9778355d76760572.html?q=Integration%20Assessment#integration-domains).


**Related Information**  


[Download the Integration Domain Scoping Template](https://d.dam.sap.com/a/rfnvPVX?rc=10)

