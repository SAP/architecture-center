---
id: id-ra0013-3
slug: /ref-arch/f5b6b597a6/3
sidebar_position: 3
sidebar_custom_props:
  category_index: []
title: >-
  Implementing and Extending SAP-managed domain content in SAP BDC
description: >-
  Streamline business insights with SAP BDC, integrating SAP S/4HANA and Intelligent
  Applications for analytics, decision-making, and lifecycle management.
keywords:
  - sap
  - business data cloud
  - intelligent apps
  - analytics optimization
  - data foundation
sidebar_label: Implementing and Extending SAP-managed domain content in SAP BDC
image: img/ac-soc-med.png
tags:
  - data
  - aws
  - azure
  - gcp
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - s-krishnamoorthy
  - jmsrpp
  - anbazhagan-uma
  - jasoncwluo
  - peterfendt
discussion: 
last_update:
  author: anbazhagan-uma
  date: 2026-05-12
---

## Introduction

Intelligent content complement transactional applications like ERP and HCM leveraging underlying data models, ML models and analytics within SAP BDC to provide personalized user experiences. These personalized experiences help business users understand various aspects of their operations. Additionally, intelligent applications offer insights, recommendations and facilitate actions to enhance outcomes that matter to the business user.

Intelligent content provide line of business users with ready-to-use insights to improve decision making and to take action on critical business signals.
- Built by SAP utilizing decades of industry and functional experience.
- Insights are enhanced with AI/ML to uncover hidden insights and improve decision-making.
- Built on SAP BDC allowing customers to easily enrich and/or extend intelligent application use cases leveraging SAP and non-SAP data.

This architecture pattern focuses on installing and consuming SAP-managed data products within SAP Analytics Cloud as Intelligent content pre-delivered by SAP.

## Installing, Activating, and Visualizing a Standard SAP S/4HANA Data Product

### Producing a Data Product in SAP S/4HANA Private Cloud Edition (PCE)

A **data product** is a curated, self-contained collection of tables and business data, accessible for consumption by external applications or services via standardized APIs. In SAP S/4HANA, data products are created by exposing relevant datasets through APIs and enriching them with comprehensive metadata. This metadata is structured as an Open Resource Discovery (ORD) document, detailing the data product's purpose, structure, and access mechanisms.

### Installing and Activating a Data Product in SAP Datasphere

Installation involves fully activating associated data products and installing content within SAP Datasphere and SAP Analytics Cloud, enabling direct consumption of dashboards. SAP Datasphere provides robust data warehouse capabilities, advanced data integration tools, and seamless support for both native and derived data products. It simplifies the consumption, management, and publication of data products across the organization.

1. **Review and Install the Data Product:** Evaluate the data product’s summary, sample data, included objects, terms of use, and supporting documentation to ensure it meets analytical requirements. Preview a sample dataset for validation or directly install the data product into a designated SAP Datasphere space for further modeling and analysis.

2. **Activate Data Packages:** Activation makes baseline data and relevant data products of a data package available. Data and models reside within the foundation services, and data products can be discovered and installed via the catalog.

### Visualizing a Data Product in SAP Analytics Cloud (SAC)

For advanced visualization and planning, **SAP Analytics Cloud (SAC)** is the recommended solution for both embedded and standalone analytics scenarios. SAC integrates seamlessly with SAP Datasphere, enabling users to transform data products into actionable insights through interactive dashboards and reports. The embedded (OEM) version of SAC enhances performance with a streamlined viewer and offers cost efficiencies via a shared application tenant.

**Visualization Steps:**

1. **Establish Connectivity:** Ensure SAP Analytics Cloud is connected to the SAP Datasphere environment where the data product resides.
2. **Model the Data:** Consume analytical models in Datasphere based on the deployed data product, leveraging its semantic richness for accurate analysis.
3. **Develop Dashboards:** Design and publish dashboards and reports in SAC to visualize key metrics, trends, and business outcomes.

By following this streamlined approach, organizations can efficiently produce, deploy, and visualize standard SAP S/4HANA data products, unlocking faster, more reliable insights and maximizing the value of their SAP data landscape.

## SAP BDC Intelligent content

Intelligent Applications represent the highest level of abstraction in SAP BDC's data product hierarchy, packaging multiple data products into comprehensive, purpose-built analytical solutions.

