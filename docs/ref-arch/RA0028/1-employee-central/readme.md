---
id: 
slug: 
sidebar_position: 
title: SAP SuccessFactors Employee Central
description: Overview of the main data structures within SAP SuccessFactors Employee Central
keywords:
  - ref-arch
  - successfactors
  - hcm
  - human capital management
  - HR
  - employee experience
  - employee central
sidebar_label: SAP SuccessFactors Employee Central
image: img/logo.svg
tags:
  - ref-arch
  - community-contrib
  - successfactors
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - arjenvanhooydonk
discussion: 
last_update:
  author: arjenvanhooydonk
  date: 
---

:::note External Contribution

**This content is brought to you by [Pentos](https://www.pentos.com), an SAP partner.**

:::

SAP SuccessFactors Employee Central is SAP's core cloud-based human capital management (HCM) system designed to centralize and streamline all employee data and HR processes. It serves as the master record system for personnel information, including employment history, compensation, benefits, tax details, and organizational assignments. Employee Central enables organizations to manage the full employee lifecycle—from recruitment through retirement—with real-time data synchronization across HR functions, payroll, and talent management systems. With strong compliance capabilities for global workforce management and integration with other SAP SuccessFactors modules (such as Performance Management, Learning, and Succession Planning), Employee Central provides a unified platform that improves data accuracy, enhances HR operational efficiency, and supports strategic workforce decisions.

## High Level Data Model

SAP SuccessFactors Employee Central consists out of a large set of configuration and data tables. They are split over multiple levels and configuration objects. Most objects are effective dated, but there are a handful of tables that can only hold a single record per person or assignment/employment. This section will give an overview of how SAP SuccessFactors Employee Central is setup and where to configure which object. It does not go into how to add data into the objects, only where to create/update the objects themselves.

![drawio](drawio/successFactors-employee-central-data-model.drawio)

SAP SuccessFactors Employee Central can be split into three levels of data; organizational information, person related information and assignment/employment related information:
  - Organizational Information: Information describing the organization or structures within the organization
  - Person Related Information: Information that is linked to a physical person. It will move with the person, even if the person leaves the employer
  - Assignment/Employment Related Information: Information describing the contract/relationship between the person and the employer. Describes a specific assignment/employment (SAP uses the terms interchangeably) that starts at the initial hiring of the employee and ends at termination. A person can have one or multiple assignments/employments (consecutive or concurrent) with an employer over their lifetime.

The date model in SAP SuccessFactors Employee Central is split over five configuration objects:
  - (Succession) Data Model: The main configuration model for person and assignment/employment related information; all global fields are configured here. Some of the newer objects are configured as Meta Data Framework objects. Configuration can be done via Manage Business Configuration or in XML outside of SuccessFactors
  - Country Specific (Succession) Data Model: The local version of the Data Model. Objects which contain mostly country specific fields are configured here. Configuration can be done via Manage Business Configuration or in XML outside of SuccessFactors
  - Corporate Data Model  (aka Foundation Objects): Legacy data model that is mostly replaced by the Meta Data Framework, there are still some objects not migrated (see also [Influence Idea - Complete Foundation Object to MDF migration](https://influence.sap.com/sap/ino/#/idea/337994)). Configuration can only be done in XML outside of SuccessFactors
  - Country Specific Corporate Data Model  (aka Country Specific Foundation Objects): Legacy data model that is mostly replaced by the Meta Data Framework, only corporate addresses remain. Configuration can only be done in XML outside of SuccessFactors
  - Meta Data Framework (aka MDF or Generic Objects): Meta Data Framework is the latest configuration object to be added to Employee Central and contains most of the configuration. It 

## Organization Structures

Unlike in SAP HCM (for SAP S/4HANA) SAP SuccessFactors main organizational structure is not build based on organizational units. The positions are the heart of the structure and define the hierarchy. Relevant data is copied form the position to the job information card on employee level when an employee is linked to the position. This adds a lot of flexibility to how the three standard organizational objects (Business Unit, Division and Department) are used. They can be used as a single hierarchy or as separate structures depending on reporting, integration and permission needs. See also the relavant [Architecture Leading Practice | Organization Structures](https://dam.sap.com/mac/u/a/HUc6tfm.htm?rc=10).

## Pay Structures

SAP SuccessFactors Employee Central has two distinct pay structures that can be setup and used. They are not mutually exclusive and can be used next to each other (although an employee can only be linked to one of the two models). See also the relavant [Architecture Leading Practice | Pay Structures](https://dam.sap.com/mac/u/a/ySB89oz.htm?rc=10).

![drawio](drawio/successFactors-employee-central-pay-models.drawio)

The Pay Grade Model is used for employees where a salary range applies; usually linked to a salary grading system like the Hay model. When the salary for an employee is defined in an annual salary review cycle (like the SAP SuccessFactors Compensation module) the employee needs to be on the Pay Grade Model.
The Scale Model is used for employees where there is a contractual progression of the salary; usually linked to CLAs. Periodically (or as part of a promotion) the employees move to the next Pay Scale Level and receive the salary linked to that level.

## Resources

- [SAP SuccessFactors Employee Central | SAP Help Portal | SAP Help Portal](https://help.sap.com/docs/successfactors-employee-central?locale=en-US&version=LATEST)
- [Architecture Leading Principles | SAP SuccessFactors | SAP Community](https://pages.community.sap.com/topics/successfactors/architecture-leading-practices)
- [Implementation Design Principles | SAP SuccessFactors | SAP Community](https://pages.community.sap.com/topics/successfactors/implementation-design-principles)
