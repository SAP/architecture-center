---
id: id-ra0008-1
slug: /ref-arch/f2670637a8/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Edge Integration Cell on AWS
description: >-
  Explore the reference architecture for deploying SAP Integration Suite - Edge
  Integration Cell on AWS. Learn about the required resources, and key
  considerations for setup and implementation on AWS.
keywords:
  - aws
  - eic
  - edge integration cell
sidebar_label: Edge Integration Cell on AWS
image: img/logo.svg
tags:
  - aws
  - eic
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - adarshnarayanhegde
discussion: 
last_update:
  author: adarshnarayanhegde
  date: 2025-02-20
---

SAP Integration Suite – Edge Integration Cell (EIC) can be deployed on Amazon Web Services (AWS) to leverage its scalable infrastructure while maintaining secure and controlled execution in a customer-managed environment. This architecture combines AWS-native services with EIC’s hybrid capabilities, ensuring a seamless integration experience.

## Architecture

![drawio](drawio/sap-edge-integration-cell-aws.drawio)

## Overview
Deploying EIC on AWS requires a secure, scalable, and resilient infrastructure that adheres to enterprise compliance and hybrid cloud best practices. This setup ensures that sensitive data stays within a private AWS environment while leveraging SAP Integration Suite in the cloud for design, monitoring, and lifecycle management.  


### AWS Setup

#### 1. VPC and Networking

To ensure a **secure and private execution environment**, create a **[Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)** with **multi-AZ redundancy** for high availability (HA).

- **Multi-AZ Deployment**:
  - Distribute your **EIC components** across **three AWS Availability Zones (AZs)** to ensure high availability. This setup helps maintain continuous service in case one AZ goes down, as the workload automatically fails over to another AZ.
  
- **Network Segmentation**:
  - **[Private Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html)**: Deploy critical **EIC runtime components** in **private subnets** to prevent direct access from public internet.
  - **[Public Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario1.html)**: These subnets are used for components like **EC2-based bastion hosts** or **[Network Load Balancers (NLB)](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html)**, which handle external traffic and distribute the load across different AZs.

- **Internet Access Control for EIC**:
  - **[NAT Gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)**: NAT allow components in private subnets to securely access external services without exposing internal EIC workloads to the internet.
  - **[Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)**: For EIC runtime components that need outbound internet access, the Internet Gateway enables the necessary connectivity.
  - **[Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)** and **[Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)**: These are used to enforce strict access control, ensuring secure communication between EIC components.



#### 2. Amazon EKS Cluster  

EIC workloads require a **containerized runtime**, making **[Amazon Elastic Kubernetes Service (EKS)](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html)** the preferred choice for **managing and scaling** integration flows.  

- **Cluster Setup**:  
  - The **EKS control plane** is fully managed by AWS, reducing operational overhead.  
  - **Worker nodes** are deployed in **private subnets** for **enhanced security**.  

- **Security and Access Control**:  
  - Use **[IAM roles for service accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)** to grant least-privilege permissions to pods.  

  For sizing recommendations, refer to this [SAP Note](https://me.sap.com/notes/3247839)


#### 3. Storage and Databases  

EIC requires multiple storage solutions for transaction logs, runtime data, and caching.

- **Amazon RDS**  
  - **[Amazon RDS](https://docs.aws.amazon.com/rds/index.html)** provides a fully managed relational database for storing EIC runtime data.  
  - **[Amazon RDS for PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)** is recommended for EIC.
  - Enable **[RDS Multi-AZ replication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)** for high availability.

- **Amazon ElastiCache**  
  - **[Amazon ElastiCache](https://docs.aws.amazon.com/elasticache/)** helps reduce latency by caching frequently accessed EIC runtime data using **[Redis](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/GettingStarted.serverless.step1.html)**. 

- **Amazon Elastic Block Store (EBS)**  
  - **[Amazon EBS](https://docs.aws.amazon.com/ebs/)** provides block storage for Kubernetes worker nodes with **ReadWriteOnce (RWO)** access, suitable for storing EIC application data.

- **Amazon Elastic File System (EFS)**  
  - **[Amazon EFS](https://docs.aws.amazon.com/efs/)** provides shared file storage with **ReadWriteMany (RWX)** access, allowing multiple EIC runtimes to read and write data concurrently.


### SAP Setup

#### 1. Activate EIC in your SAP BTP Subaccount
- Activate **[Edge Integration Cell (EIC)](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite-edge-integration-cell)** in your **[SAP Business Technology Platform (BTP)](https://help.sap.com/docs/btp?locale=en-US)** subaccount.  
- Assign the necessary roles to enable access to **Edge Lifecycle Management (ELM)** for managing and monitoring Edge nodes.  


#### 2. Configure a Technical User and Set Up SSO 
- Create **technical users** (**[P-User](https://help.sap.com/docs/EDGE_LIFECYCLE_MANAGEMENT/9d5719aae5aa4d479083253ba79c23f9/edcd1a455afb4cb0b6b1b3d148256468.html)** and **[S-User](https://www.sap.com/account/universal-id.html)**) to interact with the SAP systems and to access SAP repository based shipment channel.  
- Set up **Single Sign-On (SSO)** for secure repository access, including monitoring and logging.  


#### 3. Add an Edge Node and Bootstrap to Kubernetes
- Add an **Edge Node** in Edge Lifecycle Management (ELM) and bootstrap it to your **Amazon EKS cluster** running in your private AWS landscape.   



## Resources

You can find detailed, step-by-step instructions for both the basic and high availability (HA) setup, including SAP and AWS configuration and deployment steps, in the following GitHub repository:

[**Deploy SAP Integration Suite - Edge Integration Cell on Amazon Web Services**](https://github.com/SAP-samples/btp-edge-integration-cell-aws)

## Recommendation
The architecture and setup instructions in the GitHub repository above outline a small production deployment. Since deployments vary depending on business needs, these recommendations should be treated as a starting point.

## Explore More
- [**Blog:** Getting Started with Edge Integration Cell on AWS: A Setup Guide Using SAP Integration Suite](https://community.sap.com/t5/technology-blogs-by-sap/getting-started-with-edge-integration-cell-on-aws-a-setup-guide-using-sap/ba-p/13880982)
- [Setting Up and Managing Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/setting-up-and-managing-edge-integration-cell)