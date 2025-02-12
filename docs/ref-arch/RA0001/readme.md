---
id: id-ra0001
slug: /ref-arch/a06a959120
sidebar_position: 1
sidebar_custom_props:
  category_index:
    - integration
    - appdev
title: Reference Architecture for Event-Driven Applications
description: Guidance for developing end-to-end integrated applications based on Event-Driven Architecture (EDA) in SAP BTP. Reference Architecture on how to implement using SAP's EDA Technonology options and CAP for building custom EDA extension application.
keywords:
  - sap
  - btp
  - integration
  - event-driven architecture
  - azure 
  - aws 
  - genai
  - cloud application programming model
  - cap
  - eda
sidebar_label: Event-Driven Architecture Application
image: img/logo.svg
tags:
  - azure
  - aws
  - genai
  - integration
  - appdev
  - eda
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - anbazhagan-uma
  - pra1veenk
  - AjitKP91
  - swatimaste00 
last_update:
  author: anbazhagan-uma
  date: 2025-01-18
---

Customers are transitioning to cloud services and embracing a new digital core to achieve greater agility and business process innovation. This shift needs automation and real-time integration with their ERP systems, ensuring the entire ecosystem operates at the pace of the business. As part of digital transformation, enterprises are adopting API-First and Event-First Strategy and embracing event-drive architecture as part of their transformation journey. The need for building flexible and real-time responsive systems is important.

This reference architecture offers guidance for developing applications based on Event-Driven Architecture (EDA) in SAP BTP. 

## Reference Architecture

![image](images/e2b-refarch-cc.svg)

![drawio](drawio/e2b-cc.drawio)

This architecture can be leveraged to build event-based integration scenarios from different systems/applications (providers) into the SAP ecosystem (consumers) using SAP BTP. This uses asynchronous communication vis message broker.
This features a CAP-based application framework (Events-To-Business Actions Framework) which allows you to configure set of actions for a particular business scenario. Based on the events category and type, respective actions are triggered in SAP Line of Business (LoB) applications. It also uses SAP Integration Suite, advanced event mesh / Event Mesh capability in SAP Integration Suite, SAP Build Process Automation, SAP HANA Cloud, SAP Destination Service, SAP Connectivity service with cloud connector. An alternative architecture can be considered with SAP Private Link service for integrating SAP BTP and SAP S/4HANA in scenarios where both SAP BTP and SAP S/4HANA run on the same Hyperscaler environment (Microsoft Azure or AWS).
The reference applications with Microsoft Azure and AWS demonstrates and helps to build end-to-end event-based integration scenario.


## Architecture Components

Learn about the roles and interactions of the key services and components in the Reference Architecture to understand how the different services are leveraged to achieve real-time event integration scenarios.

### SAP Integration Suite for Event Broker

For asynchronous communication, the EDA solution offerings from SAP are SAP Integration Suite, advanced event mesh and SAP Integration Suite, event mesh capability. EDA enables clean core strategy by leveraging the data from all applications to build extension applications on SAP BTP.

Advanced event mesh is a distributed multi-broker event mesh designed to manage and monitor events across enterprise landscapes, including SAP and third-party applications, services, and technologies. It provides centralized visibility and control, distributed event processing, and flexible deployments, making it essential for large businesses.

The Event Mesh capability of SAP Integration Suite (“Event Mesh capability” for short) is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications.

