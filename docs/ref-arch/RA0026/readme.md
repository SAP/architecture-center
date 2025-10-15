---
id: id-ra0026
slug: /ref-arch/rzArMOyX
sidebar_position: 1
title: 'Building Intelligent Applications with SAP HANA Cloud'
description: 'This reference architecture provides ideas on how intelligent data applications can be built on top of SAP HANA Cloud. It highlights the extensive possibilities SAP HANA Cloud offers for data processing and application development. First, we explain the internal components of SAP HANA Cloud that can be seamlessly used to process nearly any data type or format. We also detail the use of technologies like the SAP Cloud Application Programming Model (CAP) within the SAP Business Application Studio development environment, discuss the SAP HANA Deployment Infrastructure (HDI), and mention the possibility of connecting to the SAP Generative AI Hub to leverage the latest advancements in Artificial Intelligence and Generative AI.'
sidebar_label: 'Building Intelligent Applications with SAP HANA Cloud'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - genai
  - data
  - cap
contributors:
  - jmsrpp
last_update:
  date: 2025-10-15
  author: jmsrpp
---

### **Building Intelligent Applications with SAP HANA Cloud**

**Description:**

This reference architecture provides ideas on how intelligent data applications can be built on top of SAP HANA Cloud. It highlights the extensive possibilities SAP HANA Cloud offers for data processing and application development. First, we explain the internal components of SAP HANA Cloud that can be seamlessly used to process nearly any data type or format. We also detail the use of technologies like the SAP Cloud Application Programming Model (CAP) within the SAP Business Application Studio development environment, discuss the SAP HANA Deployment Infrastructure (HDI), and mention the possibility of connecting to the SAP Generative AI Hub to leverage the latest advancements in Artificial Intelligence and Generative AI.

SAP HANA Cloud's in-memory processing leverages column-store technology and advanced compression to optimize data storage. By holding operational data in main memory, it eliminates disk I/O bottlenecks, enabling real-time processing for both transactional and analytical workloads. The platform's multicore processing and parallelization capabilities, combined with intelligent data tiering, ensure high performance across various data temperatures and workloads.

The SAP HANA Cloud Data Lake extends the platform's capabilities by providing petabyte-scale storage for historical and infrequently accessed data. It supports open data formats and offers seamless integration with the in-memory engine, allowing for transparent data access and federated queries across both storage tiers. The Data Lake's relational engine and file storage capabilities enable complex analytics on structured and unstructured data, while dynamic tiering optimizes performance and cost by automatically moving data between in-memory and data lake storage based on usage patterns.

SAP HANA Cloud includes several specialized engines tailored for optimal performance and data processing versatility. These include, but are not limited to:

- **Spatial Engine:** Provides capabilities for storing, processing, and analyzing spatial and geographic data. It supports various spatial data types, indexes, and operations, including location-based analytics and visualization.
- **Graph Engine:** A specialized engine for processing and analyzing graph data structures. It supports native graph operations and algorithms and is useful for scenarios like social network analysis, fraud detection, and recommendation systems.
- **Document Store:** A native multi-model database engine supporting JSON documents. It allows for flexible schema design and efficient querying of semi-structured data.
- **SQL Script Engine:** A powerful tool for developing and executing database procedures and functions. It is key for creating custom data processing logic, extending standard SQL with control flow statements that allow developers to write complex logic directly within the database.
- **Predictive Analytics Library (PAL):** A comprehensive set of machine learning algorithms integrated into SAP HANA. It includes algorithms for classification, regression, clustering, time series analysis, and more. PAL allows for the in-database execution of predictive models, reducing data movement and improving performance.
- **Vector Engine:** A specialized engine for AI and machine learning workloads. It enables efficient storage and processing of high-dimensional vector data and supports similarity search and approximate nearest neighbor (ANN) queries. It is ideal for applications like recommendation systems, image recognition, and natural language processing.

Data in SAP HANA Cloud can be processed using SQL or SQL Scripts, as well as via Python through APIs. SQL and SQL Scripts provide powerful options for querying and manipulating data directly within the database, leveraging SAP HANA's in-memory processing for high performance. For more complex analyses and machine learning tasks, Python integration allows data scientists and developers to use familiar libraries and tools while still benefiting from SAP HANA Cloud's computational power. For analytical use cases or on-the-fly data preparation, SAP HANA offers dedicated development objects called calculation views. These are well-integrated into the platform's security, lifecycle management, and development tooling. This flexibility enables organizations to process data using the most appropriate method for each task, whether it's traditional SQL for business reporting, advanced analysis via calculation views, SQL Scripts for complex transformations, or Python for cutting-edge AI and machine learning applications. The seamless integration of these methods with SAP HANA's diverse engines creates a comprehensive platform capable of handling a wide range of data processing needs efficiently and at scale.

