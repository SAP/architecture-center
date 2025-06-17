---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0024
slug: /ref-arch/8bf28782b9
sidebar_position: 24
sidebar_custom_props:
    category_index:
    - ai
    - appdev
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Enhance Joule with Custom Skills and AI Agents using Joule Studio in SAP Build
description: Enhance Joule with Custom Skills and AI Agents using Joule Studio in SAP Build for Seamless Integration across SAP and Non-SAP Systems
sidebar_label: Enhance Joule with Custom Skills and AI Agents using Joule Studio in SAP Build
keywords: 
    - sap
    - joule
    - build
    - custom skills
    - btp
    - ai
    - agents
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
draft: false
unlisted: false
contributors:
    - miguelmezamartinez
    - fabianleh
last_update:
    date: 2025-06-17
    author: fabianleh
############################################################
#                   End of Front Matter                    #
############################################################
---

Joule Studio in SAP Build is a comprehensive platform for developing and enhancing AI capabilities with a user-friendly experience. It empowers both business users and technologists to become AI citizen developers. Utilizing intuitive low-code tools, Joule Studio enables the creation of custom Joule Skills and AI Agents, expanding the functionalities of Joule Copilot and optimizing organization-specific automations.
This reference architecture outlines how Joule Studio can be leveraged to integrate and extend SAP and non-SAP solutions across cloud and hybrid landscapes. By tapping into the expertise of citizen developers, Joule Studio facilitates the adaptation, improvement, and innovation of business processes, driving positive business outcomes through sophisticated AI capabilities.


## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/Joule-Studio-Reference-Architecture.drawio)

## Flow

1.	The central entry point for consuming custom Joule skills and AI agents created in Joule Studio is the Joule client application, available on both Desktop and Mobile. The Joule conversational interface spans across SAP Cloud applications, providing a unified access point for all SAP out-of-the-box Joule capabilities and custom Joule skills, significantly enhancing efficiency for key business personas.
2.	Joule Studio is part of SAP Build, which includes SAP Build Apps, SAP Build Code, SAP Build Work Zone, and SAP Build Process Automation. It leverages SAP Build's user experience and lifecycle management capabilities. To provision Joule Studio, Joule must be set up in the target landscape along with SAP Build Process Automation as part of the SAP Build tenant with the build-default plan utilizing SAP Identity Authentication Service (IAS). Once these prerequisites are met, Joule Studio is automatically provisioned using formations in the BTP cockpit.
3.	Joule Studio enables extending Joule by creating new capabilities that can be deployed alongside the out-of-the-box capabilities provided by SAP. These capabilities include Joule Skills and AI Agents. Joule Skills automate rule-based, repetitive tasks using APIs, seamlessly integrating into SAP to enhance productivity. AI Agents tackle complex challenges with advanced planning and reasoning, integrating both SAP and non-SAP systems and leveraging Joule Skills. Both extend Joule by adding tailored automation and optimization capabilities.
4.	AI Core plays a crucial role in extending Joule's capabilities. It provides the underlying Large Language Models (LLMs) that can be leveraged to configure AI Agents. Additionally, customers can provision their own document grounding capabilities in AI Core and integrate them into their AI Agents to ground them in specific data. 
5.	SAP BTP Connectivity integrates existing workflows with Joule Skills and AI Agents, enabling seamless, automated execution across SAP and non-SAP systems. This enhances efficiency while leveraging current investments in automation.
6.	Once customers have created their custom Joule Skills and AI Agents, they can use SAP Build's lifecycle capabilities to compile and deploy these capabilities alongside their Joule central instance. This grants business users access to additional functionalities, helping them in their daily tasks through centralized access via Joule, reducing the need to switch between multiple SAP and non-SAP applications.
7.	Joule Studio integrates via the SAP Connectivity service with other SAP BTP services and external applications. This integration is based on APIs provided through various channels, such as Live API using Graph, SAP Cloud Application Programming Model, ABAP RESTful Application Programming Model, OData destinations, SAP systems, API Business Hub Enterprise, or SAP Business Accelerator Hub. Customers can upload API specifications or build API actions from scratch for robust integration.
8.	Joule Studio relies on SAP Cloud Identity Services - Identity Authentication for identity management and authentication. SAP Cloud Identity Services act as a central facade for identity and access management, offering secure authentication or federation with third-party identity providers. SAP Cloud Identity Directory stores the SAP identities, and SAP Cloud Identity Services can serve as a proxy for customer-owned identity providers.



## Characteristics

