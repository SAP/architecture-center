---
id: id-ra0007-5
slug: /ref-arch/e7724ef4a7/5
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Cost of Ownership
description: Cost of Ownership
keywords:
  - sap
  - btp
  - multitenant
  - saas
  - cap
sidebar_label: Cost of Ownership
image: img/logo.svg
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

As businesses increasingly move towards cloud-based solutions, multitenant architectures are becoming more popular due to their scalability, efficiency, and cost-effectiveness. However, understanding the cost of ownership for a multitenant application is crucial for making informed decisions. In simpler terms, total cost of ownership is the sum of all costs associated with owning and operating the application over its lifecycle.  

It may include the following costs:
  - **Platform Costs**: The cost of the underlying infrastructure, such as servers, storage, and networking, required to run the application.
  - **Development Costs**: The cost of developing the application, including design, coding, testing, and deployment.
  - **Maintenance Costs**: The cost of maintaining the application, including updates, patches, and bug fixes.
  - **Licensing Costs**: The cost of licensing software, libraries, and tools used to develop, deploy, and run the application.

The costs may not be limited to the above categories and may vary depending on the specific requirements of the application and business. 

## Platform Costs Calculation
This section will outline a high-level overview about the calculation of platform costs involved in running a multitenant application on SAP BTP. We will illustrate this with an example and calculate the expenses for running a multitenant application.

