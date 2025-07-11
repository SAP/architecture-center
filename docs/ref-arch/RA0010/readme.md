---
id: id-ra0010
slug: /ref-arch/1311c18c17
sidebar_position: 10
sidebar_custom_props:
  category_index:
    - aws
    - gcp
    - azure
    - appdev
title: Establish a central entry point with SAP Build Work Zone
description: >-
  SAP Build Work Zone centralizes business applications, workflows, and
  communication for a seamless digital workplace experience.
keywords:
  - sap
  - btp
  - digital workplace
  - sap build work zone
  - integration ecosystem
  - business applications
  - sap mobile start
  - joule
sidebar_label: Establish a central entry point with SAP Build Work Zone
image: img/ac-soc-med.png
tags:
  - aws
  - azure
  - gcp
  - appdev
  - buildworkzone
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - f-buech
  - fabianleh
discussion: 
last_update:
  author: fabianleh
  date: 2025-07-10
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->

SAP Build Work Zone offers a comprehensive solution architecture designed to elevate user productivity and engagement by providing a digital workplace platform that supports single-sign-on. This innovative approach centralizes access to essential business applications, processes, information, and communication, serving as a unified entry point accessible from desktop or mobile devices. It harmonizes business content, applications, workflows, and processes across your landscape, ensuring a seamless integration and interaction within your digital ecosystem.

Additionally, it empowers business users with intuitive editors, allowing them to create pages or workspaces effortlessly without the need for coding skills. This enables a more dynamic, flexible, and user-friendly environment for managing business operations and engaging with your digital workspace.

This reference architecture also refers to the UI integration use case pattern of the SAP Integration Solution Advisory Methodology.

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
![drawio](drawio/sap-build-work-zone.drawio)

## Flow

1. End users can access SAP Build Work Zone via the web and mobile native application.

    a. SAP Build Work Zone Web (standard edition / advanced edition / SAP SuccessFactors Work Zone)

    b. SAP Mobile Start

