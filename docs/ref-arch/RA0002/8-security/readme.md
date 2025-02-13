---
id: id-ra0002-7
slug: /ref-arch/6c73e3575f/8
sidebar_position: 1
sidebar_custom_props:
  category_index:
title: Security
description: This document provides sample implementations using Azure Traffic Manager and AWS Route 53 for high availability and disaster recovery (HA/DR) of SAP services. It includes stateless and stateful setups for SAP Cloud Integration, SAP Work Zone, and SAP HANA Cloud with multi-region DR solutions.
keywords:
  - sap
  - integration
  - application development
  - ha dr
  - high availability
  - disaster recovery
  - resiliency
  - business continuity
  - failover
sidebar_label: Security
image: img/logo.svg
tags:
  - aws
  - azure
  - appdev
  - integration
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - martinfrick
  - maxstreifeneder
  - kshanth
  - mahesh0431
  - anirban-sap
  - jmsrpp
  - uklasing
  - alperdedeoglu
  - arajsinha
last_update:
  author: arajsinha
  date: 2025-02-06
---

<!-- **Security Considerations for High Availability and Disaster Recovery (HADR)** -->

When setting up authentication in a multi-region SAP environment, it is crucial to consider the impact of failover scenarios. Authentication is typically handled through XSUAA (SAP Authorization and Trust Management Service), which is tied to a specific subaccount service. This creates challenges when switching between subaccounts using DNS routing through load balancers. 

For example, when an OAuth token is created in one subaccount, it is only valid for that specific subaccount service. Since all the data within the token pertains exclusively to the subaccount in which it was created, it cannot be used in any other subaccount. This limitation also applies when using client credentials and certificates, leading to authentication issues when switching between subaccounts.


#### **SAP Integration Suite**
Most multi-region setups in SAP Integration Suite encounter authentication challenges when switching subaccounts. There are two possible ways to handle authentication in Cloud Integration Flows (iFlows) to enable seamless subaccount switchovers. 

**IAS Basic Authentication**
One option is to use IAS, where a customer can create a user with limited authorization in IAS or a custom IDP, where both the subaccounts are linked to the mentioned IAS/IDP. The user can only be given access to relevant iFlow roles, based on the customers choice, and authenticated to access the relevant iFlow roles in both subaccounts. 


**External Certificates**
While creating the Service Key to access relevant iFlows, the External Certificate type should be selected, which will enable the customers to use their own certificate within the Primary and Secondary subaccount, and as long as the same certificate is used in both the subaccounts, the failover will happen seamlessly and the customer will be able to log in to both the subaccounts without issues.


#### **Build Work Zone Standard Edition**
In the case of Build Work Zone Standard Edition, standard users may face authentication issues when switching between primary and failover regions. As long as the customer makes sure to maintain their username and password in IAS or a custom IDP, and both the subaccounts are linked to that, they will be able to login to any of the subaccounts based on when the region is going through a failover. However, one minor drawback is that during a failover, the authentication cookies may still be linked to the primary subaccount, requiring the customer to enter their password again when accessing the secondary subaccount. Given that such failover scenarios are rare, this inconvenience is minimal and does not significantly impact overall usability. Also, to fix this, SSO (Single Sign On) can be used, so that it automatically takes the customers ID, and logs them into the subaccount.

By implementing these approaches, authentication disruptions can be minimized, ensuring a smooth transition between primary and secondary SAP subaccounts during failover scenarios.
