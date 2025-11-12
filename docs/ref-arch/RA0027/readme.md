---
id: id-ra0027
slug: /ref-arch/e6J6iLzk
sidebar_position: 1
title: '3rd-Party Payroll Consolidation with Joule'
description: 'Enable employees to securely access pay slips and tax documents from third-party payroll systems directly within SAP SuccessFactors using Joule. Simplifies the user experience by removing the need for separate logins and streamlines payroll communication to HR.'
sidebar_label: '3rd-Party Payroll Consolidation with Joule'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - genai
  - agents
contributors:
  - mfarooqi-hub
last_update:
  date: 2025-11-12
  author: mfarooqi-hub
---

# Overview

Improve the employee experience by enabling seamless access to payroll and tax information directly within SAP SuccessFactors, eliminating the need for separate logins to third-party systems such as SecurePayroll.

Using Joule and SAP Build, this architecture empowers employees to securely access payslips and tax documents via AI-driven conversational interfaces. The solution integrates with SAP Cloud Identity Services for authentication and authorization, ensuring data privacy and compliance.

# Architecture Diagram

![drawio](drawio/diagram-0Mm8uJpPUj.drawio)





# Architecture Components

## SAP BTP Subaccount (Multi-Cloud)

Hosts the solution components within the SAP Business Technology Platform.

## SAP Build

Provides a low-code/no-code environment for creating and extending applications:

### Joule Studio

Used to create and deploy custom AI skills and agents:

**Joule Skill **– Defines actions such as “Retrieve Payslip” or “Fetch Tax Document.”

## Joule

The AI copilot that truly understands your business.

**SAP-delivered skills** – Prebuilt capabilities for standard business processes.

**Custom skills** (Tax & Payroll) – Developed to interact with the third-party SecurePayroll API to fetch and present payroll data within SAP SuccessFactors.

## SAP Cloud Identity Services

Ensures secure authentication and authorization for all users and systems involved.

## SAP SuccessFactors

Core HR system used by employees to access payroll, tax, and personal information.

## 3rd Party APIs & Applications

SecurePayroll – External payroll provider exposing APIs for payslips and tax document retrieval. Integration occurs over secure HTTPS connections through SAP BTP destinations.

# Process Flow

1. Employee Login: The end user authenticates to SAP SuccessFactors via SAP Cloud Identity Services using SAML2/OIDC.
2. Access Joule Skill: From within SAP SuccessFactors, the employee interacts with Joule, asking for payslip or tax document information.
3. Skill Invocation: Joule triggers the Payroll Skill or Tax Skill hosted in Joule Studio.
4. Data Retrieval: The Joule Skill securely calls the SecurePayroll API via HTTPS using configured destinations in BTP.
5. Response Delivery: Retrieved data (payslip/tax details) is displayed directly in Joule, providing a seamless, single-login experience.

# Security and Compliance

**Authentication**: Managed through SAP Cloud Identity Services (SAML2/OIDC)

**Authorization**: Role-based access controls from SAP SuccessFactors

**Data Transmission**: Secured via HTTPS

# Benefits

- Unified Employee Experience – Single access point within SAP SuccessFactors
- Reduced HR Support Load – Automated payroll and tax data retrieval
- Secure Data Access – Federated identity and secure API integration
- Faster Response Times – AI-driven conversational access to payroll data
- Scalable and Extensible – Easily add more Joule skills for additional HR tasks

