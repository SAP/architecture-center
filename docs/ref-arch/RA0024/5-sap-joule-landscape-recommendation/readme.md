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
image: img/logo.svg
tags:
  - genai
  - agents
  - build
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - mar-hol
    - fabianleh
    - marvinklose
    - dermats
last_update:
    date: 2026-03-04
    author: fabianleh
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->
Setting up unified Joule in an existing SAP landscape requires staged development process to qualify changes before bringing them to production. Typically, this means having one global account and creating one subaccount each for development, testing, and production to also connect with the respective stage of the business systems.

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/btp_sa_3_staged.drawio)

## Characteristics

- **topic1s**: fill out

- **topic2s**: fill out

- **topic3s**: fill out

- **topic4s**: fill out



## Examples in an SAP context

Private Cloud / Public Cloud
Staged also 3+ possible

## Services and Components

- [Joule](https://help.sap.com/docs/joule/integrating-joule-with-sap/introduction?version=CLOUD)
- [Joule Studio](https://help.sap.com/docs/Joule_Studio/45f9d2b8914b4f0ba731570ff9a85313/b323c5a639a5428eb05fdafcca9bc9df.html)
- [SAP Build Work Zone](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-advanced-edition?region=all)
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all)
- [SAP Cloud Identity Services -  Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services -  IdentityProvisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
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
- [Activate Joule for SAP Success](https://discovery-center.cloud.sap/missiondetail/4451/4737/)
- [Set Up Joule Studio and start with Joule Skills and Agents in BTP Enterprise Account](https://discovery-center.cloud.sap/missiondetail/4651/4940/)
