---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0016
slug: /ref-arch/ff41411bd6
sidebar_position: 16
sidebar_custom_props:
    category_index:
        - appdev
        - opsec
        - azure
        - aws
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Secure Service Consumption Across Hyperscalers
description: This architecture outlines a cloud-agnostic approach for securely consuming services offered by hyperscalers from applications running outside their environments.
sidebar_label: Secure Service Consumption Across Hyperscalers
keywords: [security,authentication,hyperscalers,aws,gcp,azure]
image: img/logo.svg
tags: [security,aws,gcp]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - alperdedeoglu
last_update:
    date: 2025-05-14
    author: alperdedeoglu
############################################################
#                   End of Front Matter                    #
############################################################
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To enable compliant and secure integration with hyperscaler services, SAP recommends using federated identity mechanisms instead of long-lived credentials. By leveraging standards such as OIDC and X.509 certificate-based authentication, SAP BTP workloads can access services on hyperscaler with traceable, short-lived credentials that align with enterprise security and audit requirements.

The following reference architectures illustrate how federated authentication can be implemented for corresponding hyperscaler.

## Architecture

<Tabs>
  <TabItem value="aws" label="Amazon Web Services">
           ![drawio](./1-secure-service-consumption-on-aws/drawio/oidc-sts.drawio)
  </TabItem>
  
  <TabItem value="gcp" label="Google Cloud Platform">
         ![drawio](./2-secure-service-consumption-on-gcp/drawio/gcp-oidc.drawio)
  </TabItem>
</Tabs>

## Flow

1. **Identity Federation**: SAP IAS or certificate authority is registered with the hyperscaler as a trusted source.
2. **Token or Certificate Exchange**: The workload presents a signed token or client certificate to the hyperscaler.
3. **Temporary Credential Issuance**: Based on the verified identity, short-lived credentials are issued to assume a scoped role or service account.
4. **Resource Access**: The workload uses these credentials to access cloud-native services securely, with full auditability and revocability.

## Characteristics


| Characteristic               | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| No long-lived secrets       | Uses short-lived tokens or signed certificates instead of static credentials. |
| Strong isolation            | Each workload is assigned a scoped identity and tightly controlled role.    |
| Seamless credential flow    | Eliminates manual secret rotation; credentials are derived dynamically.     |


