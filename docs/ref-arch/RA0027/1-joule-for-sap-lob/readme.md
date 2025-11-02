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
title: Joule for SAP S/4HANA Cloud Private Edition and SAP S/4HANA Public Cloud
description: Reference Architectures for Joule and SAP S/4HANA(PCE and Public Cloud)
sidebar_label: Joule for SAP S/4HANA
keywords: 
- sap
image: img/logo.svg
tags: 
- sap
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
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

Joule for SAP S/4HANA is SAP's generative AI copilot designed to enhance user productivity and streamline interactions with SAP S/4HANA systems.

This architecture page focuses on Joule integration with SAP S/4HANA cloud private edition and SAP S/4HANA Public Cloud. It provides business users with a conversational interface directly within their SAP Fiori Launchpad to query data and execute transactional tasks securely.

## Key Capabilities and Benefits

    • Conversational AI: Allows users to interact with SAP S/4HANA using natural language, reducing training time and increasing efficiency. 

    • Transactional Execution: Goes beyond simple Q&A. Joule can execute tasks like creating purchase orders and checking sales order status, provided the underlying OData services are active.

    • Secure & Context-Aware: The integration fully respects SAP S/4HANA authorizations. Principal Propagation ensures users can only see data and perform actions they are already authorized for.

    • Accelerated Setup: A dedicated BTP Booster ("Joule – End-to-End Setup Guide") automates much of the complex BTP configuration, including service instance creation, Cloud Foundry enablement, and destination setup.

## Joule for SAP S/4HANA cloud private edition

This solution is exclusively available for RISE with SAP customers and relies on the SAP Business Technology Platform (BTP) as the central integration and service hub.With the latest release, Joule supports the Conversational Search Filter capability, Transactional capabilities, Navigational capabilities to help users find their desired functionality.

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

- SAP Cloud Connector: The secure-tunnel software agent that connects the BTP subaccount (in the cloud) to the S/4HANA PCE system (in its private data center) without opening a firewall.


The solution is to enable SAP Joule in the SAP S/4HANA Cloud Private Edition Fiori Launchpad. This is achieved by connecting the SAP S/4HANA PCE system to the Joule service on the SAP Business Technology Platform (BTP).
Using the Cloud Connector, a secure channel is established between the BTP subcount and the private SAP S/4HANA system. SAP BTP services, configured via an automated Booster, handle the service integration. SAP Cloud Identity Services (both Identity Authentication and Identity Provisioning) manage the single sign-on (SSO), user context, and user synchronization.



## Joule for SAP S/4HANA public cloud



## Resources

<!-- Add your resources here -->

- [Joule – SAP Product Overview](https://www.sap.com/products/artificial-intelligence/joule.html)
- [Joule for SAP S/4HANA Cloud, private edition – SAP Community Blog](https://community.sap.com/t5/enterprise-resource-planning-blog-posts-by-sap/joule-for-sap-s-4hana-cloud-private-edition-a-comprehensive-setup-guide/ba-p/13786453)
- [Navigational and Transactional capabilities with Joule in SAP S/4HANA Cloud Private Edition](https://me.sap.com/notes/3523238)

## Related Missions


<!-- Add related missions here -->
