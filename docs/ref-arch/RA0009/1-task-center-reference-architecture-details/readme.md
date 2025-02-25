---
############################################################
#                Beginning of Front Matter                 #
############################################################
id: id-ra0009-1
slug: /ref-arch/f764cc1375/1
sidebar_position: 1
sidebar_custom_props:
  category_index: 
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Task Center reference architecture details
description: Explore details of the SAP Task Center reference architecture that are applicable to SAP business applications
sidebar_label: Task Center reference architecture details
keywords: [sap, btp, cloud]
image: img/logo.svg
tags: [genai, azure, aws, gcp]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - fabianleh
last_update:
  date: 2025-02-11
  author: user-eb814de5ff
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->

![drawio](drawio/establish-a-central-inbox-with-sap-task-center.drawio)

## Flow

The reference architecture diagram shows the SAP Task Center integration with various task providers.

1. For identity management and authentication, the SAP Task Center tenant relies on SAP Cloud Identity Services-Identity Authentication as the identity provider (IdP). SAP Cloud Identity Services serve as central fascade for the identity & access management. The SAP Cloud Identity Services - Identity Directory (IdDS) stores the SAP identities and the SAP Cloud Identity Services - Authentication (IAS) allow a secure authentication or a federation with third-party Identity Providers.

2. Each task provider, which is about to be integrated with SAP Task Center, must be able also to work with Identity Authentication as a hard prerequisite. To integrate а task provider with SAP Task Center, the following general guidelines should be followed:

    a) The users, who would consume SAP Task Center, must be available in both SAP Cloud Identity Services and the task provider system.

    b) The user identities must include the Global User ID, so that a user can be correlated across the different systems. For more information, see [Global User ID in Integration Scenarios](https://help.sap.com/docs/cloud-identity/system-integration-guide/global-user-id-in-integration-scenarios).

    c) The user entries must include essential user data, such as an email address and a display name.
   
    d) Sign-on should be configured between the task provider and Identity Authentication to enable navigation between SAP Task Center and the task provider.
   
    e) Tasks must be correlated with Global User ID, when provided to SAP Task Center. For example, the list of recipient users of a task must contain Global User IDs.

3. SAP Task Center communicates with the task provider applications via predefined destinations in a customer subaccount. For more information, see [Destinations](https://help.sap.com/docs/task-center/sap-task-center/destinations).

4. To integrate with SAP S/4HANA systems and receive on-premise tasks in SAP Task Center, a SAP Cloud Connector must be set up as part of the destination configuration.

5. End users can access SAP Task Center via various application clients:

    a. SAP Task Center Web app

    b. To-Dos in SAP Mobile Start

    c. To-Dos in SAP Start
   
   For more information, see [Using SAP Task Center](https://help.sap.com/docs/task-center/sap-task-center/using-sap-task-center).


## Characteristics

An architecture for SAP Task Center integration can be characterized as follows:

- **Single entry point for accessing tasks**: SAP Task Center allows end users to access all their assigned tasks from one inbox.

- **Global User ID**: Globally unique user identifier defined by SAP Cloud Identity Services and used by SAP Task Center and all task providers.

- **Support of third-party identity providers**: SAP Cloud Identity Services - Authentication (IAS) allows a federation with third-party Identity Providers (for SAP Task Center using the user store should be enabled)

- **SAP on-premise solutions integration**: Apart from integrating with various SAP cloud solutions, SAP Task Center can be configured to work with SAP S/4HANA and SAP S/4HANA Cloud, private edition.

- **Different application clients**: Tasks federated by SAP Task Center can be accessed from the SAP Task Center Web app, To-Dos in SAP Mobile Start and the To-Dos in SAP Start.

## Examples in an SAP context

SAP offers various SAP cloud and on premise solutions, which offer separate inbox experiences. With SAP Task Center the following is achieved:

- Reduce the time spent by users navigating through various systems and finding items that require their approval or attention.

- Improve the approval or completion time for critical items (which impact business operations if not approved on time).

- Improve the quality and consistency of approvals.

## Services and Components

- [SAP Build Work Zone](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-advanced-edition?region=all)
- [SAP Task Center](https://discovery-center.cloud.sap/serviceCatalog/sap-task-center?region=all) <!-- dc-svc-metadata: {"isPrimary": "true"} dc-svc-metadata -->
- [SAP Cloud Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all)

## Resources

- [SAP Task Center (SAP Help Portal)](https://help.sap.com/docs/task-center)
- [SAP Task Center (Guided Answers)](https://ga.support.sap.com/dtp/viewer/index.html#/tree/3109/actions/47627)
- [SAP Task Center (SAP Community Topic Page)](https://pages.community.sap.com/topics/task-center)


## Related Missions

- [Establish a Central Inbox with SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3774/3813/)
- [Integrate Your SAP S/4HANA Cloud Tasks Into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3906/4071/)
- [Integrate Your SAP S/4HANA Tasks Into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3910/4076/)
- [Integrate Your SAP SuccessFactors Tasks Into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3816/3869/)
- [Integrate Your SAP Concur Tasks Into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3883/3962/)
- [Integrate Your SAP Cloud for Customer into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/4235/4489/)
- [Integrate Your SAP Fieldglass Tasks Into SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3911/4077/)
