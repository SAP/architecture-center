---
# id: 
sidebar_position: 1
sidebar_custom_props: {}
title: Perform a Technology Mapping
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
sidebar_label: Perform a Technology Mapping
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

<!-- loio58d1656cb23249b4830c49bc3077c454 -->

Define the high-level scope of your hybrid integration platform with the help of a technology mapping.

***

## Context

The scoping results of the first phase of the SAP Integration Solution Advisory Methodology describe the functional requirements toward your organization’s future hybrid integration platform. You perform a technology mapping to relate these functional requirements to corresponding integration technologies from SAP or from other vendors based on their supported capabilities.

  
  
**Technology Mapping**

![](images/loiobe0d9052e0e94857baaa08c79a4e11fe_LowRes.png "Technology Mapping")

In a lot of cases there is no 1:1 mapping between integration use case patterns possible, but an n:m mapping. Therefore, you require more than one integration technology for an integration use case pattern and in turn a lot of integration technologies support more than a single integration use case pattern.

Examples:

-   Integration use case requiring more than one integration technology: For the B2B integration use case some customers leverage a B2B gateway solution, to support the exchange of electronic data interchanges with trading partners, together with an Enterprise Service Bus \(ESB\) to integrate with internal business applications.
-   Integration technology supporting more than one integration use case pattern: An Enterprise Integration Platform as a Service \(EIPaaS\) solution allows you to implement the A2A integration, master data integration, API managed integration and more use case patterns.

***

## Customer Context Factors

When conducting such a technology mapping you need to consider specific context factors, too. These factors influence the decision-making process for integration technologies and are customer-specific. Examples of such customer context factors are the following:

-   Enterprise architecture strategy: This architecture domain determines the overarching IT strategy of an organization. Hence it specifies the boundary conditions for choosing integration technologies.
-   Future application landscape: If your organization pursues a “cloud first” strategy regarding its application landscape then the integration technology landscape should follow this strategy, too.
-   Existing investments: If an organization has already invested in specific integration technologies they often prefer to reuse existing investments for new integration requirements rather than investing in new integration technologies. In such cases you need to carefully evaluate if this solution would really meet future requirements, too.
-   Skillsets: If an organization prefers to outsource parts of their IT related tasks, then naturally the same principle applies for integration related tasks. In such cases a cloud-based integration technology is likely preferred over an integration software that you run on premises.
-   Commercial aspects: Depending on the commercial models with your IT vendors, you may prefer one vendor over the other \(for example, because of existing contracts\).

The technology mapping is typically conducted by an enterprise architect.

For selected integration styles sample technology mappings are available using services of SAP Business Technology Platform. For more information, see [Sample Technology Mappings](1-perform-a-technology-mapping.md).

***

## Procedure

1.  Templates-based approach  
  
**Technology Mapping Template**

    ![](images/loio611524eb33c0414788f079ad8d3d817d_LowRes.png "Technology Mapping Template")

    Download the “Technology Mapping Template” and fill it out as follows:

    1.  Go to the worksheet “Integration Technologies” and maintain the integration technologies in your organization.
    2.  Go to the worksheet “Integration Use Case Patterns” and do the following:
        -   Adapt the list of integration use case patterns in case you’ve modified the SAP delivered ones, like you removed unneeded ones or added custom ones.
        -   Select the integration technology, which you want to use in your organization for each integration use case pattern.


2.  Tool-based approach

    Perform this step using the Integration Assessment capability within SAP Integration Suite. For more information, see: [Review Integration Technology](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/51ab953548be4459bfe8539ecaeee98d/47439ac3bb134d809291dbd52aca7657.html).


***

## Sample Technology Mappings

In the following section you can find sample technology mappings for each selected integration style that uses services of the SAP Business Technology Platform. The sample technology mappings are supposed to describe the high-level building blocks, which can form a hybrid integration platform.

***

## Sample Technology Mapping for the Process Integration Style

SAP Integration Suite is the recommended SAP integration technology for process integration. It is an Enterprise Integration Platform as a Service solution \(EIPaaS\) for cloud and hybrid integration scenarios. For SAP Integration Suite you can discover, test and consume digital content at SAP API Business Hub, such as predefined integration content packages, adapters, APIs, and events for integrating SAP and third-party applications. SAP Integration Suite enables an API-based integration of business applications and supports near real-time processing and transactional process integrity.

Furthermore, you can use the SAP Application Interface Framework as complementing technology: This interface management tool that is embedded in SAP S/4HANA and serves as an add-on to SAP Business Suite and allows business users to monitor interfaces, trigger alerts, and manage errors without IT support.

SAP Integration Suite is comprised of the following capabilities:

|Capability|Description|
|----------|-----------|
|Cloud Integration|Integrate SAP and non-SAP, cloud, and on-premise applications and process messages in real-time scenarios spanning different companies, organizations, or departments within one organization.|
|API Management|Get access to simple, scalable, and secure digital assets through application programming interfaces \(APIs\) and consume these.|
|Open Connectors|Build seamless integrations with over 160 non-SAP applications using prebuilt connectors.|
|Integration Advisor|Accelerate the development of business-oriented interfaces and mappings, generate runtime artifacts quickly, and significantly reduce efforts.|
|Trading Partner Management|Manage B2B relationships with multiple trading partners through this easy-to-use user interface that helps simplify the B2B communication between trading partners.|
|Integration Assessment|Define and execute an enterprise integration strategy based on the SAP Integration Solution Advisory Methodology.|
|Migration Assessment|Assess your existing integration scenarios from SAP Process Orchestration to migrate them to SAP Integration Suite.|