•	**Centralized AI Solution Across Hybrid SAP Landscapes**: Joule Studio in SAP Build empowers users to create and deploy custom Joule skills and AI agents, with Joule client applications serving as a centralized access point for managing AI capabilities across desktop and mobile platforms.

•	**Support for Third-Party Identity Providers: SAP Cloud Identity Services** - Identity Authentication allows federation with third-party identity providers, while SAP Cloud Identity Services - Provisioning facilitates the provisioning of user/role assignments from external sources, ensuring secure and seamless identity management.

•	**Global User ID**: A globally unique user identifier managed by SAP Cloud Identity Services - Identity Authentication ensures consistent and secure user access across Joule Studio integrations and deployments.

•	**Cloud and On-Premise Solution Integration**: Joule Studio integrates seamlessly with various SAP and third-party cloud solutions, including SAP ECC, SAP S/4HANA, and S/4HANA Cloud Private Edition, providing comprehensive support for hybrid landscapes.


## Examples in an SAP context

•	**Automated Customer Support Agent Deployment**: Joule Studio can be used to create AI agents that automatically handle customer inquiries, retrieve order statuses, and escalate issues when necessary. By integrating with SAP S/4HANA and external CRM systems, these agents provide consistent and efficient customer support.

•	**Order Management Optimization**: Joule Skills created in Joule Studio streamline the process of order management by automating tasks such as checking stock levels, processing orders, and providing delivery updates. This integration reduces manual work and improves accuracy across SAP and third-party systems.

•	**Procurement Negotiation and Compliance**: AI agents built in Joule Studio analyze supplier contracts, monitor compliance, and negotiate procurement deals, leveraging data from SAP ECC and external sources. This automation increases efficiency and ensures adherence to procurement policies.

•	**Talent Acquisition Enhancement**: Joule Studio can automate the creation and approval of job requisitions in SAP SuccessFactors, utilizing custom AI agents to streamline the process. These agents extract data from source files, manage approval workflows, and publish job openings, reducing manual effort and accelerating recruitment.

•	**Supply Chain Risk Management**: Joule Skills aid in monitoring supply chain risks by retrieving data from SAP S/4HANA and third-party systems. This automation helps businesses proactively manage disruptions, ensure timely deliveries, and maintain operational continuity.

•	**Mass Maintenance of Scheduling Agreements**: Business experts can use Joule Studio to automate the creation and modification of scheduling agreements based on specified criteria. This reduces manual intervention, improves transparency, and ensures compliance with business requirements, ultimately streamlining supply chain operations.

•	**Non-Repairable Parts Management**: AI agents can accelerate the recording and management of non-repairable parts, automating goods movements to designated storage locations in SAP systems. This reduces labor-intensive processes and minimizes errors associated with high-volume, manual declarations.

•	**Creation of Customer Material Info Records**: Joule Skills streamline the creation of CMIRs by automating validation, initiating approval workflows, and generating records upon approval through API integration with SAP S/4HANA. This reduces manual data entry, addressing data inconsistencies and improving efficiency in purchasing and procurement.

By leveraging Joule Studio in SAP Build, organizations can integrate AI capabilities into existing business processes, enhancing automation, productivity, and decision-making across both SAP and non-SAP systems.


## Services and Components

- [SAP Build, Joule Studio](https://discovery-center.cloud.sap/ai-feature/e93aa292-e7f4-449d-9586-f1a8510d5ab6/)
- [SAP Build](https://discovery-center.cloud.sap/serviceCatalog/sap-build/?region=all)
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core/?region=all)
- [Document Grounding](https://discovery-center.cloud.sap/ai-feature/fedeca14-3e69-472c-a0ea-82396735c35f/)
- [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all)
- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all)


## Resources

- [Joule Studio (sap.com)](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
- [Joule Studio in SAP Build, demo (sap.com)](https://www.sap.com/assetdetail/2024/10/1621dba3-d97e-0010-bca6-c68f7e60039b.html)
- [Build, Deploy, and Extend AI Agents with Joule Studio (SAP Community Blog Posts)](https://community.sap.com/t5/technology-blog-posts-by-sap/build-deploy-and-extend-ai-agents-with-joule-studio/ba-p/14105964)
- [Meet Joule Studio in SAP Build (YT video)](https://www.youtube.com/watch?v=JdwfjieiOFY)
- [Agent Builder in Joule Studio (YT video)](https://www.youtube.com/watch?v=C37FkIM83xw)
- [Interactive Value Journey](https://ivj-vx.cfapps.eu10.hana.ondemand.com/public/journey/2a840b1a-f1d9-4f42-9c75-8f377599de83/intro)
