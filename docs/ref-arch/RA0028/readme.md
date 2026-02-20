---
id: id-ra0028
slug: /ref-arch/5Hlvofqg
sidebar_position: 28
title: 'SAP SuccessFactors Suite'
description: 'Overview of the SAP SuccessFactors modules and how data flows between them'
keywords: 
  - ref-arch
sidebar_label: 'SAP SuccessFactors Suite'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - ref-arch
contributors:
  - arjenvanhooydonk
last_update:
  date: 2026-02-20
  author: arjenvanhooydonk
---

The SAP SuccessFactors Suite is a cloud‑based Human Experience Management (HXM) platform designed to support the full employee lifecycle through an integrated set of talent, core HR, and analytics solutions. At the foundation sits the BizX platform, which houses core modules such as **Employee Central (EC)** for global master data management, **Recruiting Management**, **Onboarding**, **Performance & Goals**, **Compensation**, and more. These modules share a common data model, user interface, and extensibility framework, enabling consistent data flows and streamlined HR operations across the organization.

Surrounding the core BizX capabilities are specialized components that extend value through deeper functional and technical integration. **Employee Central Payroll (ECP)** delivers highly localized, SAP‑HCM‑grade payroll processing in the cloud, directly connected with EC for master and time data. **Identity Authentication Service (IAS)** and **Identity Provisioning Service (IPS)** provide secure, modern identity management, enabling SSO, user lifecycle automation, and harmonized access across the SuccessFactors landscape and connected systems. Talent acquisition is further enhanced by **Recruiting Marketing (RMK)** for candidate attraction and branding, and **Recruiting Posting (RPO)** for automated job distribution across global job boards. Please note that Recruiting Management, Marketing and Posting will be replaced with SmartRecruiters; as soon as the new integration is fleshed out this page will be updated.

Complementing these modules, **SuccessFactors Learning** supports workforce development with structured programs, certifications, and blended learning experiences, while **Story Reports (People Analytics)** provides advanced, model‑driven workforce insights built on SAP Analytics Cloud technology. Together, these solutions create a cohesive, extensible ecosystem that allows organizations to manage people processes end‑to‑end, unify their HR data, and deliver a consumer‑grade experience to employees, managers, and HR professionals. The suite’s modular architecture ensures that each component drives value on its own while contributing seamlessly to a holistic HXM strategy.

# Architecture

At the heart of SAP SuccessFactors sits the Employee Profile together with the Login Information. These are part of the Foundation layer of SuccessFactors which is available for all SuccessFactors customers, no matter which modules are licensed. Next to that the Foundation layer contains Position Mangement, the Job Profile Builder, the Talent Intelligence Hub and Table Reports.

SAP SuccessFactors leverages some SAP core components like IAS and IPS for login and SAP Joule as an integrated agent.



# Resources

- [SAP SuccessFactors HCM | SAP Help Portal | SAP Help Portal](https://help.sap.com/docs/SAP_SUCCESSFACTORS_HXM_SUITE)

