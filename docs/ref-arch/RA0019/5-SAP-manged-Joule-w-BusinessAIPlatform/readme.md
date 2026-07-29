---
id: 3ec73b
slug: /ref-arch/3ec73b
sidebar_position: 5
title: Joule Landscape Recommendation
description: >-
  Recommended landscape setup for a unified Joule experience
keywords:
  - sap
  - identity authentication
  - cloud identity
  - erp security solutions
  - access management
  - joule
  - joule studio
  - custom joule skills
  - ai agents
  - sap integration
  - sap ai
  - automation
  - hybrid landscapes
  - staged landscape
  - landscape
  - business ai platform
sidebar_label: Joule Landscape Recommendation
image: img/ac-soc-med.png
tags:
  - security
  - joule
  - sap-managed
  - cloud_identity
  - sci
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sapgunnar
  - gunnar-kosche_sap
  - fabianleh
  - NormanNuernberger
discussion: 
last_update:
  author: NormanNuernberger
  date: 2025-07-08
---

Setting up Joule Work in an existing SAP landscape requires an integration into SAP Cloud Identity Services. Joule and SAP Cloud Identity Services are provided in two stages (Test and Production), while many other SAP systems in a typical landscape exist in more than 2 stages, such as Sandbox, Development, Test, Pre-Prod and Production. Identities in such landscapes with more than 2 stages are typically treated as productive also on non-productive systems. For example, a developer on a development system is a productive developer. To support such scenarios, as well as a strict SaaS approach (two-staged), SAP is providing two different architectural diagrams for landscape recommendations - one for a two-staged landscape (SaaS) and one for an n-staged landscape.

# Two-Staged Landscape Architecture

The architecture diagram depicts the recommended Joule setup for a two-staged Joule landscape, illustrating how the various components are organized across Test, and Production stages.

![drawio](drawio/2_staged_BAIP_IAM_Architecture.drawio)

The solution architecture consists of the following key elements:

- **Two staged environments** (Test and Production): Each stage is represented as a horizontal row in the diagram, containing its own instance of SAP Cloud Identity Services, the SAP Business AI Platform and the connected SAP systems of the same stage. This separation ensures that changes can be developed and validated before affecting production workloads.

- **SAP Cloud Identity Services**: Test and Productive tenants of SAP Cloud Identity Services manage user authentication and authorization. The Test tenant serves the Test stage, while the Productive tenant serves the Production stage. Both integrate with the respective Corporate Identity Provider (Pre-Prod or Prod) for enterprise single sign-on.

- **SAP Business AI Platform**: SAP Business AI Platform is an enterprise AI foundation that brings together AI, data, process context, and governance, so organizations can build, deploy, integrate, manage and scale AI capabilities into business processes and applications.
The following services are hosted, SAP-managed, by the *SAP Business AI Platform*, separated by stage:
  - **Joule Work**: SAP’s digital assistant layer that brings conversational and generative AI into SAP applications and workflows.
  - **Joule Studio**: Low-code tooling to design, configure, and manage Joule-based experiences, including agents and skills.
  - **SAP Agentic Gateway**: Runtime and integrated management platform for AI agents.
  - **SAP Knowledge Graph**: Connecting data with context to enable AI to utilize business information efficiently.

- **SAP Cloud Solutions per stage**: Each stage connects to the corresponding instances of SAP cloud applications such as SAP S/4HANA Cloud, SAP SuccessFactors, and other Joule-enabled solutions. This ensures that Joule skills and configurations are tested against non-productive data before being deployed to production.

## Characteristics

- **Staged development lifecycle**: The two-staged model (Test and Production) provides a structured path for developing, validating, and deploying Joule skills, agents, and configurations. Changes are qualified in the Test stage before promotion to production, reducing the risk of disruptions to business operations.

- **Centralized identity management**: SAP Cloud Identity Services tenants (Test and Productive) provide consistent authentication and authorization across all stages. Integration with Corporate Identity Providers ensures that enterprise security policies are enforced, while the test tenant enables safe validation of identity configurations before production deployment.

## Specialities

- **Signavio**: SAP Signavio does not provide test tenants. SAP Signavio will only be integrated into the Production stage.

- **SAP Cloud ALM**: SAP Cloud ALM does not provide test tenants. SAP Cloud ALM will only be integrated into the Production stage.

# N-staged Landscape Architecture

The architecture diagram depicts the recommended Joule setup for an n-staged Joule landscape, illustrating how the various components are organized across the stages. In this example a 3-staged landscape and a sandbox stage in addition.

![drawio](drawio/n_staged_BAIP_IAM_Architecture.drawio)

The solution architecture consists of the following key elements:

- **Three staged environments** (Development, Test and Production): Each stage is represented as a horizontal row in the diagram. All stages share the same instance of SAP Cloud Identity Services and the SAP Business AI Platform. The Test instances of SAP Cloud Identity Services and SAP Business AI Platform are connected to a separate Sandbox landscape. This separation ensures that changes can be developed and validated before affecting production workloads, while identities in non-productive systems can be managed like productive identities.

