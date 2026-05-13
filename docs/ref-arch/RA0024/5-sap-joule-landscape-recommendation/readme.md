---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0024-5
slug: /ref-arch/06ff6062dc/5
sidebar_position: 5
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: SAP Joule Landscape Recommendation 
description: Recommended SAP BTP Subaccount model setup for unified Joule experience within a 3-staged landscape 
sidebar_label: Joule Landscape Recommendation
keywords:
- joule
- joule studio
- custom joule skills
- ai agents
- sap integration
- sap ai
- automation
- sap btp
- hybrid landscapes
- staged landscape
- subaccount model
image: img/ac-soc-med.png
tags:
  - genai
  - agents
  - build
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - mar-hol
    - fabianleh
    - marvinklose
    - dermats
    - NormanNuernberger
last_update:
    date: 2026-05-15
    author: NormanNuernberger

############################################################
#                   End of Front Matter                    #
############################################################
---

Setting up unified Joule in an existing SAP landscape requires a staged implementation process to qualify changes before bringing them to production. As organizations develop custom Joule skills and agents using Joule Studio, or configure Joule integrations across multiple SAP cloud applications, they need a structured approach to develop, test, and deploy these capabilities safely. This reference architecture provides a recommended SAP BTP subaccount model that supports a 3-staged landscape (Development, Test, Production), ensuring proper isolation, governance, and lifecycle management for Joule-related workloads.

The staged approach aligns with enterprise best practices for change management, allowing teams to iterate on Joule configurations in development, validate them in test environments connected to non-productive SAP systems, and finally promote qualified changes to production where they interact with live business data and processes.

## Architecture

The architecture diagram depicts the recommended SAP BTP subaccount setup for a 3-staged Joule landscape, illustrating how the various components are organized across Development, Test, and Production stages.

![drawio](drawio/btp_sa_3_staged.drawio)

The solution architecture consists of the following key elements:

- **Three staged environments** (Development, Test, Production): Each stage is represented as a horizontal row in the diagram, containing its own set of SAP BTP subaccounts and connected systems. This separation ensures that changes can be developed and validated before affecting production workloads.

- **SAP BTP Global Account with dedicated subaccounts per stage**: Each stage contains multiple subaccounts serving distinct purposes. *Depending on the activated scenarios and use cases, actual setup and deployment of services might vary accordingly. This architecture illustrates a possible approach. Main focus is on the interplay between the actual Joule instance, system connectivity and integration with SAP Cloud Identity services*:
  - **AI Core Subaccount**: Hosts SAP AI Core with Grounding Management and AI Models, providing the foundation model access and document grounding capabilities that power custom AI solutions build on top of th BTP AI foundation. 
  - **Joule Studio Subaccount**: Provides the development environment for building custom Joule skills and agents using Joule Studio. Joule Studio is part of SAP Build Process Automation. 
  - **Joule Subaccount**: Runs the Joule runtime with SAP Build Work Zone, serving as the unified entry point for end users across SAP applications. SAP Build Work Zone can also be reused from other Subaccounts. In the development or test stage, you might consider using Joule preview to validate upcoming capabilities and features. 
  - **Connectivity Subaccount** (Pre-prod/Prod): Hosts the SAP Connectivity service for secure connections to SAP S/4HANA Cloud Private Edition or on-premise systems per stage.

- **SAP Cloud Identity Services**: Test and Productive tenants of SAP Cloud Identity Services manage user authentication and authorization. The Test tenant serves Development and Test stages, while the Productive tenant serves Production. Both integrate with the respective Corporate Identity Provider (Pre-Prod or Prod) for enterprise single sign-on.

- **SAP Cloud Solutions per stage**: Each stage connects to the corresponding instances of SAP cloud applications such as SAP S/4HANA Cloud Private Edition, SAP SuccessFactors, and other Joule-enabled systems. This ensures that Joule skills and configurations are tested against non-productive data before being deployed to production.

## Characteristics

- **Staged development lifecycle**: The 3-staged model (Development, Test, Production) provides a structured path for developing, validating, and deploying Joule skills, agents, and configurations. Changes are qualified in lower stages before promotion to production, reducing the risk of disruptions to business operations.

- **Dedicated subaccount separation**: Each functional component (AI Core, Joule Studio, Joule runtime, Connectivity) runs in its own subaccount, providing clear boundaries for security, resource management, and cost tracking. This separation also enables different teams to manage their respective areas with appropriate access controls.

- **Centralized identity management**: SAP Cloud Identity Services tenants (Test and Productive) provide consistent authentication and authorization across all stages. Integration with Corporate Identity Providers ensures that enterprise security policies are enforced, while the test tenant enables safe validation of identity configurations before production deployment.

- **Hybrid connectivity support**: The dedicated Connectivity subaccounts per stage enable secure access to SAP S/4HANA Cloud Private Edition or on-premise systems. This ensures that Joule can interact with backend systems while maintaining the stage isolation required for proper testing and validation.

- **Flexibility and scalability**: While this reference architecture depicts a 3-staged model, organizations can adapt it to their specific needs. Additional stages (e.g., Quality Assurance, Sandbox, Pre-Production) can be added, or subaccounts can be consolidated based on organizational requirements and governance policies. The model supports both public cloud and private cloud SAP deployments.

## Examples in an SAP context

- **SAP S/4HANA Cloud Private Edition**: Organizations running SAP S/4HANA Cloud Private Edition can use this staged model to develop and test Joule skills that interact with their ERP system, ensuring that custom automations and integrations are validated before production deployment.

- **SAP S/4HANA Cloud Public Edition**: For customers on SAP S/4HANA Cloud Public Edition, the same staged approach applies, with Joule configurations tested against sandbox or test tenants before activation in productive systems.

- **SAP SuccessFactors**: HR-focused Joule skills and agents can be developed and tested against SuccessFactors test instances, validating employee self-service scenarios and HR process automations before enabling them for the workforce.

- **SAP SuccessFactors**: SAP SuccessFactors is owning an own identifier for a person, the Person UID, required for Embedded Analytics. This UID has an independent lifecycle than the Global User UID, which is owned by the SAP Cloud Identity Services. Connecting multiple instances of SAP SuccessFactors with a single instance of SAP Cloud Identity Services may lead to conflicts when synchronizing the identities from SAP SuccessFactors to SAP Cloud Identity Services. There are different possibilities to avoid such conflicts:
    - By using different user accounts in different instances of SAP Success Factors, while authentication via Global User UID can allow single sign on even with different mail addresses in the different instances of SAP Success Factors.
    - By storing the different Person UIDs into different attributes inside SAP Cloud Identity Services, as described in [Note 2954815](https://me.sap.com/notes/2954815)

- **Multi-application landscapes**: Organizations with multiple Joule-enabled SAP applications benefit from the unified Joule instance approach, where a single staged BTP setup serves as the foundation for Joule across SAP S/4HANA, SAP SuccessFactors, SAP Ariba, and other connected systems.

- **Extended staging models**: The 3-staged model can be extended to 4 or more stages for organizations with additional quality gates, regulatory requirements, or geographic considerations that necessitate further separation of environments.

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
- [Get started with Business AI](https://discovery-center.cloud.sap/missiondetail/4338/4621/)
- [Get Started with SAP BTP - Cloud Identity Service Provider (SAP IdP)](https://discovery-center.cloud.sap/missiondetail/4325/4605/)
- [Set Up Joule Studio and start with Joule Skills and Agents in BTP Enterprise Account](https://discovery-center.cloud.sap/missiondetail/4651/4940/)