The SAP Cloud Application Programming Model (CAP) and SAP Business Application Studio further enhance the SAP HANA Cloud ecosystem by streamlining application development and deployment. CAP provides a framework for building enterprise-grade services and applications, offering out-of-the-box solutions for common development tasks and promoting best practices in application design. It seamlessly integrates with SAP HANA Cloud, allowing developers to leverage the database's powerful features while abstracting away complexity.

SAP Business Application Studio complements this by offering a cloud-based integrated development environment (IDE) tailored for SAP application development. It provides a comprehensive set of tools and pre-configured environments for various development scenarios, including CAP projects. This combination of CAP, calculation view modeling, and other scripted development within Business Application Studio enables rapid application development—from data modeling and service creation to user interface design and deployment—all within the SAP ecosystem.

Together, these tools create a cohesive development experience, allowing organizations to quickly build and deploy sophisticated applications that take full advantage of SAP HANA Cloud's advanced capabilities. This reference architecture helps your business develop applications that adhere to SAP's "clean core" strategy. In this model, standard SAP applications run without modification on SAP S/4HANA systems, while custom, innovative applications are developed and run on the SAP Business Technology Platform (BTP).

The SAP Generative AI Hub provides pre-built AI services and models that developers can easily incorporate into their applications using CAP and SAP Business Application Studio. These services cover a range of use cases, such as natural language processing, code generation, and content creation. By leveraging the Gen AI Hub, organizations can rapidly infuse their SAP applications with advanced AI capabilities, improving user experiences and automating complex tasks.

Furthermore, the Gen AI Hub integrates seamlessly with SAP HANA Cloud's data processing capabilities, allowing for the creation of AI-powered applications that can analyze vast amounts of structured and unstructured data in real time. This synergy between generative AI and SAP's robust data platform enables innovative solutions in areas like predictive analytics, intelligent automation, and personalized user interactions.

**Architecture:**

![drawio](drawio/diagram-J6qaX8EXW4.drawio)



**Flow:**

The following describes the data flow for an application developer. An end-user only needs access to the intelligent data application's link or Fiori UI.

1. **Data Sources and Data Ingestion:** There are several ways to make data available in SAP HANA Cloud for further processing. Details on data ingestion are covered in other reference architectures and related missions. In short, one can use replication to bring data directly to SAP HANA Cloud Data Lake or the SAP HANA Cloud in-memory store, or use federation via Smart Data Access (SDA) and virtual tables. Both methods are supported for a variety of source systems.
2. **Data Access and Development:** An end-user or developer can access data in SAP HANA Cloud in various ways, including SQL, Python, or other access types via JDBC or ODBC. One can also leverage the SAP Cloud Application Programming Model (CAP), which allows for both the generation and reuse of HDI objects such as tables or calculation views. The specific CAP approach depends on the use case. Existing calculation views or tables can be reused in CAP, which is important when there is a long history of using SAP HANA and previous investments in these objects. For new developments, the persistence layer should be defined in CAP and generated into HDI. Finally, it is always possible to use JDBC/ODBC drivers to leverage SAP HANA Cloud for persistence while developing feature-rich applications in any preferred programming language.
3. **Data Processing:** Depending on the application's access method and model, SAP HANA Cloud can process all the different data types described above using their respective engines and sub-components. Having all these capabilities for in-memory processing of different data types allows you to create feature-rich applications that combine AI and generative features on top of graph or spatial data, alongside analytical data in SAP HANA Cloud.

**Characteristics**

Building an intelligent data application requires access to data in various formats. Due to the deep integration of several data storage types into SAP HANA Cloud, customers can place large, infrequently required data volumes into low-cost storage.

SAP HANA Cloud offers an integrated development experience, lifecycle management, and continuous integration/continuous deployment (CI/CD) options. To leverage these capabilities, tables are developed using the SAP HANA Deployment Infrastructure (HDI).

