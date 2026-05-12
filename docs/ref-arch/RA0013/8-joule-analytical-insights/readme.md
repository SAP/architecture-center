---
id: id-ra0013-8
slug: /ref-arch/f5b6b597a6/8
sidebar_position: 8
title: Analytical Insights in Joule 
description: >-
 Reference Architecture for bringing analytical insights in Joule for SAP BDC using SAP Analytics Cloud JustAsk AI Service.
keywords:
  - sap business data cloud
  - sap ai core
  - joule 
  - analytics
sidebar_label: Analytical Insights in Joule
tags:
  - data
  - genai
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - gpuntoancona, anbazhagan-uma
last_update:
  author: gpuntoancona, anbazhagan-uma
  date: 2026-05-05
---

### Overview

Joule is a conversational, generative AI copilot embedded in SAP Analytics Cloud, designed to boost analytics and planning productivity directly within the user interface.

Joule's objective is to deliver a comprehensive library of skills and agents across SAP Cloud applications to enhance the user experience and efficiency for key business personas. When it comes to data related, Joule support Analytical insights from SAP Analytics Cloud and SAP BDC via JustAsk AI service.

### User Interactions in SAP SAC with Joule 

**Analytical**
Joule enables users to ask analytical questions using natural language. It leverages the Just Ask LLM in SAP Analytics Cloud to generate data-driven insights. Users can query data from live (BDC/DSP/SAC) analytical models or acquired models to explore and analyze business data.

**Informational**
Joule provides knowledge-based responses to informational queries. It retrieves relevant information from SAP Help Documentation across SAP cloud applications. 

**Functional**
Joule supports the execution of tasks within SAP Analytics Cloud stories. Users can perform actions such as creating elements, modifying views, or interacting with story components using natural language.

**Scripting**
Joule can generate scripts to enhance interactivity and automate behavior within stories. This includes creating logic for UI elements such as buttons, charts, and dynamic actions.

### Benefits

- Get insights anywhere​ via Joule instead of using dashboard in SAP Analytics Cloud Enterprise license
- Specifically​ tailored insights​ easy to digest analytical information in the context of SAP applications used by the customer
- Give every employee immediate, context-rich insights so they can make more informed decisions, faster.

### Capabilities

Joule enables business users, data analysts, and story designers to interact with data and execute tasks using natural language. This reduces complexity and makes workflows faster, more intuitive, and easier to manage.

The analytical insights capability in Joule provides tailored, on-demand decision support from SAP business applications. Users can prompt Joule with natural language questions (e.g., "Who were the top 3 sales managers last month?") and get instant answers to support fast, data-informed decisions. The analytical insights capability integrates deeply with the Just Ask feature of Analytics Cloud in SAP Business Data Cloud. Once the analytical insight capability is enabled, it is available for any user with an SAP Analytics Cloud account. The administrator of just ask feature determines what models and data are available to Joule. The capability is part of Joule base entitlement.

### Technical Architecture 

![drawio](drawio/joule-justask-anaytical.drawio)

The diagram above illustrates the end-to-end request flow for analytical insights in Joule, numbered 1–7.

**1. User submits a natural language question**
A business user types a question in Joule — for example, *"What is our sales in Mexico this month? ?"* — from any SAP application that embeds Joule, such as standalone SAP Analytics Cloud, SAP Business Data Cloud, SAP Cloud Applications (SAP S/4HANA, SAP SuccessFactors). The Analytics Insights in Joule takes this input. Joule's routing logic determines the scenario type (analytical, informational, functional, or scripting) independently of the entry point.

**2. Authentication via SAP Cloud Identity Services**
Joule authenticates the user through SAP Cloud Identity Services (SAP IAS). Corporate single sign-on is supported by federating with a third-party identity provider via SAML or OIDC. This step ensures that only authorized users can query the connected analytical models.

**3. Request forwarded via Destination service (HTTPS)**
Once authenticated, the analytical query is forwarded over HTTPS through an SAP BTP Destination configured in the Customer Subaccount. The Destination holds the connection details for the SAP Analytics Cloud JustAsk endpoint, enabling secure cross-subaccount communication.

**4. JustAsk service — model identification**
The JustAsk service in SAP Analytics Cloud receives the natural language query. It identifies the most relevant analytical model for the question by searching customer-specific metadata indexed in a Vector DB. This semantic search step is what makes JustAsk able to route a question to the right dataset without the user selecting a model manually. Administrators control which models and data are available to Joule.

**5. JustAsk result service — query generation and execution**
The JustAsk result service takes the identified model and generates a structured analytical query (OData or SQL) from the natural language input using an LLM. The query is executed against the model to compute the answer. Users may be presented with results from a single model or asked to select from multiple candidate models, depending on the JustAsk configuration.

**6. SAC widget — data retrieval**
The HANA Gateway fetches the underlying business data from the connected data sources — SAP Datasphere, SAP HANA Cloud, or live SAP Analytics Cloud models in SAP Business Data Cloud. It translates the analytical query into data layer calls and returns the result set to the JustAsk result service.

**7. Insight returned to the user**
The computed analytical insight — a table, chart, or narrative answer — is surfaced back to the user in Joule within the SAP application they started from. No separate navigation to SAP Analytics Cloud is required.

### Authentication: Joule to SAP Analytics Cloud

