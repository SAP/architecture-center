---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0019-1 
slug: /ref-arch/2e1c68431b/1
sidebar_position: 1
sidebar_custom_props:
    category_index:
        - opsec
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Authentication with SAP Cloud Identity Services
description: This reference architecture describes the authentication flows for SAP SaaS via the SAP Cloud Identity Services - Identity Authentication.
sidebar_label: Authentication and Single Sign On
keywords: [sap, identity, ias, security, cloud identity, business suite, cloud erp, single sign-on, SAP Cloud Identity Services, Identity Authentication]
image: img/logo.svg
tags: [security, genai]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - sapgunnar
    - gunnar-kosche_sap
last_update:
    date: 2025-05-13
    author: sapgunnar
############################################################
#                   End of Front Matter                    #
############################################################
---

The main actors in the model, aside from human interaction, are identity providers, service providers, and the SAP BTP-supported IAM services. As depicted in the figure, identity providers are systems that vouch for the identity of users requesting access to service provider systems by issuing a security token that eliminates repeated authentication. Service providers are systems providing business and technical services requisite for user tasks.

## Architecture

![drawio](drawio/public_SAP_AuthN_SD.drawio)

The SAP Cloud Identity Services can act as an identity provider, executing authentication or acting as a broker by forwarding requests to third-party providers. In the figure diagram, the SAP Cloud Identity Services redirects the incoming authentication request to a specifically configured Identity Provider, performing the broker's role. This operation is common for employee scenarios where a company utilizes one central IdP across numerous vendors. This scenario is also compatible with new applications that use the Identity Directory within the SAP Cloud Identity Services to manage identities and their assignments. SAP Cloud Identity Services can cross-verify against the Identity Directory on how the authentication flow should be federated towards a remote Identity Provider or which features should be merged into the authentication tokens relevant only for the SAP landscape.

In conclusion, the SAP Cloud Identity Services function either as a secure Identity Provider for your SAP landscape or as a facade linking SAP applications to your existing Identity Provider. In both setups, you benefit from pre-existing templates and integrations within the SAP environment, leading to a lesser integration effort into your non-SAP cybersecurity toolset.

## Flow

The following flows start in the application. Those are known as SAML Service Provider initiated and OIDC Resource Provider initiated flow. Those are the most common scenarios.

:::note Note
If SAML is used in the complete chain then  (3rd party) IdP initiated SAML flows  are supported,  but this would be just an option and not the default or recommendation.

[3521979 - Deprecation of SAML for User-Interactive Authentication in BTP Accounts](https://me.sap.com/notes/3521979/E)
:::

### A) SP / RP initiated flow (SAML / OIDC) for Web applications

The following flow can be applied to SAP Cloud applications and SAP On-Premises applications (incl. private cloud) which are integrated with the SAP Cloud Identity Services - Identity Authentication.

1. The authentication flow starts by an application / business user as shown in the upper left corner of the diagram. The **user** accesses the SAP application via an **Application Client (here a browser like Chrome)**.
2. The SAP Cloud or SAP On-Premises (incl. private cloud) application does not find an active session via a cookie in the browser.
3. The SAP application redirects the application client to the IAS.
4. The IAS asks the application client for a X.509 certificate or if no known certificate was presented it would try to get the user authenticated.
5. The IAS checks the application-configuration for the calling application if any Corp.IdP forwarding is in place.
    - no: The IAS presents a login screen
    - yes: e.g. in general for all SAP applications a redirect is enabled - IAS redirects the application client to the 3rd party Identity Provider

### B) Federation flow with 3rd party Identity Providers (IdP) for Web applications

6. The 3rd party Identity Provider authenticates the user.
7. The 3rd party IdP redirects the application client with the authenticated user details to IAS.
8. The IAS accepts the incoming token and processes it based on the app-configuration.

:::warning
 In the past the common scenario was [**IAS proxy**](https://help.sap.com/docs/identity-authentication/identity-authentication/corporate-identity-providers?locale=en-US) without the user present in IdDS. This reference architecture expects the user present in IdDS and the [***Federation setting "Use Identity Authentication user store" enabled***](https://help.sap.com/docs/identity-authentication/identity-authentication/corp-idp-configure-identity-federation?locale=en-US#context)
:::

:::warning
New SAP SaaS features ([SAP Task Center](https://pages.community.sap.com/topics/task-center), [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)) require user persistency in IdDS for cross application correlation, access/role/policy assignments and as only user store.
:::

### C) Application authentication for Web applications

9. The IAS creates a new token based on the application-configuration SAML or OIDC with attributes used from the 3rd party IdP and/or from the IdDS.
10. The IAS redirects the application client to the application.
11. The application accepts the token from IAS and creates a new user-session. The user is logged in.

### D) SAP GUI Single Sign-On

The Single Sign-On flow for SAP GUI applications re-uses the same authentication flow with Cloud Identity Services - Identity Authentication as the Web applications. The difference is that the SAP GUI uses a different protocol. The SAP GUI uses X.509 certificates for the authentication. The flow is as follows:

1. The users starts the SAP GUI and activates the SSO features with SAP Cloud Identity Services.
2. The user authenticates against the IAS.
3. The IAS creates a new OIDC token with attributes. As described above the attributes could come from the 3rd party IdP and/or from the IdDS. IAS hands the token over to the [SAP Secure Login Service for SAP GUI](https://help.sap.com/sls) (SLS).
4. The SLS creates a short term X.509 certificate for the authenticated user and stores it in the certificate store the SAP GUI uses.
5. The SAP GUI uses the X.509 certificate to authenticate against the SAP application.

## Characteristics

This setup has the following characteristics:

- One Authentication interface for all SAP applications via the SAP Cloud Identity Services - Identity Authentication
- Preconfigured trusts between the SAP Cloud Identity Services and the SAP Cloud applications
- Resource Provider initiated and Service Provider initiated SAML and OIDC flows are supported. An Identity Provider initiated SAML flow is technically supported but not the default or recommendation.
- The Central user store - SAP Cloud Identity Services - Identity Directory - is used to store the user identities and their assignments which allows the merge of attributes during the authentication flow into the tokens e.g. groups can be mapped from the IdDS to the application token.
- Technically the IAS terminates the authentication flow and creates a new token for the application.

## Services and Components

- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?service_plan=sap-cloud-to-sap-cloud&region=all&commercialModel=cloud)
- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)

## Resources

- [Note: 3521979 - Deprecation of SAML for User-Interactive Authentication in BTP Accounts](https://me.sap.com/notes/3521979/E)
  
- SAP Help Portal:
  - [SAP Cloud Identity Services - Authorization Management](https://help.sap.com/docs/identity-authentication/identity-authentication/configuring-authorization-policies?version=Cloud)
  - [SAP Cloud Identity Services](https://help.sap.com/docs/cloud-identity?version=Cloud&locale=en-US)
  - [SAP Secure Login Service for SAP GUI](https://help.sap.com/sls)

## Related Missions

- [Get Started with SAP BTP - Cloud Identity](https://discovery-center.cloud.sap/missiondetail/4325/4605/)
- [Configure identity lifecycle management in a hybrid SAP landscape](https://discovery-center.cloud.sap/missiondetail/3116/3152/)
- [Establish single sign-on to your cloud solutions](https://discovery-center.cloud.sap/missiondetail/3114/3151/)