2. For identity management and authentication, SAP Build Work Zone relies on SAP Cloud Identity Services-Identity Authentication as the identity provider (IdP). SAP Cloud Identity Services serve as central facade for the identity & access management. In this context, SAP Cloud Identity Services - Identity Authentication (IAS) offer secure authentication or a federation with third-party Identity Providers. The SAP Cloud Identity Services - Identity Directory (IdDS) stores the SAP identities. The SAP Cloud Identity Services - Provisioning (IPS) allow to provision users and their role assignments directly into the SAP Build Work Zone user store. For more information, see [Trust Setup and Authentication Flows](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/solution-architecture-and-authentication-details#trust-setup-and-authentication-flows).

3. SAP Build Work Zone as a solution consists of multiple components directly part of the product stack enabling different capabilities out of the box which cannot be decoupled from the product. When SAP Build Work Zone is activated in a subaccount of SAP BTP, these components will be invisible in the list of subscriptions and service instances: they are all an integral part of the solution itself (SAP Build Work Zone subscription). This includes services like Notifications, Mobile Services and UI Theme Designer also used by other SAP products as well as Digital Workplace Service (DWS) exclusively part of SAP Build Work Zone. For more information, see [Components](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/solution-architecture-and-authentication-details#components). SAP Mobile Services is included for the runtime of SAP Mobile Start. When creating custom mobile applications, a dedicated subscription to SAP Mobile Services is required.

4. Via the pre-built content channel integration into the SAP BTP subaccount-level HTML5 application repository, custom applications can be made available in SAP Build Work Zone – these can be created via SAP Build. In addition, SAP Build Process Automation and SAP Task Center also provide out of the box applications that can be made available in Work Zone via the same channel.

5. Manually integrated content or content exposed by content channels allow connecting exposed business content from a source to make it accessible from SAP Build Work Zone. Two types of content channels are supported: So-called “content providers” (API based content exposure) and “content packages” (file-based content upload). Content providers can expose content from cloud or on-premise systems alike. When using on-premise systems, SAP Cloud Connector is used in addition for a secure connection to the backend. In addition to integrating with SAP on-premise and cloud solutions, the same integration concepts are also applicable to third-party solutions and APIs. SAP Build Work Zone communicates with SAP and third-party backend systems integrated as a content channel (as well as for manually integrated content) via Destinations and the Connectivity service. For more information, see:

    - [Integrating Business Content](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/integrating-business-content) for SAP Build Work Zone, standard edition
    - [Integrating Business Content](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/integrating-business-content) for SAP Build Work Zone, advanced edition

6. In addition to the default product domain, customers can also make their SAP Build Work Zone environment available under a custom domain of their choice. This is enabled via an integration with the SAP Custom Domain service. For more information, see:
    - [Setting Up Custom Domain](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/setting-up-custom-domain) for SAP Build Work Zone, standard edition
    - [Setting Up Custom Domain](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/setting-up-custom-domain) for SAP Build Work Zone, advanced edition

7. When moving business content from one environment to another – for example from development to test – this can be achieved via manual export/import or via the more elaborated integration with SAP Cloud Transport Management. For more information, see:
    - [Transporting Content](https://help.sap.com/docs/build-work-zone-standard-edition/sap-build-work-zone-standard-edition/transporting-content) for SAP Build Work Zone, standard edition
    - [Transporting Content](https://help.sap.com/docs/build-work-zone-advanced-edition/sap-build-work-zone-advanced-edition/transporting-content-ac16ecafb863488eb0f7c9c6056e6626) for SAP Build Work Zone, premium edition
      
The SAP Build Work Zone architecture diagram highlights seven key flows when working with business sites to unify access to applications, approvals, content and more.

## Characteristics

- **Central entry point across hybrid SAP landscapes**: SAP Build Work Zone allows to easily build business sites that provide centralized access to business applications, processes & other important information on any device.

- **Support of third-party identity providers**: SAP Cloud Identity Services - Authentication (IAS) allows federation with third-party Identity Providers and SAP Cloud Identity Services – Provisioning (IPS) allows provisioning of user/role assignments from a third-party source.

- **Global User ID**: Globally unique user identifier defined by SAP Cloud Identity Services-Identity Authentication and used by SAP Build Work Zone.

- **SAP cloud and on-premise solutions integration**: Apart from integrating with various SAP cloud and third-party solutions and third-party solutions, SAP Build Work Zone Center can also be configured to work with SAP ECC, SAP S/4HANA and SAP S/4HANA Cloud, private edition.

- **Different application clients**: Business content created in and/or integrated with SAP Build Work Zone can be accessed from the SAP Build Work Zone web experience as well as the native mobile client, specifically SAP Build Work Zone Advanced or SAP Mobile Start (only SAP Start and standard edition for now). Joule is another client using the SAP Build Work Zone navigation service to find business applications.

- **Native support of UI-Integration-Cards**: UI-Integration-Cards supports the efficient creation of content for SAP Build Work Zone for SAP lines of business solutions, partners, and customers user in a unified way. UI Cards can call APIs via Destinations, display data based on a variety of card types and navigate to Business Applications. For more information, see [UI Integration with Cards](https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/index.html).

## Examples in an SAP context

SAP Build Work Zone has been instrumental in transforming digital workplace experiences across various industries.

- **Enhancing employee engagement and productivity**: Organizations have utilized SAP Build Work Zone to improve the digital experiences of frontline workers, leading to increased employee satisfaction and reduced turnover. This scenario underscores the importance of a user-friendly digital workplace in boosting overall workforce engagement and productivity.

- **Internal adoption and empowerment**: By adopting SAP Build Work Zone internally, companies demonstrate the platform's effectiveness in streamlining operations and improving productivity. This use case highlights the platform's ability to empower employees with a fully digital, user-centric workplace experience, facilitating better internal communication and efficiency.

- **Sector-specific workflows optimization**: Particularly notable in the finance sector, SAP Build Work Zone has enabled the creation of integrated and personalized workspaces. These workspaces improve engagement and productivity by catering to specific departmental needs, demonstrating the platform's versatility in enhancing department-specific workflows through personalized digital experiences.

- **Streamlining vendor and partner interactions**: Organizations have leveraged SAP Build Work Zone to manage high volumes of vendor interactions and to create extensive workspaces for internal and external collaborations. This scenario illustrates the platform's capability to simplify and enhance the efficiency of vendor management and partner collaboration processes, thereby freeing staff from manual tasks and fostering a more collaborative working environment.

These use cases showcase the broad applicability and impact of SAP Build Work Zone across different organizational needs, from improving employee engagement to optimizing specific workflows and enhancing collaboration with vendors and partners.  

## Services and Components

- [SAP Build Work Zone, advanced edition](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-advanced-edition?region=all) <!-- dc-svc-metadata: {"isPrimary": "true"} dc-svc-metadata -->
- [SAP Build Work Zone, standard edition](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-standard-edition?region=all) <!-- dc-svc-metadata: {"isPrimary": "true"} dc-svc-metadata -->
- [SAP Build Apps](https://discovery-center.cloud.sap/serviceCatalog/sap-build-apps?region=all)
- [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all)
- [SAP Business Application Studio](https://discovery-center.cloud.sap/serviceCatalog/business-application-studio?region=all)
- [SAP Task Center](https://discovery-center.cloud.sap/serviceCatalog/sap-task-center?region=all)
- [SAP Alert Notification Service for SAP BTP](https://discovery-center.cloud.sap/serviceCatalog/alert-notification?region=all)
- [UI5 flexibility for key users](https://discovery-center.cloud.sap/serviceCatalog/ui5-flexibility-for-key-users?region=all)
- [SAP Mobile Services](https://discovery-center.cloud.sap/serviceCatalog/mobile-services?region=all)
- [SAP Cloud Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all)
- [SAP Custom Domain service](https://discovery-center.cloud.sap/serviceCatalog/custom-domain?region=all)
- [SAP Cloud Transport Management](https://discovery-center.cloud.sap/serviceCatalog/cloud-transport-management?region=all)

## Resources

- SAP Help Portal
    - [SAP Build Work Zone, standard edition (SAP Help Portal)](https://help.sap.com/docs/build-work-zone-standard-edition?locale=en-US)
    - [SAP Build Work Zone, advanced edition (SAP Help Portal)](https://help.sap.com/docs/build-work-zone-advanced-edition?locale=en-US)

- SAP Learning Journeys
    - [Compose and Automate with SAP Build the No-Code Way (SAP Learning)](https://learning.sap.com/learning-journeys/compose-and-automate-with-sap-build-the-no-code-way)
    - [Implementing and Administering SAP Build Work Zone (SAP Learning)](https://learning.sap.com/learning-journeys/implement-and-administer-sap-build-work-zone)

- SAP Community Topic Pages
    - [SAP Build Work Zone (SAP Community)](https://pages.community.sap.com/topics/work-zone)
    - [SAP Build Work Zone FAQ (SAP Community)](https://pages.community.sap.com/topics/work-zone/faq)

- SAP Samples
    - [GitHub (SAP samples)](https://github.com/SAP-samples/build-workzone-integration/tree/main): This repository serves as a template for SAP Build Work Zone integration samples, providing a structured starting point for developers.

## Related Missions

- [Establish a central entry point with SAP Build Work Zone, standard edition (formerly SAP Launchpad service)](https://discovery-center.cloud.sap/missiondetail/3283/3378 )
- [Establish a Central Inbox with SAP Task Center](https://discovery-center.cloud.sap/missiondetail/3774/3813)