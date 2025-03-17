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
  |