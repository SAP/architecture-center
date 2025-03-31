---
id: id-ra0008
slug: /ref-arch/f2670637a8
sidebar_position: 8
sidebar_custom_props:
  category_index:
    - aws
    - gcp
    - azure
    - integration
    - appdev
title: Edge Integration Cell on Hyperscalers
description: >-
  Discover reference architectures for deploying SAP Integration Suite - Edge
  Integration Cell on hyperscalers. Access architecture diagrams and key
  resources to understand its setup and implementation.
keywords:
  - sap
  - aws
  - azure
  - gcp
  - eic
  - edge integration cell
sidebar_label: Edge Integration Cell on Hyperscalers
image: img/logo.svg
tags:
  - aws
  - azure
  - gcp
  - eic
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - adarshnarayanhegde
  - madankumarpichamuthu
  - AFK-Python
discussion: 
last_update:
  author: adarshnarayanhegde
  date: 2025-03-06
---

Edge Integration Cell (EIC), part of the SAP Integration Suite, brings a powerful hybrid integration runtime that bridges the gap between the cloud and your private landscape. It provides the flexibility to seamlessly manage APIs and run integration scenarios within a controlled environment, combining the best of both worlds.

With its hybrid deployment model, EIC makes it easy to design and monitor integration content in the cloud, while still allowing it to be securely deployed and run in a customer managed private environment.

## Architecture

![drawio](drawio/sap_eic.drawio)

## Flow

The architecture diagram above illustrates the high-level setup of the Edge Integration Cell (EIC). To deploy EIC in your private landscape, follow these steps:

### Hyperscaler Setup

-   Set up an isolated network environment within your private hyperscaler landscape.
-   Provision a Kubernetes cluster to serve as a secure and scalable runtime for EIC.
-   Configure storage services to manage runtime data.

### SAP BTP Setup

-   Activate EIC in your SAP BTP subaccount and assign the necessary roles for accessing Edge Lifecycle Management (ELM).
-   Configure a technical user and set up Single Sign-On (SSO) for repository access, monitoring, and logging.
-   Add an Edge Node and bootstrap it to the Kubernetes cluster in your private landscape.

## Problem Statement and Relevance

In modern enterprise landscapes, integration between SAP systems either cloud or on-premise is critical for seamless business operations. However, organizations face challenges when integrating systems across private and public cloud environments due to security, compliance, and latency concerns.

### Key Challenges:

1. **Security & Compliance Constraints**: Many enterprises, particularly in regulated industries (e.g., finance, healthcare, government), must ensure that sensitive data remains within their private infrastructure due to legal or compliance requirements.

2. **Network Security & Private Connectivity**: Some customers require integration solutions that do not expose data to the public internet or external cloud services.

3. **Latency & Performance Optimization**: If an SAP BTP region is geographically distant from an enterprise’s core systems, network latency can degrade integration performance.

SAP Edge Integration Cell (EIC) addresses these challenges by enabling integration within an organization’s private cloud or on-premise environment, ensuring that data does not leave the secure perimeter while still leveraging SAP Integration Suite’s capabilities.

## Value Proposition and Key Use Cases

![EIC Hybrid Landscape](./images/eic_landscape.png)

SAP Edge Integration Cell extends SAP Integration Suite’s hybrid deployment model, enabling customers to manage, design, and monitor integration flows in the cloud while executing them within their private infrastructure.

### Key Benefits:

-   **Hybrid Deployment Flexibility**: EIC enables customers to run integration scenarios within their private landscape while maintaining centralized governance via SAP Integration Suite.

-   **Enhanced Security & Compliance**: Organizations can ensure that sensitive business data remains within their internal network, complying with regulatory mandates like GDPR, or financial sector regulations.

-   **Improved Latency & Performance**: By processing integration flows closer to customer's SAP systems, EIC can minimize latency and improve response times in cases where SAP BTP region is geographically distant.

### Use Cases:

1. **On-Premise & Private Cloud Integration**: Enterprises with strict security policies can integrate SAP S/4HANA, SAP ECC, or other SAP applications within their controlled environment.

2. **Regulatory Compliance**: Businesses operating in regions without an SAP BTP presence can deploy EIC locally to ensure data processing remains compliant with local laws.

3. **SAP Process Integration (PI) Migration**: Customers transitioning from SAP Process Integration (PI) or Process Orchestration (PO) can use EIC as a stepping stone to adopt SAP Integration Suite’s modern capabilities without moving data outside their premises.

4. **Edge Processing for Industrial Use Cases**: Example - Manufacturing or logistics companies can process IoT or operational data within factory networks to enhance security and reduce latency.

## Services and Components

![EIC Landscape](./images/eic_components.png)

### Services

-   **SAP Integration Suite**: An industry-leading, enterprise-grade integration platform-as-a-service (iPaaS) that enables businesses to seamlessly connect and integrate their applications, data, and processes within and beyond their organization.

-   **Managed Kubernetes Service**: Kubernetes serves as the runtime environment for EIC, providing a scalable and secure infrastructure for enterprise-grade integration scenarios.

-   **Storage Services**: Storage solutions, including block storage, databases, and data stores, ensure efficient storage of runtime and logging data generated by EIC.

### Components

-   **Edge Lifecycle Management (Edge LM)**: The foundation for software lifecycle management, providing a shipment channel for SAP Business Technology Platform-based products like EIC. It enables the delivery and management of containerized workloads in on-premise or edge computing environments. Edge LM also serves as a central hub for managing and monitoring integration scenarios running in the EIC environment.

-   **Runtime and Operations**: The core component of EIC responsible for executing integration scenarios within the customer's private landscape. It also includes management capabilities for edge operations.

-   **Backing Services**: EIC relies on various backing services to support its functionality. These include messaging services for asynchronous communication, load balancing to distribute traffic across Kubernetes nodes and services, and other essential services required for integration and operational efficiency.

## Resources

-   [SAP Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite-edge-integration-cell)
-   [SAP Integration Suite](https://help.sap.com/docs/integration-suite?locale=en-US)
-   [EIC Technical Landscape](https://help.sap.com/docs/integration-suite/sap-integration-suite/technical-landscape-edge)
-   [Hybrid Deployment Using Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/hybrid-deployment-using-edge-integration-cell)
-   [**Blog:** Getting Started with Edge Integration Cell on AWS: A Setup Guide Using SAP Integration Suite](https://community.sap.com/t5/technology-blogs-by-sap/getting-started-with-edge-integration-cell-on-aws-a-setup-guide-using-sap/ba-p/13880982)