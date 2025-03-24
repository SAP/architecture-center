---
# id: 
sidebar_position: 4
sidebar_custom_props: {}
title: Catalog of Integration Use-Case Patterns
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
sidebar_label: Catalog of Integration Use-Case Patterns
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

<!-- loio712c94c249d54894ba4e33f5d5bbfeab -->

The SAP Integration Solution Advisory Methodology includes a catalog of predefined integration use-case patterns, which can be adapted according to your needs.

***

## Description

The integration usecase patterns are grouped along integration styles and the cross-use case patterns form their own group.

For each pattern of this catalog, a description, illustration, and examples in an SAP business application context are available. There are two different types of examples:

-   Predefined by SAP: These integration examples are delivered by SAP, like predefined integration scenarios as part of SAP solutions or integration content packages, which you can find at SAP API Business Hub.
-   Defined by customers or partners: These are custom integration examples, which are configured and implemented by customers or partners.

***

## Integration Use-Case Patterns of the Process Integration Style

The process integration style foresees four integration use-case patterns describing various needs of connecting business processes across business applications and other involved entities.

***

## A2A Integration

The application to application \(A2A\) integration use-case pattern allows you to implement a message-based exchange of transactional data along internal company processes by connecting involved business applications. Transactional data is about ongoing business activities such as physical goods movement or sales order documents. This transactional data is typically exchanged in a \(near-\) real-time fashion across involved business applications using an integration technology.

  
  
**Application to Application Integration Use-Case Pattern**

