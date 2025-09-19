---
id: id-ra0027
slug: /ref-arch/JAlhP-Iv
sidebar_position: 27
title: 'Edge Integration Cell on Hyperscalers [RA0027]'
description: 'Okay'
keywords:
  - aws
sidebar_label: 'Edge Integration Cell on Hyperscalers'
tags:
  - aws
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - abhissharma21
discussion: ''
last_update:
  date: 2025-09-19
  author: abhissharma21
---

# Edge Integration Cell on Hyperscalers

In today's enterprise landscape, organizations are under increasing pressure to modernize their integration strategies. They must connect a growing mix of SAP and non-SAP systems, deployed across cloud, on-premise, and hybrid environments — all while adhering to strict data security, regulatory compliance, and performance expectations.

**SAP Integration Suite – Edge Integration Cell (EIC)** emerges as a strategic solution to these challenges. It enables customers to deploy integration capabilities within their **private infrastructure**, while still benefiting from the centralized governance and design-time tools of the cloud-based **SAP Integration Suite**.

This architecture document explores the rationale, design considerations, and business value of adopting **SAP EIC**.

# Architecture

# ![drawio](drawio/diagram-FZ66j13rG4.drawio)

Flow

The architecture diagram above illustrates the high-level setup of the Edge Integration Cell (EIC). To deploy EIC in your private landscape, follow these steps:

### Hyperscaler Setup

- Set up an isolated network environment within your private hyperscaler landscape.
- Provision a Kubernetes cluster to serve as a secure and scalable runtime for EIC.
- Configure storage services to manage runtime data.

### SAP BTP Setup

- Activate EIC in your SAP BTP subaccount and assign the necessary roles for accessing Edge Lifecycle Management (ELM).
- Configure a technical user and set up Single Sign-On (SSO) for repository access, monitoring, and logging.
- Add an Edge Node and bootstrap it to the Kubernetes cluster in your private landscape.