- **SAP Business AI Platform**: SAP Business AI Platform is an enterprise AI foundation that brings together AI, data, process context, and governance, so organizations can build, deploy, integrate, manage and scale AI capabilities into business processes and applications.
The following services are hosted, SAP-managed, by the *SAP Business AI Platform*, separated by stage:
  - **Joule Work**: SAP’s digital assistant layer that brings conversational and generative AI into SAP applications and workflows.
  - **Joule Studio**: Low-code tooling to design, configure, and manage Joule-based experiences, including agents and skills.
  - **SAP Agentic Layer**: Runtime and integrated management platform for AI agents.
  - **SAP Knowledge Graph**: Connecting data with context to enable AI to utilize business information efficiently.

- **SAP Cloud Identity Services**: Test and Productive tenants of SAP Cloud Identity Services manage user authentication and authorization. The Test tenant serves a dedicated Sandbox stage only, while the Productive tenant serves all the other stages. Both integrate with the respective Corporate Identity Provider (Pre-Prod or Prod) for enterprise single sign-on.

- **SAP Cloud Solutions per stage**: Each stage connects to the corresponding instances of SAP cloud applications such as SAP S/4HANA Cloud, SAP SuccessFactors, and other Joule-enabled solutions. This ensures that Joule skills and configurations are tested against non-productive data before being deployed to production.

## Characteristics

- **Staged development lifecycle**: The n-staged model provides a structured path for developing, validating, and deploying Joule skills, agents, and configurations. Changes are developed in the Development stage and qualified in the Test stage before promotion to production, reducing the risk of disruptions to business operations, while developers and test users are treated like productive users to mitigate the risk of interruptions in the development lifecycles.

- **Centralized identity management**: SAP Cloud Identity Services tenants (Test and Productive) provide consistent authentication and authorization across all stages. Integration with Corporate Identity Providers ensures that enterprise security policies are enforced, while the test tenant enables safe validation of identity configurations before production deployment.

## Specialities

- **SAP SuccessFactors**: SAP SuccessFactors owns an own identifier for a person, the Person UID, required for Embedded Analytics. This UID has an independent lifecycle than the Global User UID, which is owned by the SAP Cloud Identity Services. Connecting multiple instances of SAP SuccessFactors with a single instance of SAP Cloud Identity Services may lead to conflicts when synchronizing the identities from SAP SuccessFactors to SAP Cloud Identity Services. There are different possibilities to avoid such conflicts:
    - By using different user accounts in different instances of SAP SuccessFactors, while authentication via Global User UID can allow single sign-on even with different mail addresses in the different instances of SAP SuccessFactors.
    - By storing the different Person UIDs into different attributes inside SAP Cloud Identity Services, as described in [Note 2954815](https://me.sap.com/notes/2954815)

## Services and Components

- [Joule](https://help.sap.com/docs/joule/integrating-joule-with-sap/introduction?version=CLOUD)
- [Joule Preview](https://help.sap.com/docs/joule/integrating-joule-with-sap/joule-preview-landscape)
- [Joule Studio](https://help.sap.com/docs/Joule_Studio/45f9d2b8914b4f0ba731570ff9a85313/b323c5a639a5428eb05fdafcca9bc9df.html)
- [SAP Build Work Zone](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-advanced-edition?region=all)
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all)
- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all)

## Resources

- [SAP BTP Administrator's Guide - Setting Up Your Account Model](https://help.sap.com/docs/btp/btp-admin-guide/setting-up-your-account-model?version=Cloud)
- [SAP BTP Administrator's Guide - Onboard to SAP Cloud Identity Services](https://help.sap.com/docs/btp/btp-admin-guide/onboard-to-sap-cloud-identity-services?version=Cloud)
- [SAP Cloud Identity Services - Tenant Model](https://help.sap.com/docs/cloud-identity-services/cloud-identity-services/tenant-model-and-licensing?version=Cloud)
- [SAP Cloud Identity Services - Connect to On-Premise Systems](https://help.sap.com/docs/cloud-identity-services/cloud-identity-services/connect-to-on-premise-systems-in-sap-cloud-identity-infrastructure?version=Cloud)
- [System Integration Guide for SAP Cloud Identity Services](https://help.sap.com/docs/cloud-identity/system-integration-guide/system-integration-guide-for-sap-cloud-identity-services?version=Cloud)

## Related Missions

- [Establish a Unified Joule Instance](https://discovery-center.cloud.sap/missiondetail/4538/4826/)
- [Activate Joule with SAP S/4HANA Cloud Public Edition](https://discovery-center.cloud.sap/missiondetail/4452/4738/)
- [Activate Joule for SAP SuccessFactors](https://discovery-center.cloud.sap/missiondetail/4451/4737/)
- [Activate Joule with SAP Ariba](https://discovery-center.cloud.sap/missiondetail/4697/4981/)
- [Activate Joule with SAP Integrated Business Planning (IBP)](https://discovery-center.cloud.sap/missiondetail/4631/4920/)
- [Get started with SAP Business AI](https://discovery-center.cloud.sap/missiondetail/4338/4621/)
- [Get Started with SAP BTP - Cloud Identity Service Provider (SAP IdP)](https://discovery-center.cloud.sap/missiondetail/4325/4605/)
- [Set Up Joule Studio and start with Joule Skills and Agents in BTP Enterprise Account](https://discovery-center.cloud.sap/missiondetail/4651/4940/)