![](images/loio6af314905faa43228341d3f26bac53f4_LowRes.png "Application to Application Integration
					Use-Case
					Pattern")

Examples of A2A integration use-case patterns in an SAP context, which are predefined by SAP:

-   Exchange sales orders between SAP Customer Experience solutions and SAP S/4HANA as part of the Lead to Cash process for cloud deployment. For more information, see[Transactional Data Flow](https://api.sap.com/dfd/LC1C1-DFDTransactionalDataFlows).
-   Transfer purchase requisitions for materials that have no source of supply between SAP Ariba Sourcing and SAP S/4HANA as part of the Source to Pay process for hybrid deployment. For more information, see: [Transactional Data Flows](https://api.sap.com/dfd/SP1H1-DFDTransactionalDataFlows).
-   Replicate service entry sheets or timesheets from SAP Fieldglass Vendor Management System to SAP S/4HANA as part of the External Workforce process for hybrid deployment. For more information, see: [Transactional Data Flows](https://api.sap.com/dfd/EW1H2-DFDTransactionalDataFlows).

***

## Master Data Integration

With the help of the master data integration use-case pattern, you can share master data objects across connected business applications. Master data is basic data about business-relevant objects that is required in different contexts, such as materials or business partners. To ensure data consistency the master data is synchronized across connected business applications in \(near-\) real-time fashion using APIs.

  
  
**Master Data Integration Use-Case Pattern**

![](images/loio01e3c6b5faf34287823028ca3b90a7a1_LowRes.png "Master Data
					Integration
					Use-Case Pattern")

Examples of the master data integration use-case pattern in an SAP context, which are predefined by SAP:

-   Synchronization of the workforce person master data object between SAP S/4HANA Cloud and SAP SuccessFactors HXM Suite as part of the Hire to Retire process for cloud deployment. For more information, see: [Data Flows for HR Data](https://api.sap.com/dfd/HR1C1-DFDDataFlowsforHRData).
-   Synchronization of the cost center master data object as part of the Source to Pay process for hybrid deployment. For more information, see: [Master Data Flow](https://hub.sap.com/dfd/SP1H1-DFDMasterDataFlows).
-   Synchronization of the customer master data object as part of the Lead to Cash process for cloud deployment. For more information, see: [Master Data Flow for Business Partner Customer](https://api.sap.com/dfd/LC1C1-DFDMasterDataFlowforBusinessPartnerCustomer).

***

## B2B Integration

Using the business to business \(B2B\) integration use-case pattern you can electronically exchange business documents with other organizations. It allows you to extend your business processes beyond your organization’s boundaries to include your business partners such as customers and suppliers. For enabling an electronic data exchange with those business partners, you first need to align with them on common B2B standards, which includes document types, transport protocols, partner identification, security features and more.

  
  
**Business to Business Integration Use-Case Pattern**

![](images/loiofc7a0f7f464641c49dde07c873cea30d_LowRes.png "Business to Business
					Integration
					Use-Case Pattern")

Examples of the B2B integration use-case pattern in an SAP context, which are custom-defined :

-   Receive bank statements per Electronic Data Interchange \(EDI\) in SAP S/4HANA. For more information, see: [Receiving a Bank Statement per EDI](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/3cb1182b4a184bdd93f8d62e3f1f0741/4e0c465034272287e10000000a15822b.html?version=2022.001).
-   Send out shipment documents per EDI to inform the customer about the upcoming shipment \(shipment notification\) using SAP S/4HANA. For more information, see: [Outbound EDI Messages](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/eff06b275ea640c4a827fc099df3b4aa/c695c95360267214e10000000a174cb4.html).
-   Receive just-in-time delivery calls by manufacturers of the automotive industry using SAP S/4HANA using EDI. For more information, see: [JIT Inbound](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f340785101c548c9beeda9284efd18a0/07d5c353b677b44ce10000000a174cb4.html).

***

## B2G Integration

In many countries or regions organizations need to comply with local requirements mandating the submission of electronic documents to authorities or business partners. For this purpose, the business to government \(B2G\) integration use-case pattern allows you to exchange electronic documents, such as invoices, summaries, or transport registrations that conform to legally required data formats and security standards as mandated by the respective authority. You exchange these electronic documents with external systems, for example with business partners' systems with or without the authorities being involved in the process.

  
  
**Business to Government Integration Use-Case Pattern**

![](images/loiobea6d1afa8ad46ebb2d469f04a3743fa_LowRes.png "Business to Government
					Integration
					Use-Case Pattern")

Examples of the B2G integration use-case pattern in an SAP context, which are predefined by SAP:

-   Send electronic invoices, which include a generated Invoice Reference Number \(IRN\) from SAP S/4HANA to the Goods and Services Tax \(GST\) Suvidha Provider as per the legal compliance in India. For more information, see: [SAP ERP Integration with GST Suvidha Provider for India e-Invoice](https://api.sap.com/package/SAPeInvoiceIndia/overview).
-   Exchange electronic documents created in SAP Document and Reporting Compliance from SAP S/4HANA Cloud with the Spanish tax agency's system Suministro Inmediato de Informacion del IVA \(SII\). For more information, see:[SAP Document and Reporting Compliance: Electronic Tax Register Books for Spain](https://api.sap.com/package/eDocumentVATRegisterBooksforSpain/overview).
-   Transfer German tax-specific notifications for sales tax summary reports \(UsTVA\) from SAP S/4HANA Cloud to German authorities using mandatory message security settings \(ERiC libraris\). For more information, see: [SAP Finance Applications Integration with ELSTER](https://api.sap.com/package/SAPFIIntegrationwithELSTERERiCforGermany/overview).

***

## Integration Use-Case Patterns of the Data Integration Style

The data integration style foresees four integration use-case patterns describing different approaches for synchronizing or accessing data across business applications and data sources.

***

## Data Replication \(ETL\)

With the help of the data replication use-case pattern, you can copy data from one database to another, using only changed data, which is replicated into a secondary database. This can also follow the steps of an extract, transform, load \(ETL\) process, which is comprised of the following steps:

-   Extract: Data is moved from a source system to a temporary staging data repository where it is cleaned, and its quality assured.
-   Transform: Data is structured and converted to match the target source.
-   Load: The structured data is loaded into a data warehouse or some other storage entity.

  
  
**Data Replication \(ETL\) Integration Use-Case Pattern**

![](images/loioa80cb024c571407b88a165bc5644c931_LowRes.png "Data Replication (ETL)
					Integration
					Use-Case Pattern")

Examples of the data replication use-case pattern in an SAP context, which are predefined by SAP:

-   Integrate SAP Integrated Business Planning for Supply Chain solution with different SAP and third party solutions for different purposes, for example, so that data such as master data and transactional data can be exchanged. For more information, see: [Data Integration Scenarios](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/da797ae2bf6246d58abd417f24915d55/0d507124752549d1aee1eb36388a3934.html?locale=en-US).
-   Replicate shop orders from SAP Digital Manufacturing to SAP Manufacturing Execution. For more information, see: [Integrating SAP Manufacturing Execution On-Premise to Resource Orchestration \(Inbound\)](https://help.sap.com/docs/sap-digital-manufacturing/integration-guide/integrating-sap-manufacturing-execution-on-premise-to-resource-orchestration-inbound).
-   Replicate business data to SAP Document and Reporting Compliance service. For more information, see: [Data Replication](https://help.sap.com/docs/SLH_advanced_compliance_reporting_service/7a60944343e543a1ab99e9b2904dab09/5948cdb8ac7e410d800c285c1ed3e506.html?locale=en-US).

***

## Data Virtualization

By creating a virtual abstraction layer, data virtualization offers a single view of all data that resides in a database. The data virtualization use-case pattern enables real-time access to data regardless of its location, source system, or type. It uses a data services layer to integrate data and content from heterogeneous sources on demand. This integration can happen in real time or near-real time, in a stream or a batch – supporting a wide range of business processes.

  
  
**Data Virtualization Integration Use-Case Pattern**

![](images/loioba4954e813c4491b8c65894af1ff21a0_LowRes.png "Data Virtualization
					Integration
					Use-Case Pattern")

Examples of the data virtualization use-case pattern in an SAP context, which are custom defined by SAP customers or partners:

-   Look up shared master data from various data sources, such as virtual data access in SAP HANA to remote data sources.
-   Create virtual tables in SAP HANA that point to tables in remote sources without replicating the data into SAP HANA, for example, directly accessing data from other databases or Hadoop® clusters in the Hadoop® Distributed File System \(HDFS\) and caching data there.
-   Run queries on combined data sources in real time, including DML \(Data Manipulating Language\) queries such as SQL \(Structured Query Language\), with updates being written back to the remote source.

***

## Data Quality Management

The data quality management integration use-case pattern helps you to integrate data from multiple sources for cleansing, matching, and consolidation \(central business terms\). The data quality process also include correction, standardization, and duplicate matching steps.

  
  
**Data Quality Management Integration Use-Case Pattern**

![](images/loiocf79e2b2c3a54d0ea54d28ff7d016827_LowRes.png "Data Quality Management
					Integration
					Use-Case Pattern")

Examples of the data quality management integration use-case pattern in an SAP context, which are predefined by SAP:

-   Automatic cleansing of address data when the user saves the record or chooses to check the address in SAP S/4HANA. For more information, see: [Postal Address Validation](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0914a2ad702f45bdb22af0c4f06d8d5b/27c2aa09d63342128c28dbe844c35d7a.html).
-   Person and organization name cleansing in SAP S/4HANA, which standardizes various components related to a person's or organization’s name. For more information, see: [Data Quality Management](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/029944e4a3b74446a9099e8971c752b9/39cb8dc15fbd4b4dabffe30a5b669166.html).
-   Validation of employee and employee’s dependents address in SAP SuccessFactors Employee Central. For more information, see: [Implementing Address Validation Service](https://help.sap.com/docs/SAP_SUCCESSFACTORS_EMPLOYEE_CENTRAL/a4776e2c28af4204bdd0543db7dccd0e/a21437912f364c2bb1811b55563fd450.html).

***

## Data Orchestration

The data orchestration integration use-case pattern extends data integration: It combines data discovery, preparation, integration, processing, and the connection of data across multiple and complex landscapes. Data orchestration follows a pipeline-driven data integration approach for disparate kinds of data supporting also distributed processing.

  
  
**Data Orchestration Integration Use-Case Pattern**

![](images/loio95a4d2927c7947809315a97346260402_LowRes.png "Data Orchestration
					Integration
					Use-Case Pattern")

Examples of the data orchestration use-case pattern in an SAP context, which are custom defined by SAP customers or partners:

-   Optimize inventory management by creating a parameterized replenishment policy to optimally balance materials that are in supply or on stock. It orchestrates data from various SAP and third-party data sources such as warranty data, demand forecast, and component order strategy to determine the best order point for common components.
-   Determine best fitting job candidates in SAP SuccessFactors for a specific location by orchestrating data from SAP and third-party solutions.
-   Achieve total capital management through financial data consolidation from SAP and third-party solutions, including data matching and advanced customer analytics.

***

## Integration Use-Case Patterns of the Analytics Integration Style

The analytics integration style foresees two integration use-case patterns for enabling analytical queries and insights along business applications.

***

## Embedded Analytics

With this integration use-case pattern, analytical content such as charts and key performance indicator \(KPI\) reports are embedded in a business application, integrating both on the level of data and user interfaces.

  
  
**Embedded Analytics Integration Use-Case Pattern**

![](images/loiob8d1f20425114eddac7d3c9c7ea5d01d_LowRes.png "Embedded Analytics
					Integration
					Use-Case Pattern")

Examples of the embedded analytics integration use-case pattern in an SAP context, which are predefined by SAP:

-   Order to Cash Dashboard that is embedded SAP S/4HANA Cloud allows sales managers to analyze key figures using predefined charts. For more information, see: [Order to Cash Dashboard](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/9afe5824a6dd4de0a80c82fbd7ad5dc2.html?locale=en-US).
-   People Analytics in SAP SuccessFactors allowing you to leverage predefined stories for compensation, employment, recruiting, time management and more, including option to define custom stories. For more information, see: [Template Stories in People Analytics](https://help.sap.com/docs/SAP_SUCCESSFACTORS_PEOPLE_ANALYTICS/f1cbadf36a8d450fb2cb4324f9d56607/f7876e08ffd347078e5e1b149693bdd9.html?locale=en-US).
-   Embedded analytics in SAP Digital Manufacturing delivering Operational reports to production supervisor, line manager, or plant manager, to monitor and analyze the production processes and derive insights from them. For more information, see: [Operational Analytics](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/3cb1182b4a184bdd93f8d62e3f1f0741/4e0c465034272287e10000000a15822b.html?version=2022.001).

***

## Cross Application Analytics

With the help of this integration use-case pattern you can combine data of several source systems using an analytics or data warehouse solution. On top of the combined data, you can build an analytic consumption model to enable \(cross application\) reporting.

  
  
**Cross Application Analytics Integration Use-Case Pattern**

![](images/loio9f7502e7b3634d679989537f03c49b18_LowRes.png "Cross Application Analytics
					Integration
					Use-Case Pattern")

Examples of the embedded analytics integration use-case pattern in an SAP context, which are predefined by SAP:

-   Financial Analytics Dashboard enables a workforce performance analysis that is based on a cross-application data model and combines financial information from SAP S/4HANA Cloud and HR information from SAP SuccessFactors. For more information, see: [Financial Analytics Dashboard for SAP Analytics Cloud](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/42093f14b43c485fbe3adbbe81eff6c8/2508935eb8114b829933c222a6977929.html).

***

## Integration Use-Case Patterns of the User Integration Style

The user integration style foresees three integration use-case patterns. These allow users to access data from one or more business applications through different user interfaces \(UI\), such as web-based user interfaces, mobile applications, or chat.

***

## UI Integration

With the help of the UI integration use-case pattern, you can integrate the user interface of multiple business applications into a single point of entry including the consumption of back-end application services in a web user interface.

  
  
**User Interface Integration Use-Case Pattern**

![](images/loio0a7901e489714168877efd8554b190d4_LowRes.png "User Interface
					Integration
					Use-Case Pattern")

Examples of the UI integration use-case pattern in an SAP context, which are predefined by SAP or custom defined by SAP customers or partners:

-   Federate content from SAP business applications such as SAP S/4HANA Cloud, SAP S/4HANA \(on-premise\), SAP Integrated Business Planning for Supply Chain and option to integrate custom-build, and third-party applications into a point of access. For more information, see: [What Is SAP Build Work Zone, standard edition?](https://help.sap.com/docs/WZ_STD/8c8e1958338140699bd4811b37b82ece/9db48fa44f7e4c62a01bc74c82e74e07.html?locale=en-US)
-   Leverage human resource-focused templatized content in SAP SuccessFactors HXM Suite offering teams and departments guided experiences that integrate with different products. For more information, see: [What Is SAP SuccessFactors Work Zone](https://help.sap.com/docs/WZ_STD/8c8e1958338140699bd4811b37b82ece/9db48fa44f7e4c62a01bc74c82e74e07.html?locale=en-US).
-   Enable a digital workplace by allowing business users to build and publish content, integrate unstructured content \(such as documents, videos\), apply predefined SAP content and integrate data from third-party applications. For more information, see: [What Is SAP Build Work Zone, advanced edition?](https://help.sap.com/docs/WZ/b03c84105ff74f809631e494bd612e83/5c0103b130de411fb2a4b5416e36d767.html?locale=en-US)

***

## Mobile Integration

The mobile integration use-case pattern enables the consumption of back-end application services in a mobile application, using native or hybrid device capabilities including offline data synchronization.

  
  
**Mobile Integration Use-Case Pattern**

![](images/loio68da931535114442ade72debc0e0b5af_LowRes.png "Mobile
					Integration
					Use-Case Pattern")

Examples of the mobile integration use-case pattern in an SAP context, which are predefined by SAP:

-   Enable a mobile entry point to SAP business applications such as SAP S/4HANA, SAP SuccessFactors, SAP Ariba solutions for iOS and unified Android devices allowing access to native or web-responsive \(such as SAPUI5\) business apps, data, and information. For more information, see: [SAP Mobile Start](https://help.sap.com/docs/SAP_MOBILE_START?locale=en-US).

***

## Chatbot Integration

This integration use-case pattern integrates chatbots into various communication channels including integration with business applications to trigger a transaction or retrieve further information.

  
  
**Chatbot Integration Use-Case Pattern**

![](images/loioe24a460bdcab46989df5162f00469180_LowRes.png "Chatbot
					Integration
					Use-Case Pattern")

***

## Integration Use-Case Patterns of the Thing Integration Style

The thing integration style is comprised of of four integration use-case patterns, which allows you to connect real world objects \(such as sensor equipped machines or devices\) with business applications and data sources.

***

## Thing to Analytics

The thing to analytics integration use-case pattern supports the real-time integration of IoT data from machines or devices with analytical solutions. As a result, you can gain insights about the time series data recorded by sensors with the help of graphics and visualizations.

  
  
**Thing to Analytics Integration Use-Case Pattern**

![](images/loio25dda58633b8446f9f1a940a4c43dcd1_LowRes.png "Thing to Analytics
					Integration
					Use-Case Pattern")

Examples of the thing to analytics integration use-case pattern in an SAP context that are predefined by SAP:

-   Connect SAP Warehouse Insights with an IoT platform to receive positioning information from IoT devices about to visualize the resource indoor positioning on the warehouse layout, monitor the status of resources or view geofences and geofence alerts. For more information, see: [Administration Guide for SAP Warehouse Insights](https://help.sap.com/docs/SAP_WAREHOUSE_INSIGHTS/28e81b7906c746f08d562e273a0f58d3/a09195c9f1ec4562942f72cb22f3f6f5.html).
-   Bring together OT data \(operational equipment sensor data\) and IT data \(business data\) by using SAP Predictive Asset Insights. It also applies analysis methods such as analytics and data mining to create insights that can be used to optimize business in areas such as maintenance, production, after-sales service, and procurement. For more information, see: [SAP Predictive Asset Insights](https://help.sap.com/docs/SAP_PREDICTIVE_ASSET_INSIGHTS?locale=en-US).

***

## Thing to Process

With the help of the thing to process integration use-case pattern you can exchange data from physical objects for triggering a process step within a business application.

  
  
**Thing to Process Integration Use-Case Pattern**

![](images/loiofb3b15533e7d4a07906038145ea6843e_LowRes.png "Thing to Process
					Integration
					Use-Case Pattern")

Examples of the thing to process integration use-case pattern in an SAP context that are predefined by SAP:

-   Connect SAP Digital Manufacturing to the shop floor to retrieve machine data for analytics and run production processes. For more information, see: [Shopfloor Integration](https://help.sap.com/docs/SAP_DIGITAL_MANUFACTURING/c86ca4026fae4cb3ba66ed751866175b/b39c43da65b94106a01c9d01ec81f23c.html?locale=en-US).
-   Integrate SAP Warehouse Robotics with physical robots to move handling units from source storage bins to destination storage bins in a warehouse. For more information, see: [Integration Services for SAP Warehouse Robotics](https://help.sap.com/docs/WAREHOUSE_ROBOTICS/17f1b82db1bc44e2b42097afae9b016a/8f7724109f5c4aaf82af86fffe503e33.html?locale=en-US).

***

## Thing to Data Lake

This integration use-case pattern enables the collection of thing or machine data such as time series data. Next this data is stored in a data lake to derive future value out of it, for instance by applying machine learning, predictive analytics, data discovery and profiling algorithms.

  
  
**Thing to Data Lake Integration Use-Case Pattern**

![](images/loio398f6c4c8e844f14b9d496db08853ab8_LowRes.png "Thing to Data Lake
					Integration
					Use-Case Pattern")

Examples of the thing to data lake integration use-case pattern in an SAP context that are custom-defined by SAP customers or partners:

-   Ingest time series data from sensor equipped assets in a data lake to predict equipment malfunctions with the help of predictive analytics.
-   Ingest time series data from sensor equipped manufacturing lines in a data lake to optimize the production process with the help of machine learning algorithms.

***

## Thing to Thing

This integration use-case pattern enables machine-to-machine integration scenarios where devices, robots, or similar can communicate with each other with the help of sensors and industrial standards such as the MQTT \(MQ telemetry transport\) protocol.

  
  
**Thing to Thing Integration Use-Case Pattern**

![](images/loio7449e586a69d4a30b6b45ab59379dc94_LowRes.png "Thing to Thing
					Integration
					Use-Case Pattern")

Examples of the thing to thing integration use-case pattern in an SAP context, which are predefined by SAP:

-   Integrate industry-specific standard data sources of different manufacturers, for example, process control systems, plant Historian systems with other internal or external data sources using standard protocols for machine-to-machine communication. For more information, see: [SAP Plant Connectivity](https://help.sap.com/docs/SAP_PLANT_CONNECTIVITY/c90214be0d934ebdb6f3bce29c63c0ff/46a00344d44852b7e10000000a155369.html).
-   Establish machine-to-machine communication in SAP S/4HANA Manufacturing for production engineering and operation for supporting automation scenarios such as start and complete, component assembly, and collection of inspection data from smart tools or testing equipment. For more information, see: [Integration with Smart Tools and Machines](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9c4986bda35f4840ae438960ffbef64d/f2b97219f37e4ba9b1df6a282a1c7fbc.html?locale=en-US).

***

## Cross Use-Case Patterns

Cross use-case patterns can complement one or more integration styles. The current version of the SAP Integration Solution Advisory Methodology foresees five cross use cases.

***

## API-Managed Integration

API-managed integration allows you to provide omni-channel and secure access to business applications that can also hide the complexity of underlying heterogeneous landscapes. With the help of API-managed integration you can enforce usage policies for APIs, controlling API access, analyzing usage data and more.

  
  
**API-Managed Integration Use-Case Pattern**

![](images/loio502b499b943348fb892616ee018b1795_LowRes.png "API-Managed
					Integration
					Use-Case Pattern")

Examples of the API-managed integration use-case pattern in an SAP context, which are custom defined by SAP customers or partners:

-   Exchange business data with customers and partners with the help of secured and protected APIs.
-   Meter the consumption of APIs as part of integration scenarios for internal cost accounting purposes.
-   Modernize legacy interfaces by standardizing protocol, access, and authorization concepts.

***

## Event-Driven Integration

With the help of the event-driven integration use-case pattern you can implement a loosely coupled integration of business applications and extensions, which is based on events. An event represents a significant change in state of a \(business\) object. Whenever such a change occurs the event source publishes this information as event to an event infrastructure. These are intermediaries that broker and manage events. Event consumers are software components that subscribe to the event infrastructure to be informed about events.

  
  
**Event-Based Integration Use-Case Pattern**

![](images/loioeed331a36ac34016ab3263851db223df_LowRes.png "Event-Based
					Integration
					Use-Case Pattern")

Examples of the events-driven integration use-case pattern in an SAP context, which are custom defined by SAP customers or partners:

-   Inform remote systems about created, changed, and deleted customer returns in SAP S/4HANA through business events. For more information, see: [Customer Return Events](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/3dd99b16b239476ca4764f8837ec95c9.html?locale=en-US).
-   Publish bill events from SAP Subscription Billing in order to inform event consumers about the lifecycle of a bill, such as when the bill was opened or closed, or becomes due. For more information, see: [Bill Events](https://help.sap.com/docs/CLOUD_TO_CASH_OD/987aec876092428f88162e438acf80d6/0df020a9c37d4bf6b786ee106d9c193d.html?locale=en-US).
-   Inform remote systems when a freight booking is created, changed, or cancelled in SAP S/4HANA. This information can be used to reserve freight space on a ship or airplane and to track the actual execution. For more information, see: [Freight Booking](https://help.sap.com/docs/SAP_S4HANA_CLOUD/588780cab2774a7ab9fffca3a7f919fe/7d9ea32445a84e7ca22e8ff6b6e6a032.html?profile=20025561&locale=en-US).

***

## Stream Analytics

When applying the stream analytics use-case pattern you can process streams of incoming event data in real time, and collect and act on incoming information.

  
  
**Stream Analytics Integration Use-Case Pattern**

![](images/loio323e6b8b0b4e477d83024c8c2a76ea43_LowRes.png "Stream Analytics
					Integration
					Use-Case Pattern")

Examples of the stream analytics use-case pattern in an SAP context, which are custom-defined by SAP customers or partners:

-   Detect and prevent fraud by analyzing credit card transactions of payments in SAP S/4HANA.
-   Target marketing offers to customers based on context from SAP Emarsys Customer Engagement.
-   Monitor click streams on Web sites for optimizing user experience in context of SAP Commerce Cloud, context-driven services.

***

## Process Automation

This cross-use case pattern lets you automate workflow processes and tasks across business applications, office software and more with the help of workflows, bots, and connectors.

  
  
**Process Automation Integration Use-Case Pattern**

![](images/loio37ee9d27d1c5476998956d393e910b89_LowRes.png "Process Automation
					Integration
					Use-Case Pattern")

Examples of the process automation use-case pattern in an SAP context that are predefined by SAP:

-   Extract sales order requests automatically from Excel files and create sales orders in the SAP S/4HANA system. For more information, see: [Automatic Creation of Sales Orders from Excel \(4G5\)](https://store.irpa.cfapps.eu10.hana.ondemand.com/#/package/6de1912a-c31d-4f54-b3fb-ea4e66086731).
-   Schedule interviews in SAP SuccessFactors solutions by automating the update of various details for interview scheduling. For more information, see: [Interview Scheduling with the help of SuccessFactors](https://store.irpa.cfapps.eu10.hana.ondemand.com/#/package/3ce23823-9de2-4598-b37b-628d674d6e11).
-   Automatically export experience measurement scores from Qualtrics to SAP Sales Cloud and Service Cloud using screen scraping. For more information, see: [Automatic export of XM scores and intelligent X-data \(Qualtrics, SAP Sales Cloud and Service Cloud\)](https://store.irpa.cfapps.eu10.hana.ondemand.com/#/package/6d54a4c2-7a22-42c2-93bf-51a24a8024a6).

***

## Digital Integration Hub

The digital integration hub use-case pattern allows you to implement large scale, high-throughput APIs by inserting a high-performance data store layer between the API service layer and business applications in a decoupled fashion. As a result, you can provide high responsive front-end API services while preventing business applications from excessive API services-generated workloads.

  
  
**Digital Integration Hub Integration Use-Case Pattern**

![](images/loiobbe5b7c6a076455d8788f5148d938072_LowRes.png "Digital Integration Hub
					Integration
					Use-Case Pattern")

Examples of the digital integration hub integration use-case pattern in an SAP context that are custom-defined by SAP customers or partners:

-   Create a single access layer for all data sources, including SAP and third-party systems accelerating the implementation of digital processes to interact efficiently with customers. For more information, see: [Digital integration hub customer use case](https://www.sap.com/documents/2021/07/0e584af9-f07d-0010-bca6-c68f7e60039b.html).
-   Enable fast data access as well as high availability when transitioning from an on-premise centric application landscape towards a cloud-based one. For more information, see: [Digital integration hub customer use case](https://www.sap.com/documents/2021/07/18ed8a4f-f27d-0010-bca6-c68f7e60039b.html).