**Example Scenario**: To estimate costs, we will refer to the sample application [Sustainable SaaS (SusaaS)](https://github.com/SAP-samples/btp-cap-multitenant-saas). This sample repository demonstrates how to create and manage multitenant applications using CAP model on the SAP BTP. It provides sample code, best practices, and architectural guidelines for building and deploying SaaS applications that can support multiple tenants efficiently and securely. The repository includes examples of tenant management, data separation, and application provisioning.

The Basic version of this sample application provides foundational elements for creating and running a multitenant application on SAP BTP. If you want to explore the basic version features and functionalities, you can refer to the detailed documentation [here](https://github.com/SAP-samples/btp-cap-multitenant-saas/blob/main/docu/2-basic/0-introduction-basic-version/README.md#2-version-features).

:::info
The below sections provides an rough estimate of the platform costs associated with running the sample application on cloud foundry or kyma environment. The costs may vary depending on the specific requirements of the application and business.
:::

- ### Cloud Foundry Environment
  In the Cloud Foundry environment, multiple services are utilized to operate the sample multitenant application, each with specific configurations and associated costs. To determine the platform expenses, we account for the configuration of each service and the anticipated number of tenants the application will support.

  For calculation, service configurations are determined based on the following assumptions:
  - The sample application is required to support 10 tenants (application consumers / customers). No of users can be more. 
  - The sample application requires 2 GB of memory. However we have considered 4 GB of memory on average to accommodate the scaling of the application based on usage.
  - 10000 API calls are considered for the Alert Notification service to accommodate all 10 tenants.
  - 10 records are considered for the Credential Store to store the tenant specific data.
  - The SAP HANA Cloud configuration is based on an estimated requirement of less than 1 GB of storage per tenant per month. Therefore, a minimum configuration of SAP HANA Cloud is sufficient to support 10 tenants initially.

  The following services are used in the Cloud Foundry environment to run the basic version of sample application:

  |BTP Service (Plan)|Configuration	| SAP BTPEA|Pay-As-You-Go|
  |-----------------------------------------------|---------------|--------------:|--------------:|
  |Application Autoscaler (Standard)              |               |         0.00 €|	        0.00 €|
  |Destination Service (Lite)                     |	              |         0.00 €|	        0.00 €|
  |SAP Alert Notification service	                |10000 API Calls|	       12.50 €|        16.20 €|
  |SAP Authorization and Trust Management Service |               |         0.00 €|         0.00 €|
  |SAP BTP, Cloud Foundry Runtime                 |	4 GB          |	      340.00 €|	      442.00 €|
  |SAP Cloud Management Service	                  |               |	        0.00 €|	        0.00 €|
  |SAP Credential Store	                          |10 Records     |        10.00 €|        13.00 €|
  |SAP HTML5 Application Repository Service       |               |		      0.00 €|	        0.00 €|
  |SAP Software-as-a-Service Provisioning service |	              |	        0.00 €|	        0.00 €|
  |SAP	HANA Cloud                                |32GB Memory    |	      663.75 €|	      858.45 €|
  |SAP Service Manager	                          |               |	        0.00 €|	        0.00 €|
  |SAP Cloud Logging                              |               |       538.00 €|       699.40 €|
  |**Total**                                      |               | **1,564.25 €**| **2,029.05 €**|
  |**Cost per Tenant** (No of Tenants: 10)        |               |   **156.65 €**|   **202.90 €**|

  :::warning Important Note
  The above cost estimates for services were calculated using the [Service Estimator](https://discovery-center.cloud.sap/estimator/) as of October 29, 2024. For the most current pricing information, please refer to the details of services on [Discovery Center](https://discovery-center.cloud.sap/viewServices) and utilize the [Service Estimator](https://discovery-center.cloud.sap/estimator/) to tailor cost estimates to your specific needs.
  :::

  Based on previously mentioned assumptions, for the Basic Version of the sample application, the estimated platform costs for operating in the Cloud Foundry environment are approximately 1,564.25 € under the BTPEA commercial model and 2,029.05 € under the Pay-As-You-Go model. Given that this configuration supports 10 tenants, the effective cost per tenant is 156.65 € for the BTPEA model and 202.90 € for the Pay-As-You-Go model.

- ### Kyma Environment
  In the Kyma environment, multiple services are utilized to operate the sample multitenant application, each with specific configurations and associated costs. To determine the platform expenses, we account for the configuration of each service and the anticipated number of tenants the application will support.

  For calculation, service configurations are determined based on the following assumptions:
  - The sample application is required to support 10 tenants (application consumers / customers). No of users can be more. 
  - The sample application requires 2 GB of memory. However we have default 8 GB of memory of Kyma with base configuration.
  - 10000 API calls are considered for the Alert Notification service to accommodate all 10 tenants.
  - The SAP HANA Cloud configuration is based on an estimated requirement of less than 1 GB of storage per tenant per month. Therefore, a minimum configuration of SAP HANA Cloud is sufficient to support 10 tenants initially. 

  The following services are used in the Kyma environment to run the basic version of sample application:

  |BTP Service (Plan)|Configuration	| SAP BTPEA|Pay-As-You-Go|
  |---|---|---:|---:|
  |Destination Service (Lite)                     |	                  |         0.00 €|	        0.00 €|
  |SAP Alert Notification service	                |10000 API Calls    |	       12.50 €|        16.20 €|
  |SAP Authorization and Trust Management Service |                   |         0.00 €|         0.00 €|
  |SAP BTP, Kyma runtime	                        |Base Configuration |	      845.00 €|	    1,098.50 €|	
  |SAP Cloud Management Service	                  |                   |	        0.00 €|	        0.00 €|	
  |SAP Credential Store	                          |10 Records         |	        0.00 €|        13.00 €|
  |SAP HTML5 Application Repository Service	      |                   |		      0.00 €|	        0.00 €|
  |SAP Software-as-a-Service Provisioning service |                   |	        0.00 €|	        0.00 €|
  |SAP HANA Cloud                                 |32GB Memory        |	      663.75 €|	      858.45 €|
  |SAP Service Manager	                          |                   |	        0.00 €|	        0.00 €|	
  |SAP Cloud Logging                              |                   |		    538.00 €|       699.40 €|
  |**Total**                                      |                   | **2,059.25 €**| **2,685.55 €**|
  |**Cost per Tenant** (No of Tenants: 10)        |                   |   **205.95 €**|   **268.50 €**|

  :::warning Important Note
  The above cost estimates for services were calculated using the [Service Estimator](https://discovery-center.cloud.sap/estimator/) as of October 29, 2024. For the most current pricing information, please refer to the details of services on [Discovery Center](https://discovery-center.cloud.sap/viewServices) and utilize the [Service Estimator](https://discovery-center.cloud.sap/estimator/) to tailor cost estimates to your specific needs.
  :::

  Based on previously mentioned assumptions, for the Basic Version of the sample application, the estimated platform costs for operating in the Kyma environment are approximately 2,059.25 € under the BTPEA commercial model and 2,685.55 € under the Pay-As-You-Go model. Given that this configuration supports 10 tenants, the effective cost per tenant is 205.95 € for the BTPEA model and 268.50 € for the Pay-As-You-Go model.

- ### Analysis for SAP HANA Cloud 
  In above calculations, we have considered the 32GB of Memory configuration for SAP HANA Cloud to support 10 tenants. However,  it's important to recognize that sizing requirements can change over time due to evolving data generation and storage needs of the application. Let's analyze and compare the cost of SAP HANA Cloud under different data growth scenarios.

  |Application generates 1GB of data per month per tenant|Application generates 0.5GB of data per month per tenant|
  |:---:|:---:|
  |![1GB_5Tenants](./images/shc-1gb-5.png)<br/> 5 Tenants|![0.5GB_5Tenants](./images/shc-0-5gb-5.png)<br/> 5 Tenants|
  |![1GB_10Tenants](./images/shc-1gb-10.png)<br/> 10 Tenants|![5GB_10Tenants](./images/shc-0-5gb-10.png)<br/> 10 Tenants|
  |![1GB_25Tenants](./images/shc-1gb-25.png)<br/> 25 Tenants|![5GB_20Tenants](./images/shc-0-5gb-25.png)<br/> 25 Tenants|

  The graphs above illustrate a comparative analysis of the cost of SAP HANA Cloud for supporting 5, 10, and 25 tenants with data generation rates of 1 GB and 0.5 GB per month over a 2-year period, expressed in capacity units. It is important to note that the calculations and graph plotting are based on the assumption that data growth occurs linearly and consistently each month throughout the 2-year period and all tenants or consumers acquired at the beginning of the calculation period.
  
  Observations:   
  - The initial investment for SAP HANA Cloud is lower for multitenant applications, but costs increase over time based on data growth.
  - Multitenant applications that generate less data can be more cost-effective.
  - The cost of SAP HANA Cloud can be optimized by monitoring data growth and adjusting the configuration based on actual requirements when needed.
  - Implementing data retention policies and data archiving strategies is crucial to control data growth and, consequently, costs.
  - Storage of vector data directly and proportionally impacts data growth in SAP HANA Cloud. If a multitenant application has GenAI capabilities that require storing embeddings in SAP HANA Cloud, the storage requirements can significantly increase, leading to higher costs.