The key characteristics of SAP Integration Suite are as follows:

-   Support of A2A, Master Data, B2B, B2G integration use cases
-   Enables API-based integration and near real-time processing
-   Ensures transactional process integrity

***

## Sample Technology Mapping for the Data Integration Style

SAP Data Intelligence Cloud is SAP’s strategic data management solution and the tool of choice, in particular for cloud and hybrid data integration, metadata management, and data processing needs. It allows you to connect with SAP and third-party data sources. With the help of SAP Data Intelligence Cloud, you can govern, integrate, process, and orchestrate the volume, velocity, and variety of data in on-premise, cloud, multi-cloud, and hybrid distributed system landscapes. The solution is available both as a fully managed public cloud service offering and as a perpetual license product that can be deployed BYOL \(“bring your own license”\) or on-premise.

The core capabilities delivered by SAP Data Intelligence Cloud are as follows:

-   Data integration, which supports data ingestion, data enrichment and data workflows
-   Data processing, which includes exploration, model design, machine learning orchestration
-   Data catalog and metadata management comprising of data discovery, data profiling and metadata cataloging

The key characteristics of SAP Data Intelligence Cloud are as follows:

-   Support of advanced data integration requirements that go beyond traditional ETL scenarios
-   Data focused approach \(tables/views, storages, processing, libraries\)
-   High frequency event processing, for instance via Kafka

You can complement SAP Data Intelligence Cloud with other enterprise information and data management solutions from SAP, if existing. To help customers to protect investments in those products you can integrate these with SAP Data Intelligence Cloud whenever it makes sense from a business and technology standpoint, for example, to establish additional connectivity to new target systems.

***

## Sample Mapping for the Analytics Integration Style

You can enable the integration use case patterns of the analytics integration style with the help of two solutions:

1.  SAP Analytics Cloud: This is an Enterprise Business Intelligence solution that supports business intelligence, planning, and augmented analytics for reporting, simulation, and planning, all augmented by machine learning. It provides connectivity to SAP and third-party systems, and to cloud and on-premise systems through live connections \(online\) or data acquisition \(batch\). For SAP Analytics Cloud predefined industry and lines of business content for analytics and planning scenarios is available.
2.  SAP Datasphere: This solution enables a business data fabric architecture that harmonizes business data across the organization, allowing business experts to make sound decisions. It combines previously discrete capabilities into a unified service for data integration, cataloging, semantic modeling, data warehousing, and virtualizing workloads across SAP and non-SAP data. Customers using SAP Business Warehouse \(BW\) and SAP BW/4HANA can leverage existing investments in these products with the help of SAP BW Bridge capability. With that you can move between 70% and 80% of your existing SAP BW and SAP BW/4HANA artifacts into SAP Datasphere.

The key characteristics covering both solutions can be summarized as follows:

-   Integration of local and remote data sources
-   Model management and data cataloging
-   Predictive and planning capabilities \(available with SAP Analytics Cloud, Enterprise Edition\)

***

## Sample Mapping for the User Integration Style

You can implement the integration use case patterns of the user integration style with the help of the following solutions:

-   SAP Build Work Zone: Its standard edition allows you to create a role-based, personalized business site, which establishes a unified point of access to SAP cloud and on-premise, custom-built, and third-party applications. You can also extend and customize your business site, which as needed \(such as branding, translation, shell plug-ins, domains URL\). Its advanced edition offers additional capabilities for delivering a digital experience solution bringing together business processes with unstructured content \(documents, videos, knowledge bases, etc.\), including enhanced capabilities for content management, web content, team workspaces and integration with third-party solutions.
-   SAP Mobile Start: This is a native mobile application allowing you to access native or web-responsive \(such as SAPUI5\) business apps, data, and information from the SAP Build Work Zone, standard edition.

The key characteristics of both solutions are as follows:

-   Enabling a role-based access, including single-sign on
-   Supporting session management
-   Providing online/offline support \(for mobile only\)

**Related Information**  


[Download the Integration Use Case Pattern Scoping Template](https://d.dam.sap.com/a/MwhUDd4?rc=10)

[SAP Integration Suite](https://help.sap.com/docs/SAP_INTEGRATION_SUITE?locale=en-US)

[SAP API Business Hub](https://api.sap.com/)

[SAP Application Interface Framework](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK_OVERVIEW?locale=en-US)

[SAP Data Intelligence Cloud](https://help.sap.com/docs/SAP_DATA_INTELLIGENCE)

[SAP Analytics Cloud](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD)

[SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE)

[SAP Build Work Zone, standard edition](https://help.sap.com/docs/WZ_STD)

[SAP Build Work Zone, advanced edition](https://help.sap.com/docs/WZ)