As per [SAP Integration Solution Advisory Methodology (ISA-M)](https://help.sap.com/docs/sap-btp-guidance-framework/sap-integration-solution-advisory-methodology/catalog-of-integration-use-case-patterns),either of the options can be selected based on the eventing requirements.

### SAP CAP for Extension Application

The SAP Cloud Application Programming Model (CAP) is a framework of languages, libraries, and tools for building enterprise-grade services and applications. It supports Java (with Spring Boot), JavaScript, and TypeScript (with Node.js), which are some of the most widely adopted languages. CAP is recommended by the [SAP BTP Developer's Guide](https://help.sap.com/docs/btp/btp-developers-guide/btp-developers-guide), and supports developers with a path of proven best practices and a wealth of out-of-the-box solutions to recurring tasks.

#### Events-To-Business Actions Framework 
In this reference architecture, the events-to-business actions framework is developed as CAP application using Node.js. This serves as the central component and a reusable component. Below are the key characteristics and benefits of using the framework.

- Provides comprehensive programming and configuration model for development of event-based integration scenario with SAP systems.
- Flexible and generic framework that can be easily extended for any Line of Business (LoB) scenario, workflow, or process and any source system events.
- Integrates with fully-managed cloud services for enabling application to communicate asynchronously through events.
- Supports seamless integration for automation/workflow/business rules requirements.
- Provides recommendations for chain of actions that needs to be executed for the subscribed events using Generative AI.

### SAP HANA Cloud for Application Data

SAP HANA Cloud offers a comprehensive platform combining advanced data management with AI-enhanced applications, each serving distinct but complementary roles in fostering sophisticated and intelligent business solutions.

Along with using SAP HANA Cloud as persistence layer for the application data, the Vector Engine in SAP HANA Cloud manages unstructured data, such as text and images, in high-dimensional embeddings, enhancing AI models with long-term memory and better context. These features enable Retrieval Augmented Generation (RAG), combining LLMs with private business data to create intelligent applications that support automated decision-making and boost developer productivity. For the Generative AI assisted configuration, the vector engine capabilities can be leveraged.

### Private Link Service for secure connectivity

SAP Private Link service is a feature offered by cloud providers like Microsoft Azure and Amazon Web Services (AWS) that allows customers to expose their services in their virtual networks to consumers in other virtual networks or subscriptions. In this architecture, SAP Private Link service allows to securely connect applications running on SAP BTP to SAP workloads running on Hyperscalers(Microsoft Azure or AWS).

## Flow of events in this architecture

Pre-requisites to be configured:
- Extension application based on event-to-business actions framework has to be deployed in SAP Cloud Foundry Runtime with all the configurations for SAP Integration Suite, advanced event mesh, SAP HANA Cloud, SAP Destination Service, SAP Private Link Service/Cloud Connector, Generative AI Hub(optional).
- User with Application Admin role should log into the SAP BTP extension application to configure the business rules/decisions and the business actions that need to be triggered in the business systems.

The following depicts the flow of events in an typical event based business scenario.

1. The events are triggered from source systems like Microsoft Azure, AWS, or Telco IoT Platforms (in the case of IoT scenarios).
2. These events are published on to SAP Integration Suite, advanced event mesh / SAP Event Mesh. As the processor module's (part of the Events-to-Business-Action framework) endpoint subscribes to Event Mesh, the event is received.
3. The processor module, part of the Events-to-Business-Action framework, leverages the **Decisions** capability of SAP Build Process Automation to initiate business actions. For example, Purchase Order Requisition creation in the SAP S/4HANA system based on characteristics of incoming events.
4. The defined action is triggered in the SAP S/4HANA system using the SAP Destination Service and SAP Connectivity service leveraging a cloud connector setup. If SAP S/4HANA and SAP BTP are running on the same Hyperscaler, communication with SAP S/4HANA happens via the SAP Private Link Service.

## Services and Components

Below are the list of services that are must-have to implement this architecture. It also has the list of services that are considered as must-have from best practices perspective.

- **[SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all)**: The SAP BTP, Cloud Foundry runtime lets you develop polyglot cloud-native applications and run them on the SAP BTP Cloud Foundry environment.

- **[SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all)**: SAP Build Process Automation combines capabilities from SAP Workflow Management and SAP Intelligent RPA with a powerful, yet intuitive no-code development experience. SAP Build Process Automation enables business users and technologists to become citizen developers. With powerful yet intuitive low-code and no-code capabilities, the solution supports you in driving automation by tapping into the expertise of citizen developers.

- **[Either SAP Integration Suite, advanced event mesh/ Event Mesh capability of SAP Integration Suite](https://discovery-center.cloud.sap/viewServices?category=integration)**

    - **[SAP Integration Suite, advanced event mesh](https://discovery-center.cloud.sap/serviceCatalog/advanced-event-mesh?region=all)**: This is a complete event streaming, event management, and monitoring platform that incorporates best practices, expertise, and technology for event-driven architecture (EDA) on a single platform.

    - **[Event Mesh capability of SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/event-mesh?region=all)**: This capability can be used if an enterprise applications to communicate through asynchronous events.

-  **[Choose SAP Private Link  Service, if both the platform are on the either Azure/AWS Infrastructure](https://discovery-center.cloud.sap/viewServices?category=security)**

    - **[SAP Connectivity Service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)**: SAP Connectivity service lets you establish connectivity between your cloud applications and on-premise systems running in isolated networks.

    - **[SAP Private Link service](https://discovery-center.cloud.sap/serviceCatalog/private-link-service?service_plan=standard&region=all&commercialModel=cloud)**: SAP Private Link service establishes a private connection between selected SAP BTP services and selected services in your own IaaS provider accounts. By reusing the private link functionality of our partner IaaS providers, it lets you access your services through private network connections to avoid data transfer via the public Internet.

- **[SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region=all)**: SAP HANA Cloud is a database-as-a-service that powers mission-critical applications and real-time analytics with one solution at petabyte scale. Converge relational, graph, spatial, and document store and develop smart applications with embedded machine learning. Process mission-critical data at proven in-memory speed and manage it more efficiently with integrated multi-tier storage.
  
- **[SAP Business Application Studio](https://discovery-center.cloud.sap/serviceCatalog/business-application-studio?region=all)**: SAP Business Application Studio (the next generation of SAP Web IDE) is a powerful and modern development environment, tailored for efficient development of business applications for the Intelligent Enterprise. Available as a cloud service, it provides developers a desktop-like experience similar to market leading IDEs, while accelerating time-to-market with high-productivity development tools such as wizards and templates, graphical editors, quick deployment, and more.

- **[SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all&commercialModel=cloud)**: The Destination service lets you retrieve the backend destination details you need to configure applications in the Cloud Foundry environment.

- **[SAP Build Work Zone, standard edition](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-standard-edition?region=all)**: SAP Build Work Zone, standard edition enables organizations to establish a unified point of access to SAP (e.g. SAP S/4HANA), custom-built, and third party applications and extensions, both on the cloud and on premise. 

- **[SAP Continuous Integration and Delivery service](https://discovery-center.cloud.sap/serviceCatalog/continuous-integration--delivery?region=all)**: SAP Continuous Integration and Delivery lets you configure and run predefined continuous integration and delivery (CI/CD) pipelines that automatically build, test, and deploy your code changes to speed up your development and delivery cycles.

- **[SAP Cloud Transport Management](https://discovery-center.cloud.sap/serviceCatalog/cloud-transport-management?region=all)**: SAP Cloud Transport Management service lets you manage software deliverables between accounts of different environments (such as Cloud Foundry, ABAP, and Neo), by transporting them across various runtimes. This includes application artifacts as well as their respective application-specific content.

- **[SAP HTML5 Application Repository Service for SAP BTP](https://discovery-center.cloud.sap/serviceCatalog/html5-application-repository-service?region=all)**: The HTML5 Application Repository service for SAP BTP enables central storage of HTML5 applications on SAP BTP. The service allows application developers to manage the lifecycle of their HTML5 applications. In runtime, the service enables the consuming application, typically the application router, to access HTML5 application static content in a secure and efficient manner.

- **[SAP Application Logging Service for SAP BTP](https://discovery-center.cloud.sap/serviceCatalog/application-logging-service?region=all)**: The SAP Application Logging service for SAP BTP lets you stream logs of bound Cloud Foundry applications to a central application logging stack. SAP Application Logging service for SAP BTP uses Elastic Stack to store and visualize your application log data.

- **[SAP Authorization and Trust Management service](https://discovery-center.cloud.sap/serviceCatalog/authorization-and-trust-management-service?region=all)**: The SAP Authorization and Trust Management service lets you manage user authorizations and trust to identity providers. Identity providers are the user base for applications. We recommend that you use an IAS identity authentication tenant, an SAP on-premise system, or a custom corporate identity provider.

- **[Application Autoscaler](https://discovery-center.cloud.sap/serviceCatalog/application-autoscaler?service_plan=standard&region=all&commercialModel=cloud)**: Application Autoscaler lets you automatically increase or decrease the number of your application instances based on the policies you have defined.


## Examples
Below are some of the examples and scenarios where this framework has been leveraged to build different business scenarios:
- [“Events-to-Business Actions": An event-driven architecture on SAP BTP to implement Industry 4.0 scenarios with Microsoft Azure Services](https://community.sap.com/t5/technology-blogs-by-sap/part-1-events-to-business-actions-quot-an-event-driven-architecture-on-sap/ba-p/13555219)
- [Events-2-Business Action Framework – Create Plant Maintenance Notification in SAP S/4 HANA](https://community.sap.com/t5/technology-blogs-by-members/events-2-business-action-framework-create-plant-maintenance-notification-in/ba-p/13573476#:~:text=Events%2D2%2DBusiness%20Action%20Framework%20%E2%80%93%20Create%20Plant%20Maintenance%20Notification%20in%20SAP%20S/4%20HANA)
- [Integrate Events from Amazon Monitron with SAP S/4HANA using SAP BTP](https://discovery-center.cloud.sap/missiondetail/4345/4628/)
- [Integrate Amazon Rekognition and SAP EHS for PPE Detection](https://discovery-center.cloud.sap/missiondetail/4352/4635/)


## Resources
For more information related to this reference architecture, you can check out the following resources:

- [SAP Samples | GitHub ](https://github.com/SAP-samples/btp-events-to-business-actions-framework)
- [Build Events-to-Business Actions Apps with SAP BTP and MS Azure/AWS](https://discovery-center.cloud.sap/missiondetail/4172/4422/)