SAP HANA Cloud offers several unique strengths that make it uniquely suited for developing intelligent data applications. It not only offers the typical services expected from a database but also adds several unique capabilities:

- **Data Storage:** SAP HANA Cloud allows fine-grained control over the orchestration of data storage. Several options allow customers to choose a setting that best fits their performance and cost requirements, from low-cost mass data storage to high-performance in-memory storage.
- **Processing Engines:** SAP HANA Cloud integrates relational processing, common in other databases, with the processing of more specialized requirements such as geospatial or graph data. This integration is complemented by support for unstructured data, such as JSON documents. Given the strong focus on technological advancement, dedicated engines for artificial intelligence use cases are also offered.
- **Strong Application Models:** The Cloud Application Programming Model (CAP) unifies these functionalities for the development of intelligent data applications.

It is important to highlight that storing data of various formats in HDI tables and preprocessing them can be achieved within the integrated development environment of SAP Business Application Studio.

With machine learning algorithms, data, and on-the-fly preprocessing logic in place, developers can use the Cloud Application Programming Model (CAP) to build the intelligent application. CAP orchestrates the data and analytics, enabling data-driven decisions.

All of these SAP HANA Cloud characteristics—data storage, multi-format data handling, preprocessing, analytics, machine learning, and end-user application development—can be achieved within a single solution: SAP HANA Cloud.

By choosing SAP HANA Cloud for building intelligent data applications, customers benefit from all of these capabilities without combining multiple vendors or techniques, which would otherwise require significant integration effort.

**Examples:**

1. **One-click simplification of scalability.** KWS SAAT democratized its data with real-time data replication from both SAP and non-SAP sources into a single database. KWS implemented SAP HANA Cloud to build a clean core for its data management capabilities.
2. - **Achieved Results:**
- - Consolidated large volumes of enterprise-wide data in SAP HANA Cloud, allowing for improved application and development speed and performance on SAP Business Technology Platform.
- Democratized data with real-time replication from both SAP and non-SAP sources into a single database.
- Enabled IT to better support user requirements for data management, reporting, and analytics.
- See: KWS SAAT Implements SAP HANA Cloud as a Foundation of Data Landscape
3. **78% reduction in operational downtime.** To achieve the flexibility and scalability it needed for its cloud-based Microgen tool, Centrica chose SAP BTP, which provides the necessary platform services to build a comprehensive cloud-native solution.
4. - **Details:** The SAP Cloud Application Programming Model was used to build Node.js back-end applications, and SAP Business Application Studio was used by developers to build all the Microgen applications, leveraging SAPUI5 technology and following standard guidelines for the SAP Fiori user experience (UX). Data was replicated from an Oracle database to the SAP HANA Cloud database using SAP HANA smart data integration. SAP HANA Cloud provides fast data access and data processing for data-intensive operations, such as billing simulations.
- See: SAP and Centrica Success Story | Customer Reviews and Testimonials
5. **Instant talent analysis for esports.** Team Liquid built an intelligent data application on SAP HANA Cloud that provides instant analysis to find the best gaming talents around the globe.
6. - **Achieved Results:**
- - Analyzed multi-model data from various sources in real time with one solution.
- Utilized integrated multitier storage to store and analyze massive amounts of data in a cloud data lake.
- Leveraged embedded data science, machine learning, and predictive analytics to build intelligent data applications.
- See: Team Liquid: Scouting Winning Talent to Build a Competitive League of Legends Team (sap.com)

**Services and Components**

- SAP HANA Cloud

**Resources**

- **SAP HANA Get Started:** [https://www.sap.com/products/technology-platform/hana/get-started.html?sort=latest_desc&tab=product-demos](https://www.sap.com/products/technology-platform/hana/get-started.html?sort=latest_desc&tab=product-demos)
- **SAP HANA Cloud:** [https://www.sap.com/products/technology-platform/hana.html](https://www.sap.com/products/technology-platform/hana.html)
- **SAP HANA Cloud Documentation:** [https://help.sap.com/docs/hana-cloud?locale=en-US](https://help.sap.com/docs/hana-cloud?locale=en-US)
- **SAP HANA Academy GitHub:** [https://github.com/saphanaacademy/SAPHANACloud](https://github.com/saphanaacademy/SAPHANACloud)
- SAP HANA Cloud Getting Started Guide
- SAP HANA Overview Guide
- SAP HANA Cloud Capacity Unit Estimator

