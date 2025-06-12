---
id: id-ra0007-4
slug: /ref-arch/d31bedf420/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Reference Architecture
description: Reference Architecture
keywords:
  - sap
  - multitenant applications
  - scalable saas solutions
  - btp reference models
sidebar_label: Reference Architecture
image: img/ac-soc-med.png
tags:
  - appdev
  - cap
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - AjitKP91
  - alperdedeoglu
discussion: 
last_update:
  author: Ajit Kumar Panda
  date: 2025-01-31
---

[Multitenancy](../readme.md#overview) is an important architectural concept used in SaaS application development in which a single instance of an application serves multiple customers (tenants). Multiple customers share computing resources that are logically separated. Each tenant is logically separated and operates as if they have their own isolated environment, even though they share the same underlying resources, such as the application itself, databases, and infrastructure.

This reference architecture is a comprehensive architecture designed to guide developers, partners, and customers in building multitenant SaaS applications using the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/). This demonstrates the development and deployment of a multitenant application on SAP BTP with integration to multiple BTP services and business systems like SAP S/4HANA leveraging both Cloud Foundry and Kyma runtimes.

## Architecture

![drawio](drawio/susaas-app-architecture.drawio)

### Key Services and Components

The following sections describe the essential components and services that form the architecture.

-   #### Cloud Application Programming Model (CAP)
    The [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/) is a framework of languages, libraries, and tools for building enterprise-grade services and applications. It supports Java (with Spring Boot), JavaScript, and TypeScript (with Node.js), which are some of the most widely adopted languages.
    CAP is recommended by the [SAP BTP Developer's Guide](https://help.sap.com/docs/btp/btp-developers-guide/), guides developers along a path of proven best practices and a great wealth of out-of-the-box solutions to recurring tasks. CAP has built-in support for multitenancy with the MTXs package.

    ##### [@sap/cds-mtxs package](https://www.npmjs.com/package/@sap/cds-mtxs)
    - It provides a set of services that implement multitenancy, features toggles, and extensibility (‘MTX’ stands for these three features). 
    - It offers an easy way to integrate dependent services such as SAP SaaS Provisioning Service, SAP Service Manager, User Account and Authentication Service etc. into the CAP application. 
    - CAP includes these MTX services, which provide out-of-the-box handlers for subscribe/unsubscribe events, for example to manage SAP HANA database containers.
    - Also supports addition of custom logic within handlers of for subscribe/unsubscribe events. For example, you can create custom handlers to manage the subscribe events, such as creating a destination for connecting to business systems like SAP S/4HANA, assigning roles, setting up routes in Cloud Foundry, defining api rules in Kyma, or creating SAP BTP service instances.

    In the provided Reference Architecture, CAP serves as the central hub for application and domain logic, providing multitenancy, interacting with SAP Solutions (Cloud or On-Premise), 3rd party applications, and managing data sources such as SAP HANA Cloud. 

-   #### Standalone App Router vs SAP Build WorkZone, Standard Edition
    _Guidance and TradeOffs To be updated based on Analysis_
-   #### SAP Software-as-a-Service Provisioning Service
    SAP Software-as-a-Service Provisioning service helps manage and automate the subscription lifecycle of multitenant applications on SAP BTP. It provides apis for registering, subscribing, and managing SaaS applications and tenants. Key feature of the service includes:
    - Subscription Management: enables subscribing and unsubscribing tenants to multitenant applications and services.
    - Registration Details: retrieves details of registered multitenant applications.
    - Subscription Information: provides information on current subscriptions, including tenant ids and dependencies.
    - Dependency Management: allows updating services that a multitenant application depends on.
    - Job Information: tracks the status of subscription-related operations, like subscribing, unsubscribing, or updating dependencies. In short, this service manages the lifecycle of multitenant applications, including tenant subscription, registration, dependency updates, and related job status tracking.

    The SaaS provider deploys the multitenant application to the provider subaccount. The application is then registered with the SAP Software-as-a-Service Provisioning service, which makes the application available in service marketplace for subscription from consumer subaccount. Subsequently the consumer subaccounts subscribe to the SaaS application.

-   #### Custom Domain Service
    The SAP Custom Domain service allows you to configure a custom domain for your application, enabling you to publicly expose it under your own domain name instead of the default subdomain. By using this service, subaccount owners can make their SAP BTP applications accessible via a custom domain that is different from the default "hana.ondemand.com", for example - "mysaasshop.com". For more information on features of this service, refer to the [SAP Custom Domain service features documentation](https://help.sap.com/docs/custom-domain/custom-domain-manager/what-is-custom-domain#features)

-   #### API Service Broker
    Service Broker acts as an intermediary between a platform and a service provider. It is responsible for advertising a catalog of service offerings and service plans to the platform. It also handle the provisioning, binding, unbinding, and deprovisioning of service instances in a standardized way such as [Open Service Broker API (OSBAPI)](https://github.com/openservicebrokerapi/servicebroker). 
    
    In the provided reference architecture, a Node.js based api broker application is deployed using _*@sap/sbf*_ npm package that acts as a Service Broker with OSBAPI based interface. It used the This Service Broker needs to be registered in each consumer subaccount which can be automated during subscription of SaaS application. For more information this topic, refer to the documentation: [Deep Dive into Service Brokers](https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/f207ade3654574dd2fd34196656bedc1a74a7a4d/docu/2-basic/7-explore-the-components/components/ServiceBrokers.md#36-registering-to-service-broker)

    :::info @sap/sbf
    A Node.js framework to create a service broker in SAP Business Technology Platform (SAP BTP)

    The Service Broker Framework (SBF) implements the Open Service Broker API. It can be used in the Cloud Foundry Kyma environments of SAP BTP. SBF can generate service credentials using XSUAA broker plan.
    :::

## Workflows

This [reference architecture](./readme.md#architecture) supports both multitenant SaaS application and SaaS Service api workflows. For this context, we will define a SaaS application as a fully functional software solution with a dedicated user interface that allows application users to perform tasks, manage data, or execute business processes. A SaaS Service api, on the other hand, is an interface that enables external systems, applications, or services to interact programmatically with the SaaS application.

### SaaS Application Flow   
- For each customer, a subaccount (consumer subaccount) is created, and an instance of the SaaS application is subscribed, triggering the subscription process via SAP SaaS Provisioning Service.   
- During this process, the CAP framework creates a HANA HDI container instance via the SAP Service Manager, which can be extended with creation of specific services or components of the SaaS application, such as identity provider instance integration or SaaS Service api broker registration. Upon successful subscription, a unique  URL is provided for each customer.     
- As part of the application setup, destinations can be configured in the consumer subaccount to connect to SAP systems or third-party systems, if needed. Additionally, one consumer admin user is added by the SaaS provider, who can then add more users and assign roles as needed for accessing the SaaS application.    
- Users can access the SaaS application via the unique URL, which redirects them for authentication to cloud identity services. Once logged in, the SaaS application (UI component) is loaded based on the user's authorization.    
- In the SaaS application, data is loaded from the CAP based SaaS business application service, which retrieves data from the HANA HDI container instance created during subscription, as well as from SAP systems or third-party systems using destinations configured in the consumer subaccount via the Destination Service. Additionally, SaaS business application service handles all the business process related functionalities.     

### SaaS Service API Flow    
- The Service Broker is automatically registered in the consumer subaccount during the subscription/provisioning process. Note that roles can be assigned and/or features can be enabled/disabled according to the plans of service defined in api broker.   
- Then, a new Service Binding is created which will provide necessary credentials to call CAP based SaaS API service that can be used by API clients. It allows consumers to interact programmatically with their data stored in specific HDI containers. Additionally, SaaS API Service can handle business related functionalities as well. 
- Depending on the plan, different API policies, such as rate limiting, maximum body content, and quota policies, can be applied using the [SAP API Management capability of the SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/api-management-capability) on SAP BTP.
- This also allows to push business data from SAP systems such as SAP S/4HANA to the multitenant SaaS application.

<!-- ## Characteristics

-   **Multitenancy**: CAP has built-in support for multitenancy with [@sap/cds-mtxs](https://www.npmjs.com/package/@sap/cds-mtxs) package. This package facilitates handling subscribe/unsubscribe events from the SAP BTP SaaS provisioning Service, and also manages SAP HANA database containers by connecting to the SAP Service Manager.

-   **Consumer Extensibility**: Consumer-driven customization enhances customer experience and satisfaction by offering tailored extensibility. CAP incorporates built-in extension capabilities that enable SaaS consumers to seamlessly integrate additional functionalities and custom extensions according to their specific requirements. This enhances flexibility and adaptability, ensuring that the SaaS solution efficiently meets diverse business needs.

-   **User Management**: Central User Management using Identity Authentication Service (IAS) for a multi-tenant SaaS application provides streamlined user and role management, enhances security through robust authentication, and simplifies the integration with SAP BTP, ensuring a more efficient and secure user management process. This makes your solution independent from SAP ID Service, which requires users of your SaaS consumers to sign up for an SAP-managed user account

-   **API Service Broker**: the service broker is responsible of creating SaaS API service instances in the Subscriber Subaccounts. Using these service instances, subscribers can then create so called service bindings, providing them with Client Credentials to interact with the SaaS API. Service Brokers facilitate secure access control and role management, ensuring secure multi-tenant environment and access to customer data.

-   **Custom Domain**: it enhances brand identity by using personalized URLs, improves user trust and experience. Additionally, custom domains offer more flexibility and control over domain management and security settings. 


## Examples in an SAP context

SAP Partners use SAP BTP to create specialized SaaS solutions for various industries. This reference architecture helps ensure their cloud applications are scalable, secure, and efficient. It includes guidelines for security, data management, and integrating with other systems, which speeds up development and improves operations. Following this approach, SAP Partners may offer high-quality SaaS solutions tailored to each industry's needs, addressing specific business challenges in today's dynamic market.

Additionally, the multitenant architecture introduced here is utilized in [Circelligence by BCG](https://store.sap.com/dcp/en/product/display-2001014822_live_v1/circelligence-by-bcg). Circelligence by BCG, a partner product, uses this architecture to measure how products are used by its customers.

-->

## Resources
-   [SAP Cloud Application Programming Model](https://cap.cloud.sap/docs/) and [Multitenancy](https://cap.cloud.sap/docs/guides/multitenancy/)
-   [Reference Application : SAP Samples | GitHub ](https://github.com/SAP-samples/btp-cap-multitenant-saas/tree/main)
-   [Developing Multitenant Applications in the Cloud Foundry Environment](https://help.sap.com/docs/btp/sap-business-technology-platform/developing-multitenant-applications-in-cloud-foundry-environment)
-   [Configuring Custom Domains](https://help.sap.com/docs/custom-domain/custom-domain-manager/configuring-custom-domains)
-   [Connect Cloud Foundry with SAP API Management](https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/f207ade3654574dd2fd34196656bedc1a74a7a4d/docu/3-advanced/4-cf-integrate-api-management/README.md)
-   [Integrate Kyma with SAP API Management](https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/f207ade3654574dd2fd34196656bedc1a74a7a4d/docu/3-advanced/4-kyma-integrate-api-management/README.md)

## Related Missions

-   [Develop a multitenant SaaS application on SAP BTP using CAP](https://discovery-center.cloud.sap/missiondetail/4064/)
-   [Develop a CAP-based (multitenant) application using GenAI and RAG](https://discovery-center.cloud.sap/missiondetail/4371/)