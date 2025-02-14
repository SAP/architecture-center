---
############################################################
#                Beginning of Front Matter                 #
############################################################
id: id-ra0008-1  # [DO NOT MODIFY]
slug: /ref-arch/f2670637a8/1 # [DO NOT MODIFY]
sidebar_position: 1 # [DO NOT MODIFY] 
sidebar_custom_props: # [DO NOT MODIFY]
  category_index: 
    - aws
    - gcp
    - azure
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Edge Integration Cell on AWS
description: Explore the reference architecture for deploying SAP Integration Suite - Edge Integration Cell on AWS. Learn about the required resources, and key considerations for setup and implementation on AWS.
sidebar_label: Edge Integration Cell on AWS
keywords: [eic,aws]
image: img/logo.svg
tags: [eic,aws]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
  - adarshnarayanhegde
last_update:
  date: 2025-02-13
  author: adarshnarayanhegde
############################################################
#                   End of Front Matter                    #
############################################################
---

SAP Integration Suite – Edge Integration Cell (EIC) can be deployed on Amazon Web Services (AWS) to leverage its scalable infrastructure while maintaining secure and controlled execution in a customer-managed environment. This architecture combines AWS-native services with EIC’s hybrid capabilities, ensuring a seamless integration experience.

## Architecture

![drawio](drawio/sap-edge-integration-cell-aws.drawio)

## Overview
EIC deployment on AWS follows a highly available and scalable model, utilizing **Amazon EKS (Elastic Kubernetes Service)** to run the EIC runtime across multiple availability zones. The setup includes:

- **VPC and Networking**: A dedicated **Virtual Private Cloud (VPC)** with a multi-AZ setup, incorporating private and public subnets, NAT Gateways, and an Internet Gateway for controlled network access in the private landscape.
- **EKS Cluster**: A managed Kubernetes environment where worker nodes run EIC runtime instances across private subnets.
- **Storage and Databases**:  
  - **Amazon RDS** for managing persistent database storage.   
  - **Amazon ElastiCache** for high-performance caching needs.  
  - **Amazon Elastic Block Store (EBS)** for node storage.
  - **Amazon Elastic File System (EFS)** for shared file storage. 

On the SAP BTP side, the **Edge Integration Cell** must be activated within the SAP Integration Suite. Once the EIC is configured and successfully deployed on the AWS EKS cluster, integration flows can be designed and seamlessly deployed to the new EIC runtime, combining the powerful integration capabilities of SAP Integration Suite with the customer managed resources on AWS.

## Resources

You can find the detailed setup instructions for both basic and high availability (HA) setup in the following GitHub repository:

[**Deploy SAP Integration Suite - Edge Integration Cell on Amazon Web Services**](https://github.com/SAP-samples/btp-edge-integration-cell-aws)

## Explore More
- [**Blog:** Getting Started with Edge Integration Cell on AWS: A Setup Guide Using SAP Integration Suite](https://community.sap.com/t5/technology-blogs-by-sap/getting-started-with-edge-integration-cell-on-aws-a-setup-guide-using-sap/ba-p/13880982)
- [Setting Up and Managing Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/setting-up-and-managing-edge-integration-cell)


