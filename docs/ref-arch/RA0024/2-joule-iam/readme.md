---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0027-2
slug: /ref-arch/06ff6062dc/2
sidebar_position: 2
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Identity and Access Management for SAP Joule
description: >-
  This reference architecture describes the IAM related flows for SAP Joule with SAP Build Work Zone and via the SAP Cloud Identity Services.
keywords:
  - sap
  - joule
  - ai
  - identity authentication
  - cloud identity lifecycle
  - erp security solutions
  - access management
sidebar_label: Joule and IAM
image: img/logo.svg
tags: 
  - genai
  - agents
  - build
  - appdev
  - security
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
   - sapgunnar
   - gunnar-kosche_sap
last_update:
    date: 2025-09-22
    author: fabianleh
############################################################
#                   End of Front Matter                    #
############################################################
---

This architecture page focuses on Identity and Access Management (IAM) for SAP Business AI and SAP Joule. The key advantage of integrating AI is enabling users to leverage cross-domain capabilities, connecting processes and data across multiple business applications. Achieving this requires a robust architecture with comprehensive cybersecurity and IAM features. Note that this approach may differ from traditional project and customer landscapes, where user and access management were typically handled separately for each business application.

## Architecture

![drawio](drawio/public-sap-iam-joule-sd.drawio)

The reference architectures highlight the main capabilities and core Hub services available for SAP business applications. SAP Business AI serves as the central platform for AI features, while SAP Joule provides the conversational AI interface. For Identity and Access Management (IAM), SAP Cloud Identity Services are the standard and required solution. SAP Joule relies on these services, using SAP Cloud Identity Services as its user store, which can be shared with other SAP cloud applications through replication or direct access.

To enable SAP Business AI and SAP Joule to interact with multiple SAP business applications, a cross-application IAM setup is needed. This setup is established when the first application integrates with SAP Joule, and subsequent applications can reuse these foundational patterns.

As with other SAP applications that use decentralized user stores, it is essential to create users in the SAP Joule user store within SAP Cloud Identity Services.

SAP Joule primarily uses the OpenID Connect (OIDC) protocol for integration, which is the recommended approach for connecting Joule Functions, though other methods are also supported.

SAP Joule uses SAP Build Work Zone for navigation across applications.

### Flow

#### Setup and during Designtime

The SAP Joule help page describes how to initially setup the application.

In this IAM related architecture we describe and highlight the important details. The flow is split in two ways #1 exposing content mapped to a rolename and #2 the user to role assignment during the session.

Common Data Model (CDM)

- SAP business applications provide content using the "[Common Data Model" (CDM)](https://github.com/SAP/common-data-model/blob/main/README.md). In this setup, the CDM defines which content—such as Joule Functions—is available and maps each item to a specific role name that grants access. This configuration is managed within the application settings. Originally introduced for SAP Build Work Zone integrations, the CDM enables clear assignment of content to roles and supports seamless navigation across applications.

This is shown in the following diagram:

![drawio](drawio/public-sap-iam-joule-sd-cdm.drawio)

#### Identity Access Management (IAM)

- Each user must be created in the SAP Cloud Identity Services - Identity Directory. This central user store can be managed through the web UI, the IdDS API, or by uploading a file.
  - When a user is created, a **Global User ID** is generated (unless a specific value is provided). This Global User ID is essential for linking user identities across different SAP applications and services.

The following diagram illustrates how user information and the Global User ID are distributed:

![drawio](drawio/public-sap-iam-joule-sd-user.drawio)

- Typically, the user already exists but must also be created in the SAP application, ensuring the Global User ID is set (either automatically via Identity Provisioning Service (IPS) and the SCIM protocol, or manually, depending on the application).
- SAP business applications provide user-role assignment APIs, usually based on SCIM 2.0. SAP Cloud Identity Services use the Identity Provisioning Service to synchronize user and role data from the application and update user-role assignments in SAP Build Work Zone.
- SAP Joule should be set up (using the recommended Booster) and integrated with SAP Cloud Identity Services.

The following diagram shows example IPS flows for replicating users and role assignments from each application.

![drawio](drawio/public-sap-iam-joule-sd-authz.drawio)

#### Runtime

Log-in to SAP Joule.

- The user access SAP Joule.
- SAP Joule does not have an active session and redirects the authentication to the connected SAP Cloud Identity Authentication Service.
- A common scenario would now redirect the authentication attempt to a 3rd party corporate Identity Provider.
- After successful login the SAP Cloud Identity Authentication Service creates an OIDC access token (simplified approach) for SAP Joule.
- SAP Joule leverages now the SAP Build Work Zone Navigation Service to combine the logged in user with the stored user-role assignments and the role-content definition to understand which Joule Function this user during this session can use.

Performing a call

- The logged in user asked SAP Joule something which invokes a Joule Function the user has access to for an application.
- SAP Joule leverages the SAP BTP Destination Service to call the Joule Function / API in the name of the user (Principal Propagation).
  - The SAP BTP Destination Service exchanges the user access token from SAP Joule with the SAP Cloud Identity Authentication Service. This exchange provides a proper token for the application to call the Joule Function.
  - The SAP Joule calls the respective API and receives a response based on the user access.
- SAP Joule answers with the received data.

The authentication-flow

![drawio](drawio/public-sap-iam-joule-sd-authn.drawio)

### Characteristics

This setup has the following characteristics:

- SAP Joule leverages the SAP Cloud Identity Services for IAM, SAP Build Work Zone for Navigation and SAP BTP Connectivity.
- SAP Joule setup is across SAP applications.

IAM:

- One Authentication interface for all SAP applications via the SAP Cloud Identity Services - Identity Authentication
- Preconfigured trusts between the SAP Cloud Identity Services and the SAP Cloud applications
- Resource Provider initiated and Service Provider initiated SAML and OIDC flows are supported. An Identity Provider initiated SAML flow is technically supported but not the default or recommendation.
- The Central user store - SAP Cloud Identity Services - Identity Directory - is used to store the user identities and their assignments which allows the merge of attributes during the authentication flow into the tokens e.g. groups can be mapped from the IdDS to the application token.
- Technically the IAS terminates the authentication flow and creates a new token for the application.

## Services and Components

- [SAP Joule - initial setup](https://help.sap.com/docs/joule/integrating-joule-with-sap/initial-setup)
- [SAP Build Work Zone - standard edition](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/initial-setup)
- [SAP Build Work Zone - advanced edition](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/initial-setup-and-concepts)
- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?service_plan=sap-cloud-to-sap-cloud&region=all&commercialModel=cloud)
- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)

## Resources


- [SAP Cloud Identity Services](https://help.sap.com/docs/cloud-identity?version=Cloud&locale=en-US)
- [SAP Secure Login Service for SAP GUI](https://help.sap.com/sls)
- [SAP Common Data Model](https://github.com/SAP/common-data-model/blob/main/README.md)
- [SAP Build Work Zone- About the Common Data Model](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/creating-cdm-json-file-for-multi-tenancy-html5-app)
