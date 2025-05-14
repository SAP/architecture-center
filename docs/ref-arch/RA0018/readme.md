---
id: id-ra0018
slug: /ref-arch/99fd0564be
sidebar_position: 18
sidebar_custom_props:
  category_index:
    - appdev
title: Integrate and Extend with SAP Build Process Automation
description: >-
  SAP Build Process Automation is a no-code/low-code solution for automating
  business processes. Integrate SAP and non-SAP systems across cloud and hybrid
  landscapes with features like workflow management, robotic process automation,
  and predefined content. Streamline tasks such as scheduling agreements, job
  requisitions, and data management, enhancing productivity and reducing manual
  effort.
keywords:
  - sap
  - btp
  - build process automation
  - integration
  - automation
sidebar_label: Integrate and Extend with SAP Build Process Automation
image: img/logo.svg
tags:
  - build
  - azure
  - aws
  - gcp
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - fabianleh
discussion: 
last_update:
  author: fabianleh
  date: 2025-05-14
---

# Integrate and extend SAP and non-SAP solutions with SAP Build Process Automation

SAP Build Process Automation is a citizen developer solution to adapt, improve, and innovate business processes with no-code workflow management and robotic process automation capabilities.

SAP Build Process Automation enables business users and technologists to become citizen developers. With intuitive low-code and no-code capabilities, the solution supports you in driving automation by tapping into the expertise of citizen developers.

This reference architecture describes how SAP Build Process Automation can be used to integrate and extend SAP and non-SAP solutions in cloud and hybrid landscapes. It is also related to the Robotic Process Automation use case pattern of the SAP Integration Solution Advisory Methodology. 

## Architecture

![drawio](drawio/integrate-and-extend-with-sap-build-process-automation.drawio)

## Flow

The SAP Build Process Automation architecture diagram highlights five key flows when creating process automations across systems:

1. End users can access SAP Build Process Automation via the web and mobile native applications:  
  
    - SAP Build Work Zone Web (Standard / Advanced Edition)  
    - SAP Build Work Zone Advanced (Mobile Application for Advanced Edition)  
    - SAP Mobile Start (SAP Start & Standard Edition only)

2. For identity management and authentication, SAP Build Process Automation relies on SAP Cloud Identity Services - Identity Authentication as the identity provider. SAP Cloud Identity Services serves as a central facade for the identity and access management. In this context, SAP Cloud Identity Services - Identity Authentication offers secure authentication or federation with third-party identity providers. The SAP Cloud Identity Services - Identity Directory stores the SAP identities. SAP Cloud Identity Services can also be used as a proxy for a customer-owned identity provider.

3. SAP Build Process Automation consists of multiple components enabling different capabilities out of the box, which cannot be decoupled from the product. When SAP Build Process Automation is activated in a subaccount of SAP BTP, these components are invisible in the list of subscriptions and service instances. They are all an integral part of the solution itself (SAP Build Process Automation subscription). This includes services like Decisions, Process Visibility, Processes, and Automations.

4. SAP Build Process Automation integrates via the SAP Connectivity service with other SAP BTP services and applications outside of SAP BTP. The integration is based on APIs provided via different channels, such as Live API using Graph, SAP Cloud Application Programming Model, ABAP RESTful Application Programming Model OData destinations, SAP systems, API Business Hub Enterprise, or API specifications using SAP Business Accelerator Hub, uploading API specifications, and building API actions from scratch.

5. Processes in SAP Build Process Automation can be triggered via events, APIs, schedules, and forms. Forms can be provided based on SAP Build Process Automation Forms, UI5 applications or SAP Build Apps.

6. When moving business content from one environment to another – for example from development to test – this can be achieved via manual export/import or via integration with SAP Cloud Transport Management.

## Characteristics

- **Central automation solution across hybrid SAP landscapes**: SAP Build Process Automation allows users to easily build approval processes across systems with SAP Task Center as a centralized access point for end users to manage their tasks.  

- **Support of third-party identity providers**: SAP Cloud Identity Services - Authentication allows federation with third-party identity providers, and SAP Cloud Identity Services - Provisioning enables provisioning of user/role assignments from third-party sources. 

- **Global User ID**: A globally unique user identifier defined by SAP Cloud Identity Services - Identity Authentication and used by SAP Build Process Automation.  