**SAP Business Data Cloud Intelligent content** are SaaS components that provide business users with intelligent insights derived from their data. These ready-to-use apps leverage SAP data products and offer pre-built analytical models, dashboards, and workflows for various industries and functions. Integrated with SAP Business AI, they enable timely decisions based on real-time signals. SAP manages these apps, ensuring automatic data connection, accuracy, and faster insights.

**Domain content** is a SAP-managed collection of analytical resources and functionalities delivering analytical, process, or domain insights. It comprises data products, semantic models, dashboards, planning templates, and future AI and KPI watchlist features.

Domain content combine data products, data models, and SAP Analytics Cloud content, along with search and SAP-managed KPIs. The SAP Analytics Cloud content demonstrates the use of underlying data products for specific analytics scenarios. Customers can adapt the data products for their needs, using the front-end as a no-code template. The combined value of data products, the semantic model, and templates is key.

## Architecture

With the current release of SAP BDC and Intelligent content, customers can either use the pre-delivered content as-is or customize the analytical model of the pre-delivered content to develop custom analytical content.

Insight packages include data products, base and analytical models, and pre-defined SAC visualizations, planning templates, search-driven insights, and KPI watchlists. In SAP-managed Intelligent Applications, data products reside in the SAP Foundation Services Layer, base models and analytic models are housed in SAP Datasphere, and visualizations are managed in SAP SAC.

### High-Level Setup Steps Prior to installing and using SAP Domain content

1. Provision required systems (SAP Datasphere Tenant, SAC Tenant, SAP S/4HANA PCE, optional: SAP Databricks). The SAP BDC Cockpit will be available once the formation is created in SAP BTP.
2. Install relevant components in SAP S/4HANA.
3. Set up communication arrangements (inbound/outbound) in SAP S/4HANA.
5. Configure the Cloud Connector.
6. Create the formation.

### SAP-Delivered Domain content

SAP-managed data products are installed, and end users utilize the standard Intelligent Applications via SAP Analytics Cloud. Intelligent Applications are pre-built analytical applications within SAP BDC that help uncover hidden insights and enable faster decision-making. These apps are fully managed by SAP, built on curated SAP BDC data products, Datasphere models, and SAC stories, and include predefined metrics, AI models, and planning tools.

**SAP-Managed Data Products:**
- Fully managed by SAP throughout their lifecycle.
- Data is stored within the Foundation Service (FOS) HDLFS, which is not directly accessible to customers.

![drawio](drawio/sap-managed-intelligent-application.drawio "SAP-Managed Data Products")

### Customization of SAP-Delivered Domain content

Organizations can copy and customize the underlying SAP Datasphere analytical models and SAP Analytics Cloud stories, leveraging SAP-managed data products.

![drawio](drawio/sap-managed-custom-intelligent-application.drawio "Customization of SAP-Delivered Domain content")

## Services and Components

- **SAP BDC Cockpit:** Centralized management interface for SAP BDC.
- **SAP Datasphere:** Centralized data management platform supporting self-service, semantic onboarding, and integration with data marketplaces.
- **SAP Analytics Cloud (SAC):** Provides advanced analytics and visualization capabilities.
- **Data Products:** Standardized datasets for AI/ML and cross-domain analytics. Exposed for consumption outside the producing application via APIs, described by high-quality metadata, and semantically aligned for access through the Data Product Directory.
- **Data Packages:** Logical grouping of data products, used as foundations for modeling in SAP Datasphere or for AI/ML scenarios in SAP Databricks.
- **Domain content:** Pre-built applications for actionable intelligence. Low-code apps composed of data products, data models, and SAC content. SAC content demonstrates the underlying data products to fulfill specific analytics use cases. Customers can extend the analytical layer to meet specific requirements.


## Resources

[SAP Business Data Cloud - FAQ](https://community.sap.com/t5/technology-blogs-by-sap/sap-business-data-cloud-faqs/ba-p/14022781)

## Conclusion

Using SAP's pre-built data products and Intelligent content provides a comprehensive view of critical business processes across all SAP applications. This ensures consistency and business context with SAP-managed data sets and semantics. Adopting SAP data products offers comprehensive lifecycle management, eliminating the overhead of building a trusted data foundation.