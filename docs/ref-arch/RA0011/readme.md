---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0011
slug: /ref-arch/c6b47a100f
sidebar_position: 11
sidebar_custom_props:
    category_index:
        - aws
        - azure
        - gcp
        - data
############################################################
#     You can modify the front matter properties below     #
############################################################
title: SAP HANA Cloud as an Esri Geodatabase
description: The reference architecture for Esri running on SAP HANA Cloud as a geodatabase represents a powerful integration of geospatial technology with enterprise-grade cloud infrastructure. This enhances geospatial capabilities by allowing organizations to store, process, and analyze spatial data directly within SAP HANA Cloud, utilizing its multimodel processing and built-in spatial engine. The integration provides real-time access to both SAP and non-SAP data, breaking down data silos and enabling near-instant insights, which is crucial for industries like utilities during natural disasters.
sidebar_label: SAP HANA Cloud as an Esri Geodatabase
keywords: [sap, hana cloud, esri]
image: img/logo.svg
tags: [aws, azure, gcp, data]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - aldapooh
last_update:
    date: 2025-03-25
    author: aldapooh
############################################################
#                   End of Front Matter                    #
############################################################
---

SAP and Esri have deepened their partnership by integrating Esri's ArcGIS technology with SAP HANA Cloud. This collaboration enhances geospatial capabilities by allowing organizations to store, process, and analyze spatial data directly within SAP HANA Cloud, leveraging its multimodel processing and built-in spatial engine. The integration provides real-time access to both SAP and non-SAP data, breaking down data silos and enabling near-instant insights, which is crucial for industries like utilities during natural disasters.

The Esri and SAP partnership also offers significant scalability and operational efficiency. Organizations can seamlessly scale their computing and storage capabilities to meet varying demands, especially with the growing availability of geospatial data. Additionally, the flexibility of SAP HANA Cloud’s data lake allows cost-effective storage solutions while maintaining high performance. Together, SAP HANA Cloud and Esri ArcGIS reduce redundant administrative tasks, allowing IT departments to focus on strategic initiatives and empowering businesses to harness the full potential of their geospatial data.

