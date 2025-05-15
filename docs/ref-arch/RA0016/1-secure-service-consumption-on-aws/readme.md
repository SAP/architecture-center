---
id: id-ra0016-1
slug: /ref-arch/7e558be8f1/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Secure Service Consumption on AWS
description: >-
  This architecture demonstrates how to securely access AWS services from
  applications running outside of AWS.
keywords:
  - aws
  - security
  - iam
  - iam-roles-anywhere
  - oidc
sidebar_label: Secure Service Consumption on AWS
image: img/logo.svg
tags:
  - security
  - aws
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - alperdedeoglu
discussion: 
last_update:
  author: alperdedeoglu
  date: 2025-05-14
---

---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



This section outlines the architecture for securely accessing AWS services from external environments, such as applications running on SAP Business Technology Platform (SAP BTP).

The first approach utilizes OIDC Federation via SAP Identity Authentication Service (IAS). In this model, applications retrieve identity tokens from IAS and use them to assume IAM roles via AWS Security Token Service (STS). This token-based method avoids the need for managing certificates or static credentials, making it ideal for applications already integrated with IAS.

Alternatively, AWS IAM Roles Anywhere allows certificate-based access to AWS services. Trusted workloads can assume IAM roles using X.509 certificates from a trusted certificate authority, eliminating the need for hardcoded credentials or persistent access keys, and ensuring short-lived, auditable access.

Both identity federation and certificate-based access ensure secure, scalable service consumption, serving as a reference pattern for implementing zero-trust principles in hybrid environments.

## Architecture

<Tabs
  defaultValue="OIDC"
  values={[
    {label: 'OIDC Federation via SAP IAS', value: 'OIDC'},
    {label: 'AWS IAM Roles Anywhere', value: 'RA'}
  ]}>
<TabItem value="OIDC">

![drawio](drawio/oidc-sts.drawio)

## Flow
This alternative pattern demonstrates how to access AWS services by treating the application created within SAP IAS as an OIDC Identity Provider (IdP) for AWS.

### Prerequisites:

1. **Register SAP IAS as an OIDC Provider in AWS**  
Add your IAS application metadata to AWS IAM as a new Identity Provider using [OIDC IdP setup](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html).
2. **Create IAM Role with Trust Policy**  

### Runtime Flow: 

1. Application obtains ID token from SAP IAS.
2. Application uses this token to assume an IAM Role using STS.
3. AWS issues temporary credentials scoped by the role's permissions.
4. Application accesses AWS services with these credentials.

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
    This integration leverages SAP Identity Authentication Service (IAS) as an OpenID Connect (OIDC) Identity Provider (IdP) to securely obtain temporary AWS credentials through AWS Security Token Service (STS). Below are the core components involved in this architecture:

    | Component | Role |
    |-----------|------|
    | **SAP IAS** | Acts as the trusted OIDC Identity Provider that issues signed ID tokens on behalf of the application. |
    | **AWS IAM** | A representation of IAS within AWS, registered using its metadata to allow token-based identity federation. |
    | **AWS IAM Role** | A role that trusts the IAS OIDC provider and defines permissions for the application to access AWS services. |
    | **AWS STS** | Exchanges the IAS-issued token for temporary AWS credentials. |

   :::tip Tip
   This flow simplifies access control and identity federation, making it particularly suitable for SAP BTP applications — even those using XSUAA — where leveraging an existing IAS trust allows secure AWS access without managing certificates.
   :::
  ## Resources
  - [Create an OpenID Connect (OIDC) identity provider in AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
  - [Create a role for OpenID Connect federation in AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html)
  - [SAP IAS - Create OpenID Connect Application for Client Credentials Flow](https://help.sap.com/docs/cloud-identity-services/cloud-identity-services/client-cred-create-openid-connect-application-for-client-credentials-flow)
  - [OIDC Federation on AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html)
  - [How OIDC works](https://openid.net/developers/how-connect-works/)

   </TabItem>

  <TabItem value="RA">
   ![drawio](drawio/iam-roles-anywhere.drawio)
  ## Flow

  ### Prerequisites:
    1. Create x509 credentials via using an approved Certificate Authority for your organization
    2. [Upload x509 credentials](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/use-destination-certificates) to SAP BTP Destination Service
    3. [Establish Trust and Create Roles on AWS IAM Roles Anywhere](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/getting-started.html#getting-started-step1)
  
  ### Runtime Flow
  **1. Retrieve Certificate Pair**
  Workloads fetches the X.509 certificate and private key from SAP BTP Destination Service.

    **2. Create a Signed Request**  
    The workload [creates a signed request](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/authentication-sign-process.html) using the private key and certificate to call AWS IAM Roles anywhere.


    :::info Information
    A [reference implementation with Go Programming Language](https://github.com/aws/rolesanywhere-credential-helper) is provided by AWS. 
    :::

    **3. Request Temporary Credentials**  
    The signed request is sent to IAM Roles Anywhere, referencing the Profile ARN.

    AWS validates the certificate (via the trust anchor), and the role association (via the profile).
    If validation passes, temporary AWS credentials are issued.
    These are scoped by the IAM role’s permissions and are short-lived.

    **4. Access AWS Services** 
    The workload uses the temporary credentials to access AWS services and rotates them regularly.

   ## Characteristics 
   
      | Characteristic                            | Description                                                                 |
      |------------------------------------------|-----------------------------------------------------------------------------|
      | **Authentication Type**                  | X.509 Certificates                                                          |
      | **Credential Handling**                  | Requires certificate management and signing                                |
      | **Best Fit For**                         | Headless workloads, backend services, automation                           |
      | **Federation Support**                   | Relies on certificate trust chain                                          |
      | **Token Lifetime / Credential Rotation** | Temporary credentials issued per session                                    |
      | **Complexity**                           | Higher operational complexity (can be automated)                            |
      | **Security Posture**                     | Certificate trust + AWS session credentials + Signature                     |
        
## Best Practices


- **Use a dedicated AWS Role per application or workload**  
  Keep the blast radius limited and simplify permission management by isolating access scopes.

- **Apply least privilege principle via IAM policies**  
  Only allow the exact actions and resources each role needs.

- **Automate certificate rotation**  
  Use tools or services to manage and rotate certificates without manual intervention.


- **Use short-lived session durations**  
  Set minimal `DurationSeconds` for the assumed roles to reduce token lifetime and risk surface.


- **Tag resources and sessions consistently**  
  Use tags for traceability and cost allocation, especially in multi-tenant or multi-app environments.

## Resources

[What is IAM Roles Anywhere?](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html)
[SAP BTP Destination Service Official Documentation](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/destination-service)
  </TabItem>
</Tabs>