---
id: id-ra0007
slug: /ref-arch/e7724ef4a7
sidebar_position: 7
sidebar_custom_props:
  category_index:
    - appdev
title: Multitenant SaaS Application using CAP
description: >-
  Multitenant SaaS applications built on SAP BTP offer a powerful way to extend
  SAPs core solutions and address specific industry or business needs at scale.
  By allowing multiple customers to share a single instance of the software,
  multitenancy lowers costs and makes maintenance simple for all users. This
  approach not only drives innovation and scalability but also enables faster
  time-to-market and more efficient resource utilization.
keywords:
  - sap
  - btp
  - multitenant
  - saas
  - cap
sidebar_label: Multitenant SaaS Application using CAP
image: img/logo.svg
tags:
  - appdev
  - cap
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - AjitKP91
  - alperdedeoglu
last_update:
  author: Ajit Kumar Panda
  date: 2025-01-31
---

In today's rapidly evolving digital landscape, multitenancy has become a crucial concept in the context of SAP architecture, particularly for SAP partners and line of business (LoB) teams developing applications on [SAP Business Technology Platform (SAP BTP)](https://www.sap.com/india/products/technology-platform.html). As businesses increasingly turn to SaaS solutions for their needs, understanding and leveraging multitenancy has become essential for creating innovative, scalable, and cost-effective applications within the SAP ecosystem.

Multitenant SaaS applications built on SAP BTP offer a powerful way to extend SAP's core solutions and address specific industry or business needs at scale. By allowing multiple customers to share a single instance of the software, multitenancy lowers costs and makes maintenance simple for all users. This approach not only drives innovation and scalability but also enables faster time-to-market and more efficient resource utilization.

Successful examples of multitenant applications on SAP BTP, such as [Circelligence by BCG](https://www.bcg.com/capabilities/climate-change-sustainability/circular-economy-circelligence) for circular economy management and [SAP Advanced Financial Closing](https://www.sap.com/products/financial-management/advanced-financial-closing.html) for streamlining financial close processes, demonstrate the potential for innovation and the ability to address specialized needs within the SAP landscape. These applications showcase how multi-tenancy can be leveraged to deliver scalable and efficient solutions to a diverse range of customers.

In this reference architecture, we will explore the key components and best practices for designing and implementing multitenant applications on SAP BTP. This reference architecture aims to provide practical insights and guidance for developing and deploying such applications, enabling our stakeholders to harness the full potential of SaaS solutions within the SAP environment.

## Overview

**_Multitenancy_** is a software architecture in which a single instance of a software application serves multiple customers, known as tenants. Each tenant is logically separated and operates as if they have their own isolated environment, even though they share the same underlying resources, such as the application itself, databases, and infrastructure. This allows for cost-efficient resource sharing and centralized management, making it an attractive model for SaaS providers.

| Single Tenancy | Multitenancy |
|: