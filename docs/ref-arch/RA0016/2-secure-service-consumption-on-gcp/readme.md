---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0016-2 
slug: /ref-arch/ff41411bd6/2
sidebar_position: 2
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Secure Service Consumption on GCP
description: Configure secure, keyless access to GCP resources using OIDC-based Workload Identity Federation. Workloads  authenticate without storing service account keys.
sidebar_label: Secure Service Consumption on GCP
keywords: [gcp, oidc, federation, ias, sap, btp, security]
image: img/logo.svg
tags: [gcp,security]
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

This architecture provides guidance for enabling secure and scalable access from external workloads—such as SAP BTP, to Google Cloud Platform (GCP) services using Workload Identity Federation with OpenID Connect (OIDC).

Traditional approaches rely on long-lived service account keys, which introduce operational overhead and security risks. Instead, this setup allows external identities to authenticate to GCP without storing or rotating keys, using short-lived tokens issued by a SAP IAS.

This model significantly reduces credential management complexity, supports least-privilege access, and aligns with zero trust principles.

## Architecture

![drawio](drawio/gcp-oidc.drawio)


## Prerequisites

**SAP Identity Authentication Service (IAS)** must be configured as an OIDC provider in Google Cloud Workload Identity Federation, as described in [this guide](https://cloud.google.com/iam/docs/workload-identity-federation-with-other-providers).  


## Flow

Once prerequisites are in place, the runtime authentication flow proceeds in four main steps:

1. **Obtain OIDC Token from SAP IAS**  
   The workload authenticates against SAP IAS using a valid mechanism (e.g., certificate or client credentials). IAS issues an OIDC-compliant JWT with the necessary identity claims.

2. **Exchange OIDC Token via Google STS**  
   The workload sends the IAS-issued token to Google Cloud's **Security Token Service (STS)**, along with the identity pool and provider information.

3. **Impersonate a GCP Service Account**  
   If the identity is authorized, STS returns **federated credentials** that allow the workload to impersonate the mapped GCP service account.

4. **Access Google Cloud Resources**  
   The workload uses the short-lived federated credentials to access Google Cloud services, within the scope of IAM roles and session policies assigned to the service account.


## Characteristics

    | Characteristic                            | Description                                                                 |
    |------------------------------------------|-----------------------------------------------------------------------------|
    | **Authentication Type**                  | OpenID Connect JWT Token                                            |
    | **Credential Handling**                  | No certificate management required                                          |
    | **Best Fit For**                         | User-centric applications, UIs, or apps already using SAP IAS               |
    | **Federation Support**                   | Can federate with corporate IdPs via IAS                                    |
    | **Token Lifetime / Credential Rotation** | Token-based (short-lived, configurable)                                     |
    | **Complexity**                           | Very low implementation complexity                                          |
    | **Security Posture**                     | Token validation + audience matching                                        |
    | **SAP BTP Compatibility**                | Ideal for workloads having a SAP IAS application                          |


## Services and Components


| Component              | Platform | Description                                                                 |
|------------------------|----------|-----------------------------------------------------------------------------|
| **SAP IAS**            | SAP      | Acts as the trusted **OIDC identity provider**, issuing identity tokens    |
| **Cloud IAM**          | GCP      | Manages access control via roles and bindings to service accounts          |
| **Security Token Service (STS)** | GCP | Receives and verifies OIDC tokens, returns temporary credentials      |
| **Service Account**    | GCP      | The target identity in GCP that is impersonated via federation             |

## Resources

- [What is Workload Identity Federation? - GCP](https://youtu.be/4vajaXzHN08?si=uiacY2kRkTA0ZKOa)
 A short overview video from Google Cloud Tech to understand how
 Workload Identity Federation in GCP works. 

- [SAP Identity Authentication Service (IAS) Overview](https://help.sap.com/viewer/product/SAP_IDENTITY_AUTHENTICATION_SERVICE/)  
   A foundational resource to understand how SAP IAS and OIDC authentication works.

- [GCP Workload Identity Federation Documentation](https://cloud.google.com/iam/docs/workload-identity-federation)  
   A comprehensive guide on how to configure workload identity federation in GCP.

- [Google Cloud IAM Overview](https://cloud.google.com/iam/docs/overview)  
   General information about Google Cloud IAM, including federation, identity management, and access control.

- [OIDC (OpenID Connect) Specification](https://openid.net/connect/)  
  A good resource to learn the core concepts of OIDC and how it works.