- **Cloud and on-premise solution integration**: Apart from integrating with various SAP and third-party cloud solutions, SAP Build Process Automation can also be configured to work with SAP ECC, SAP S/4HANA, and S/4HANA Cloud Private Edition. 

- **Predefined content**: Predefined content for SAP Build Process Automation is directly available via the integrated store and can be used with or without adaptation based on customer needs.  

## Examples in an SAP context

SAP Build Process Automation is used in various use cases across all lines of business and industries:

- **Mass maintenance of scheduling agreements**:

    Business experts are enabled to accelerate the automation of creation and changes to scheduling agreements transparently while meeting business requirements. The use case includes approval decisions and automation of master data content. By automating this process, organizations can streamline supply chain operations and improve productivity. Based on selection criteria, the process is triggered in SAP Build Process Automation, and a scheduling agreement is created or changed for all valid scheduling agreements.  

- **Non-repairable part auto-recording with goods movement**:

    Business experts can accelerate recording of non-repairable equipment and spare parts and post goods movement of spare parts to a non-repairable storage location transparently.

    Mass recording of non-repairable status and posting goods movements for parts that are currently non-repairable, but may be repairable later, is a common activity in the repair business. Manually declaring high volumes of such parts is time-consuming, labor-intensive, and error-prone due to multiple manual steps. This solution streamlines the process, reducing time and effort for high-frequency, high-volume declarations of non-repairable parts.

    Based on selection criteria, an SAP Build Process Automation process is triggered to either change the system status of equipment to deactivated or post a goods movement for spare parts to a non-repairable storage location in the SAP S/4HANA system.

- **Creation and approval of mass job requisition**:

    This use case streamlines and automates the process of creating and approving job requisitions for open positions with multiple vacancies within SAP SuccessFactors Employee Central (EC).

    The process extracts necessary data from a source file (e.g., Excel) and utilizes relevant APIs to create and approve the requisitions, ultimately reducing manual data entry and enhancing the speed and efficiency of job requisition workflows. Upon successful completion of the process, the job requisition is in 'Open' status. These requisitions can be published to internal and external job sites, making them available for candidates to view and apply for the respective job positions. This end-to-end process not only reduces manual data entry and processing but also enhances the speed and efficiency of job requisition creation and approval within the organization's hiring workflow.   

- **Create customer material info records**:

    This use case reduces manual effort for the creation of customer material info records (CMIR) in the SAP S/4HANA system. Automation validates duplicate entries, initiates workflow for approval, and automatically creates CMIRs upon approval via API, addressing issues like data inconsistencies and inefficiencies. This is especially important in areas such as purchasing and procurement, where there is a high volume of manually created CMIRs, frequently initiated via email.


## Services and Components

- [SAP Business Application Studio](https://discovery-center.cloud.sap/serviceCatalog/business-application-studio?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all)
- [SAP Document Management service, integration option](https://discovery-center.cloud.sap/serviceCatalog/document-management-service-integration-option?region=all)
- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
- [SAP Build Apps](https://discovery-center.cloud.sap/serviceCatalog/sap-build-apps?region=all)
- [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all) 
- [SAP Build Work Zone](https://discovery-center.cloud.sap/serviceCatalog/sap-build-work-zone-advanced-edition?region=all)

## Resources

- [SAP Build Process Automation (SAP Community Blog Posts)](https://community.sap.com/t5/c-khhcw49343/SAP+Build+Process+Automation/pd-p/73554900100800003832)
- [SAP Build Process Automation (SAP Help Portal)](https://help.sap.com/viewer/product/PROCESS_AUTOMATION/Cloud)
- [SAP Build Process Automation (SAP Tutorials)](https://developers.sap.com/tutorial-navigator.html?tag=software-product%3Atechnology-platform%2Fsap-build%2Fsap-build-process-automation)
- [SAP Build Process Automation (SAP Learning Journeys)](https://learning.sap.com/learning-journeys?page=1&query=sap+build+process+automation)

## Related Missions

- [Process and approve your invoices with SAP Build Process Automation](https://discovery-center.cloud.sap/index.html#/missiondetail/3260/3344/)
- [Extend SAP S/4HANA with SAP Build Process Automation](https://discovery-center.cloud.sap/index.html#/missiondetail/4163/4406/)
- [Extend Pre-built Automation Procurement Packages in SAP Build Process Automation](https://discovery-center.cloud.sap/index.html#/missiondetail/4018/4222/)