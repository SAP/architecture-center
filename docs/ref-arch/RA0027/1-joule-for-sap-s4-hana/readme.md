---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0027-1
slug: /ref-arch/4173e60b83/1
sidebar_position: 1
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Joule in SAP S/4HANA Cloud Private Edition and SAP S/4HANA Cloud Public Edition
description: Reference Architectures for Joule and SAP S/4HANA(PCE and Public Cloud)
sidebar_label: Joule in SAP S/4HANA Cloud
keywords: 
- sap
image: img/logo.svg
tags: 
- sap
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - pra1veenk
    - anbazhagan-uma
last_update:
    date: 2025-10-29
    author: pra1veenk 
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->


Joule is designed to facilitate user interactions within the SAP S/4HANA Cloud Private Edition by providing a navigational pattern that directs users to relevant SAP Fiori Apps. This integration supports various core applications, including Procurement, Finance, Sales, and Service Management, allowing users to perform tasks such as creating purchase orders and uploading supplier invoices.

This architecture page focuses on Joule integration with SAP S/4HANA cloud private edition and SAP S/4HANA Public Cloud. It provides business users with a conversational interface directly within their SAP Fiori Launchpad to query data and execute transactional tasks securely.

## Key Capabilities and Benefits

• Conversational AI: Allows users to interact with SAP S/4HANA using natural language, reducing training time and increasing efficiency. 

• Transactional Execution: Goes beyond simple Q&A. Joule can execute tasks like creating purchase orders and checking sales order status, provided the underlying OData services are active.

• Secure & Context-Aware: The integration fully respects SAP S/4HANA authorizations. Principal Propagation ensures users can only see data and perform actions they are already authorized for.

• Accelerated Setup: A dedicated BTP Booster ("Joule – End-to-End Setup Guide") automates much of the complex BTP configuration, including service instance creation, Cloud Foundry enablement, and destination setup.

## Joule in SAP S/4HANA Cloud Private Edition

This solution is exclusively available for RISE with SAP customers and relies on the SAP Business Technology Platform (BTP) as the central integration and service hub. With the latest release, Joule supports the Conversational Search Filter capability, Transactional capabilities, Navigational capabilities to help users find their desired functionality.

For a full list of supported scenarios, please refer to [conversational patterns](https://help.sap.com/docs/joule/capabilities-guide/joule-in-sap-s-4hana-cloud-private-edition). 

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/joule-s4pce.drawio)

The solution architecture consists of the following parts:

- SAP S/4HANA Cloud Private Edition: The target ERP system.

     - Release: Must be 2021 or later. Note that specific Joule capabilities are release-dependent.
     - UI5 Version: The system must meet minimum UI5 patch levels (e.g., Release 2023 requires 1.120.0 or higher; 2022 requires 1.108.33 or higher).
     - OData Services: Specific transactional capabilities (like creating a PO) require corresponding OData services to be activated in the backend.

- SAP Business Technology Platform (BTP): The central integration and extensibility platform. It hosts the following key services:

    - Joule Service: The core AI copilot service (entitlement: foundation plan).
    - SAP Build Work Zone, standard edition: Provides the Fiori Launchpad site that surfaces the Joule UI (entitlement: foundation plan).
    - SAP Cloud Identity Services:
        § Identity Authentication (IAS): Acts as the identity provider, establishing trust and enabling SSO.
        § Identity Provisioning (IPS): Uses the connectivity (application) plan to sync users and roles from S/4HANA PCE to the BTP subaccount.
    - Cloud Foundry: Must be enabled in the BTP subaccount (e.g., Standard plan) to run the integration services. 

-  Cloud Connector: The secure-tunnel software agent that connects the SAP BTP subaccount to the SAP S/4HANA PCE system (in its private data center) without opening a firewall.

Note: For more information on how to access Joule and follow the detailed steps for the activation process in the [Joule for SAP S/4HANA Cloud Private Edition – A Comprehensive Setup Guide](https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-sap/joule-for-sap-s-4hana-cloud-private-edition-a-comprehensive-setup-guide/ba-p/13786453).

## Joule in SAP S/4HANA Cloud Public Edition

Joule is natively integrated into the SAP S/4HANA Cloud Public Edition, providing users with seamless access to its capabilities directly within the SAP Fiori Launchpad. This integration allows users to leverage Joule's conversational AI features without the need for additional configurations or setups.

With the current release, you can use Joule for:

- Quick Navigation: Find and quickly navigate to applications for your next task.
- Instant Insights: Get fast insights on critical business data, such as purchase orders and outbound deliveries.
- Receiving Help: For those needing help, Joule summarizes relevant enablement content and guides users to it, speeding up task completion.

List of Business Objects Enabled for Joule in SAP S/4HANA Cloud Public Edition - [3545050](https://me.sap.com/notes/3545050)

## Architecture

The architecture describes the Services and Communications used for Joule and how we are going to activate Joule. Architecture is going to be similar for most of the Joule setup with few changes as required.

![drawio](drawio/joule-s4-public-cloud.drawio)

Note: The Joule setup must be done for each tenant as they cannot be transported. Please review the official help documentation if required.

Note: For more information on how to access Joule and follow the detailed steps for the activation process in the [Joule in SAP S/4HANA Cloud Public Edition – Setup Guide](https://community.sap.com/t5/technology-blog-posts-by-sap/joule-in-sap-s-4hana-cloud-public-edition-setup-guide/ba-p/13965333)

## Resources

<!-- Add your resources here -->

- [Joule – SAP Product Overview](https://www.sap.com/products/artificial-intelligence/joule.html)
- [Joule for SAP S/4HANA Cloud, private edition – SAP Community Blog](https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-sap/joule-for-sap-s-4hana-cloud-private-edition-a-comprehensive-setup-guide/ba-p/13786453)
- [Navigational and Transactional capabilities with Joule in SAP S/4HANA Cloud Private Edition](https://me.sap.com/notes/3523238)

## Related Missions


<!-- Add related missions here -->
