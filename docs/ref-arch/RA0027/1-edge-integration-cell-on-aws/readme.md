---
id: id-ra0027-1
slug: /ref-arch/Oc_OUeq3
sidebar_position: 1
title: 'Edge Integration Cell on AWS [RA0027]'
description: 'blah blah'
keywords:
  - aws
  - gcp
sidebar_label: 'Edge Integration Cell on AWS'
tags:
  - aws
  - gcp
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

# Edge Integration Cell on AWS

SAP Integration Suite – Edge Integration Cell (EIC) can be deployed on Amazon Web Services (AWS) to leverage its scalable infrastructure while maintaining secure and controlled execution in a customer-managed environment. This architecture combines AWS-native services with EIC’s hybrid capabilities, ensuring a seamless integration experience.



# Architecture

# ![drawio](drawio/diagram-9PNKk2U7ri.drawio)

Overview

Deploying EIC on AWS requires a secure, scalable, and resilient infrastructure that adheres to enterprise compliance and hybrid cloud best practices. This setup ensures that sensitive data stays within a private AWS environment while leveraging SAP Integration Suite in the cloud for design, monitoring, and lifecycle management.

### AWS Setup

### 1. VPC and Networking

To ensure a **secure and private execution environment**, create a [**Virtual Private Cloud (VPC)**](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) with **multi-AZ redundancy**for high availability (HA).

- **Multi-AZ Deployment**:
- - Distribute your **EIC components** across **three AWS Availability Zones (AZs)** to ensure high availability. This setup helps maintain continuous service in case one AZ goes down, as the workload automatically fails over to another AZ.


- **Network Segmentation**:
- - [**Private Subnets**](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html): Deploy critical **EIC runtime components** in **private subnets** to prevent direct access from public internet.
- [**Public Subnets**](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario1.html): These subnets are used for components like **EC2-based bastion hosts** or [**Network Load Balancers (NLB)**](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html), which handle external traffic and distribute the load across different AZs.