This reference architecture for Esri running on SAP HANA Cloud as a geodatabase represents a powerful integration of geospatial technology with enterprise-grade cloud infrastructure. An [Esri geodatabase](https://pro.arcgis.com/en/pro-app/latest/help/data/geodatabases/overview/what-is-a-geodatabase-.htm) is a collection of geographic datasets of various types held in a common file system folder, or a relational database management system such as IBM DB2, Microsoft SQL Server, Oracle, PostgreSQL, or SAP HANA. Geodatabases come in many sizes, have varying numbers of users, and can scale from small, single-user databases built on files up to enterprise geodatabases accessed by many users.

At its core, this architecture leverages SAP HANA Cloud, a certified geodatabase for Esri applications, which serves as the foundation for storing, processing, and analysing vast amounts of geospatial and business data. Esri ArcGIS Enterprise sits atop HANA Cloud database, providing advanced geospatial capabilities and tools that are seamlessly integrated with SAP's Business Technology Platform (BTP). This integration allows organizations to combine the strengths of Esri's industry-leading GIS solutions with SAP's comprehensive suite of business applications and analytical tools.

The architecture incorporates a sophisticated integration layer that includes SAP HANA Spatial Service and Esri ArcGIS connectors. These components ensure smooth data flow and interoperability between Esri's geospatial tools and SAP's business systems. This layer enables real-time access to both geospatial data from Esri and business data from various SAP sources. The result is a unified platform where location intelligence and business insights converge, offering unprecedented opportunities for data-driven decision making.

At the application level, users interact with this integrated system through a variety of interfaces. Esri ArcGIS Pro provides GIS professionals with advanced tools for spatial analysis and mapping, while SAP Analytics Cloud offers business users powerful capabilities for data visualization and business intelligence. Custom geospatial applications can also be developed on this architecture, tailored to specific industry needs or use cases. Security and authentication are managed through a combination of [SAP Identity Authentication](https://www.sap.com/products/technology-platform/identity-authentication.html) and Esri ArcGIS Enterprise security protocols, ensuring that data remains protected and accessible only to authorized users.

This reference architecture highlights several key business values. First, it showcases the high-performance spatial engine of SAP HANA Cloud, which has been optimized specifically for Esri workloads. This optimization results in exceptional processing speed for complex geospatial queries and the ability to handle large-scale location data with minimal latency. Second, the architecture demonstrates significant potential for reducing Total Cost of Ownership (TCO). By consolidating business and geospatial data on a single cloud platform, organizations can reduce infrastructure costs and eliminate the need for extensive on-premises hardware investments. The scalability of the cloud solution also allows for flexible resource allocation, enabling companies to pay only for what they use. Finally, this architecture emphasizes the real-time linkage between SAP and Esri data, facilitating immediate analysis that combines geospatial insights with up-to-date business context. This capability is particularly valuable for use cases such as supply chain optimization, customer segmentation, asset management, and risk assessment across various industries.

## Architecture

![drawio](drawio/esri-and-hana-cloud.drawio)

## Flow: 

Prerequisite is to migrate and deploy an Esri ArcGIS geodatabase in SAP HANA Cloud. This is easily done via few clicks and details can be obtained here:

https://pro.arcgis.com/en/pro-app/latest/help/data/geodatabases/manage-saphana/create-geodatabase-saphana.htm

There are 3 different data flows depending on personas:

- [Geospatial analyst utilizing Esri tools and UI](#geospatial-analyst-with-esri-tools-and-ui)
- [Application developer](#application-developer)
- [Geospatial analyst using SAP tools and UI](#geospatial-analyst-using-sap-tools-and-ui)

### Geospatial analyst with Esri tools and UI 

**A Geospatial Analyst persona using Esri tools to access combined SAP and Esri data in HANA Cloud is depicted in ***GREY*** and looks like:**

1. The process begins with loading the Esri ArcGIS geodatabase with geospatial data via the tools that come with Esri ArcGIS, such as ArcGIS Pro/Desktop, ArcGIS Portal, third-party tools such as FME, etc. The analyst can then create a ArcGIS [Query Layer](https://pro.arcgis.com/en/pro-app/latest/help/mapping/layer-properties/what-is-a-query-layer-.htm) (see https://pro.arcgis.com/en/pro-app/latest/help/mapping/layer-properties/what-is-a-query-layer-.htm ) via Esri ArcGIS Pro to combine the GIS data and SAP enterprise data in the SAP HANA Cloud calculation view.
2. Those Esri tools are natively connected to Esri Geodatabase or Esri Utility Network Utility model, which are already deployed as database artifacts in SAP HANA Cloud.
3. The analyst can create a calculation view in SAP HANA Cloud that combines the Esri ArcGIS data with SAP enterprise data via CDS views. Data is joined in a SAP HANA Cloud calculation view which is built on top of Esri Geodatabase and CDS from S/4 HANA joining Esri and SAP data.
4. Data is read from SAP HANA Cloud (federated or replicated) and underlying source systems as SAP S/4HANA, SAP Business Warehouse or other sources.

### Application developer

**An Application Developer persona will follow a different process, depicted in ***PINK***, which looks like:**

1. The SAP Business Technology Platform provides services and capabilities, including the SAP Business Application Studio for development. The Business Application Studio is the first place where a developer can code CAP applications. A CAP application built on SAP BTP can utilize geospatial data stored in an ESRI Geodatabase on SAP HANA Cloud.
2. For data modeling with CDS, the developer can define entities that represent customers' geospatial data and the joined data from the HANA Cloud Calculation View. CDS annotations can handle geospatial data types such as ST_Point, ST_Geometry, or ST_Polygon. Associations can be defined between entities to model relationships, such as linking geospatial locations with business objects like assets, customers, or orders. Once the models are defined, OData services can be exposed using the CAP framework, and custom service handlers can be implemented in JavaScript/TypeScript or Java. Throughout this process, the Application developer can make adjustments and optimizations to the Geospatial app to ensure smooth data flow and integration according to business requirements.
3. The CAP app connects to SAP HANA Cloud. Within SAP HANA Cloud, the Esri geospatial data is stored and can be combined with existing business data from SAP S/4HANA or other source systems.
4. Data is read from SAP HANA Cloud (federated or replicated) and underlying source systems such as SAP S/4HANA, SAP Business Warehouse or other sources.

### Geospatial analyst using SAP tools and UI
**A Geospatial Analyst persona using SAP tools and a Fiori UI is depicted in ***BLUE*** and looks like:**

1. a Geospatial Analyst might use a Fiori Application written and developed for specific business needs.
2. The CAP (Node.js) Geospatial app connects to SAP HANA Cloud which is running as a Esri geodatabase.
3. Within SAP HANA Cloud, the geospatial data is stored and can be combined with existing business data. SAP HANA Cloud processes HANA Calculation Views where data is joined between the Esri Geodatabase and CDS from S/4HANA, bringing spatial and business data together.
4. Data is read from SAP HANA Cloud (federated or replicated) and underlying source systems like SAP S/4HANA, SAP Business Warehouse or other sources.

This architecture flow demonstrates how geospatial data from Esri ArcGIS is integrated with SAP business data in HANA Cloud, allowing for combined analysis and insights that benefit from both location intelligence and business information.

## Characteristics

**High-Performance Spatial Engine**: Optimized for Esri workloads, SAP HANA Cloud delivers rapid processing of complex geospatial queries with minimal latency.

**Real-Time Data Integration**: Seamlessly combines geospatial data from Esri with business data from SAP, allowing for immediate analysis and decision-making.

**Scalability**: The cloud-based architecture supports flexible resource allocation, enabling organizations to scale computing and storage capabilities as needed.

**Cost Efficiency**: Reduces Total Cost of Ownership by consolidating data on a single cloud platform, eliminating the need for extensive on-premises hardware.

**Interoperability**: Features a sophisticated integration layer with SAP HANA Cloud Spatial Service and Esri ArcGIS connectors, ensuring smooth data flow between systems.

**Customizability**: Allows for the development of custom geospatial applications and user interfaces tailored to specific industry needs.

Overall SAP HANA Cloud is used as a unified database, executing diverse workloads because of its multi-model engines.

## Examples

One European Power Grid operator, Open Grid Europe (OGE), utilized SAP HANA Cloud to modernize its operations and enhance decision making capabilities. By migrating its analytical applications to the cloud, a power grid operator improved performance, scalability, and agility. The company is utilizing HANA Cloud as an integration hub for its asset management. This strategic move enabled a customer to consolidate asset data from various sources, providing a unified view for efficient management and optimization. The adoption of SAP HANA Cloud as a geodatabase for Esri streamlined processes, drives innovation, and supports the customer’s goal of becoming a more data-driven organization by combining SAP and Esri data for improving asset visibility, cost reduction, and overall operational efficiency.

SAP HANA Cloud demonstrated powerful capabilities in handling complex geospatial data challenges, as evidenced by one European post office logistic department. This solution efficiently federates large volumes of sorting and delivery transaction data, enabling real-time analysis without data replication. SAP HANA Cloud's geospatial features allow for sophisticated visualization on geo maps, including polygons and flow maps, which are crucial for deriving quick business insights. The platform's ability to blend data from various sources, transform geospatial formats (like GeoJSON to WKT), and perform on-the-fly transformations makes it a versatile solution for organizations dealing with location-based data.

The value proposition of SAP HANA Cloud for solving geospatial customer problems lies in its comprehensive approach to data management and analysis. SAP HANA Cloud and Esri System combination of features allows companies to make data-driven decisions quickly and efficiently, ultimately leading to improved operational performance and strategic planning.

Other examples include:

- **Asset Management and Maintenance**: Display physical assets (e.g., machinery, infrastructure) on a map, enabling location and status monitoring.
- **Field Service Management**: Assign field technicians to service calls based on proximity, skill set, and availability. Visualize incidents or service requests on a map for better resource allocation.
- **Logistics and Supply Chain Optimization**: Optimize warehouse locations and inventory distribution based on geographical data.
- **Sales and Marketing Analysis**: Map customer locations to identify market penetration and potential areas for expansion.

## Services and Components

SAP HANA Cloud

## Resources

SAP HANA Links:

- [SAP HANA Cloud Multitenancy Guide](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-multitenancy/sap-hana-cloud-multitenancy)
- [SAP HANA Get Started](https://www.sap.com/products/technology-platform/hana/get-started.html?sort=latest_desc&tab=product-demos)
- [SAP HANA Cloud on sap.com](https://www.sap.com/products/technology-platform/hana.html)
- [SAP HANA Cloud Documentation](https://help.sap.com/docs/hana-cloud?locale=en-US)
- [SAP HANA Cloud Capacity Unit Estimator](https://hcsizingestimator.cfapps.eu10.hana.ondemand.com/)