![drawio](drawio/joule-justask-anaytical.drawio)


Joule accesses the JustAsk service in SAP Analytics Cloud using the **OAuth2SAMLBearerAssertion** grant type. This flow allows Joule to act on behalf of the logged-in user (principal propagation) without requiring the user to authenticate again in SAC.

**1. User requests access**
The resource owner (end user) triggers a Joule query that requires analytical data from SAP Analytics Cloud. Joule receives the request and initiates the token acquisition flow.

**2. Retrieve SAML 2.0 bearer assertion**
Joule calls the SAP BTP Destination Service, which is configured as a SAML 2.0 Identity Provider. The Destination Service issues a SAML 2.0 bearer assertion that represents the identity of the current user.

**3. Request OAuth 2.0 access token**
Joule presents the SAML 2.0 assertion to the SAC XSUAA Authorization Server via the `/token` endpoint, using the OAuth 2.0 grant type `urn:ietf:params:oauth:grant-type:saml2-bearer`. This is the standard SAML bearer assertion grant defined in RFC 7522.

**4. Receive OAuth 2.0 access token**
SAC XSUAA validates the SAML assertion — checking the issuer, signature, and user attributes — and returns an OAuth 2.0 access token scoped to the requesting user's permissions in SAP Analytics Cloud.

**5. Call JustAsk with the access token**
Joule attaches the OAuth 2.0 access token as a Bearer token in the Authorization header and calls the JustAsk Resource Server. JustAsk honors the user's SAC role assignments, ensuring that results respect the same data access controls defined in SAP Analytics Cloud.

## Services and Components 

#### Joule — Central Instance
Joule runs as a centrally managed instance on SAP Business Technology Platform. It acts as the orchestration layer for all user queries — receiving input, determining the scenario type, invoking the relevant skill, and returning the result. The central instance hosts both SAP-delivered skills and any custom skills built by the customer. All SAP cloud applications that embed Joule share this single instance.

#### SAP Analytics Cloud — JustAsk Service
JustAsk is the AI-powered natural language query engine inside SAP Analytics Cloud. It exposes two internal services used by Joule:
- **JustAsk service (model identification)** — performs semantic search over indexed model metadata stored in a customer-specific Vector DB to identify the most relevant analytical model for a given question.
- **JustAsk result service** — takes the identified model, generates a structured query (OData or SQL) using an LLM, executes it, and returns the computed answer to Joule.

JustAsk is available exclusively within SAP Analytics Cloud and SAP Business Data Cloud. Administrators control which models and datasets are exposed to Joule through the JustAsk configuration.

#### SAP Analytics Cloud — SAC Widget
The HANA Gateway is the data access component within SAP Analytics Cloud that translates analytical queries into calls against the underlying data sources. It connects to live models backed by SAP Datasphere, SAP HANA Cloud, or acquired SAP Analytics Cloud models, and returns result sets to the JustAsk result service.

#### SAP BTP Destination Service
The Destination Service stores the connection configuration required for Joule to reach the SAP Analytics Cloud JustAsk endpoint. In this architecture it plays a dual role: it acts as the **SAML 2.0 Identity Provider** in the OAuth2SAMLBearerAssertion flow, issuing a SAML bearer assertion that represents the current user's identity so that Joule can request a scoped OAuth 2.0 access token from SAC XSUAA.

#### SAP Cloud Identity Services
SAP Cloud Identity Services (SAP IAS) is the central identity broker for both Joule's subaccount and the SAP Analytics Cloud tenant. It authenticates end users, supports federation with a corporate identity provider (SAML or OIDC), and establishes the trust relationship between SAP BTP and SAP Analytics Cloud that makes principal propagation possible.

#### SAP Business Data Cloud
SAP Business Data Cloud (SAP BDC) is the integrated data platform that bundles SAP Analytics Cloud, SAP Datasphere, and SAP HANA Cloud in a single managed offering. It is the primary data source for Joule's analytical insights capability. The BDC Cockpit provides the administration interface for configuring the data landscape and managing the connections exposed to JustAsk.

#### SAP Datasphere
SAP Datasphere provides the data federation and harmonization layer. It creates a unified semantic model over heterogeneous data sources — connecting to SAP and non-SAP systems without requiring data movement. Analytical models built on top of SAP Datasphere views are available to JustAsk and, through it, to Joule.

#### SAP HANA Cloud
SAP HANA Cloud is the in-memory database that underpins many SAP Analytics Cloud models and SAP Datasphere spaces. It stores persisted data sets and acquired models, and the HANA Gateway connects to it directly to execute the queries generated by JustAsk.


### Additional Resources

[SAP Discovery Center Mission - Activate Analytical Insights in SAP products with Joule](https://discovery-center.cloud.sap/missiondetail/4640/4929/?tab=overview)

### Conclusion

SAP delivers this capability through the integration of Joule and SAP Analytics Cloud's JustAsk service. 

For architects, the reference architecture described here establishes a clear and secure pattern: a central Joule instance on SAP BTP connects to SAP Analytics Cloud via the BTP Destination Service and SAP Cloud Identity Services, with the full request flow — from natural language input to indexed model lookup to query execution against SAP Datasphere or SAP HANA Cloud — contained within the SAP ecosystem and requiring no custom integration layer.
