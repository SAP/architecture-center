---
id: id-ra0008-3
slug: /ref-arch/263f576c90/3
sidebar_position: 3
sidebar_custom_props:
  category_index: []
title: Edge Integration Cell on GCP
description: >-
  Explore the reference architecture for deploying SAP Integration Suite - Edge
  Integration Cell on GCP. Learn about the required resources, and key
  considerations for setup and implementation on GCP.
keywords:
  - sap
  - gcp
  - eic
sidebar_label: Edge Integration Cell on GCP
image: img/ac-soc-med.png
tags:
  - gcp
  - eic
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - AFK-Python
discussion: 
last_update:
  author: AFK-Python
  date: 2025-02-20
---

SAP Integration Suite – Edge Integration Cell (EIC) can be deployed on Google Cloud Platform (GCP) to leverage its scalable infrastructure while maintaining secure and controlled execution in a customer-managed environment. This architecture combines GCP-native services with EIC’s hybrid capabilities, ensuring a seamless integration experience.

## Architecture

![drawio](drawio/sap-edge-integration-cell-gcp.drawio)


## Overview

Deploying EIC on GCP requires a secure, scalable, and resilient infrastructure that adheres to enterprise compliance and hybrid cloud best practices. This setup ensures that sensitive data stays within a private GCP environment while leveraging SAP Integration Suite in the cloud for design, monitoring, and lifecycle management.  


### GCP Setup

#### 1. VPC and Networking

To ensure a **secure and private execution environment**, create a **[Virtual Private Cloud (VPC)](https://cloud.google.com/vpc/docs/vpc)** with **multi-AZ redundancy** for high availability (HA).

- **Multi-AZ Deployment**:
  - Distribute your **EIC components** across **three Availability Zones (AZs)** to ensure high availability. This setup helps maintain continuous service in case one AZ goes down, as the workload automatically fails over to another AZ.
  
- **Network Segmentation**:
  - **[Private Subnets](https://cloud.google.com/vpc/docs/subnets)**: Deploy critical **EIC runtime components** in **private subnets** to prevent direct access from public internet.
  - **[Public Subnets](https://cloud.google.com/vpc/docs/subnets)**: These subnets are used for components like **bastion hosts** or **[Network Load Balancers (NLB)](https://cloud.google.com/load-balancing/docs/load-balancing-overview)**, which handle external traffic and distribute the load across different AZs.

- **Internet Access Control for EIC**:
  - **[Cloud NAT](https://cloud.google.com/nat/docs/overview)**: NAT allow components in private subnets to securely access external services without exposing internal EIC workloads to the internet.
  - **[Cloud Router](https://cloud.google.com/network-connectivity/docs/router/concepts/overview)**: For dynamic routing and connecting GCP VPCs to on-premises networks or other cloud environments, Cloud Router enables seamless communication with external networks and supports the use of VPNs and Interconnect connections.

  - **[Firewall Rules](https://cloud.google.com/firewall/docs/firewalls)**: Firewall rules in GCP allow you to control inbound and outbound traffic to and from your VM instances, ensuring secure communication within your VPC. These rules are defined based on IP ranges, ports, and protocols, and can be applied to specific network tags or all resources in a VPC.




#### 2. GKE Cluster  

EIC workloads require a **containerized runtime**, making **[Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine/docs)** the preferred choice for **managing and scaling** integration flows.  

- **Cluster Setup**:  
  - The **GKE control plane** is fully managed by GCP, reducing operational overhead.  
  - **Worker nodes** are deployed in **private subnets** for **enhanced security**.  

- **Security and Access Control**:  
  - Use **[Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)** to grant least-privilege permissions to workloads in GKE, allowing secure and granular access to GCP services without long-lived credentials. 
  - Leverage **[Google Cloud IAM](https://cloud.google.com/iam/docs/)** to manage access control for users, groups, and service accounts across GCP resources, ensuring proper permissions are granted.
 

  For sizing recommendations, refer to this [SAP Note](https://me.sap.com/notes/3247839)


#### 3. Storage and Databases  

EIC requires multiple storage solutions for transaction logs, runtime data, and caching.

- **Amazon RDS**  
  - **[Google Cloud SQL](https://cloud.google.com/sql/docs/introduction)** provides a fully managed relational database for storing EIC runtime data.  
  - **[Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)** is recommended for EIC.
  - Enable **[Multi-AZ replication](https://cloud.google.com/sql/docs/postgres/configure-ha)** for high availability.

- **Google Memorystore**  
  - **[Google Memorystore](https://cloud.google.com/memorystore#documentation)** helps reduce latency by caching frequently accessed EIC runtime data using **[Redis](https://cloud.google.com/memorystore/docs/cluster/memorystore-for-redis-cluster-overview)**. 


- **Google Filestore**  
  - **[Google Filestore](https://cloud.google.com/filestore#documentation)** provides shared file storage with **ReadWriteMany (RWX)** access, allowing multiple EIC runtimes to read and write data concurrently.


### SAP Setup

#### 1. Activate EIC in your SAP BTP Subaccount
- Activate **[Edge Integration Cell (EIC)](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite-edge-integration-cell)** in your **[SAP Business Technology Platform (BTP)](https://help.sap.com/docs/btp?locale=en-US)** subaccount.  
- Assign the necessary roles to enable access to **Edge Lifecycle Management (ELM)** for managing and monitoring Edge nodes.  


#### 2. Configure a Technical User and Set Up SSO 
- Create **technical users** (**[P-User](https://help.sap.com/docs/EDGE_LIFECYCLE_MANAGEMENT/9d5719aae5aa4d479083253ba79c23f9/edcd1a455afb4cb0b6b1b3d148256468.html)** and **[S-User](https://www.sap.com/account/universal-id.html)**) to interact with the SAP systems and to access SAP repository based shipment channel.  
- Set up **Single Sign-On (SSO)** for secure repository access, including monitoring and logging.  


#### 3. Add an Edge Node and Bootstrap to Kubernetes
- Add an **Edge Node** in Edge Lifecycle Management (ELM) and bootstrap it to your **GKE cluster** running in your private GCP landscape.   



## Resources

You can find detailed, step-by-step instructions for both the basic and high availability (HA) setup, including SAP and GCP configuration and deployment steps, in the following GitHub repository:

[**Deploy SAP Integration Suite - Edge Integration Cell on Google Cloud Platform**](https://github.tools.sap/btp-use-case-factory/edge-integration-cell-gcp)

## Recommendation
The architecture and setup instructions in the GitHub repository above outline a small production deployment. Since deployments vary depending on business needs, these recommendations should be treated as a starting point.

## Explore More
- [Setting Up and Managing Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/setting-up-and-managing-edge-integration-cell)