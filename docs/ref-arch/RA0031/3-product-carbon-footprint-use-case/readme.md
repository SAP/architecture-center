---
id: 168c97
slug: /ref-arch/168c97
sidebar_position: 3
title: DIV – Product Carbon Footprint Use Case
description: >-
  This reference architecture describes how SAP Decentralized Identity
  Verification (DIV) enables secure, privacy-preserving exchange of Product
  Carbon Footprint (PCF) data between supply chain partners using Self-Sovereign
  Identity and Verifiable Credentials, with each member provisioning their own
  DIV wallet (Bring Your Own Wallet).
keywords:
  - sap
  - decentralized identity
  - verifiable credentials
  - SSI
  - DID
  - product carbon footprint
  - PCF
  - Catena-X
  - supply chain
  - carbon data network
  - IATP
  - bring your own wallet
  - BYOW
sidebar_label: Product Carbon Footprint Use Case
image: img/ac-soc-med.png
tags:
  - appdev
  - integration
  - security
  - ref-arch
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - thomas-t7
discussion: 
last_update:
  author: thomas-t7
  date: 2026-06-15
---

Tracking the carbon footprint of a product across complex supply chains requires multiple companies to exchange emissions data — a process that demands both data integrity and verified identity. SAP Decentralized Identity Verification (DIV) enables this by providing a **Self-Sovereign Identity (SSI) infrastructure** where supply chain partners can prove their identity and their membership in a trust network using **Verifiable Credentials (VCs)**, without relying on a central authority.

This reference architecture illustrates how a **Gearbox Supplier** and a **Car Manufacturer** use the **Bring Your Own Wallet (BYOW)** provisioning model to each operate their own DIV instance on SAP BTP, and then exchange Product Carbon Footprint (PCF) data securely. In the BYOW model, each company self-provisions their DIV wallet independently — the **Operator** (e.g., Cofinity-X) retains its role as the trusted issuer of the membership credential, but the wallet infrastructure is owned and operated by each member.

## Architecture

![drawio](drawio/product-carbon-footprint-use-case.drawio "Product Carbon Footprint Use Case")

The architecture involves three parties, each owning their own wallet infrastructure:

- **Operator** — the dataspace operator (e.g., Cofinity-X) who verifies member identities and issues membership credentials to the members' own wallets.
- **Gearbox Supplier** — a tier-1 supplier who has provisioned their **own DIV wallet** on SAP BTP. The wallet holds the membership VC issued by the Operator and a company DID anchored on the DID network.
- **Car Manufacturer** — an OEM who has provisioned their **own DIV wallet** on SAP BTP. The wallet holds the membership VC issued by the Operator and a company DID anchored on the DID network.

DIV's Agent on each side communicates using the **IATP (Interoperability and Trust Protocol)** to exchange and verify membership credentials before PCF data is transferred via the **Eclipse Dataspace Connector (EDC)**.

## Implementing the Data Exchange with Data Space Integration

Identity verification and data-transfer governance are separate responsibilities. When using SAP Integration Suite's Data Space Integration capability for the exchange:

1. Check the service plan, enable the required capabilities, and complete connector onboarding for the selected data space.
2. Assign provider and consumer roles and configure backend connectivity and security material.
3. As a provider, define the asset and its access/usage policies, then bundle them into a contract definition.
4. As a consumer, discover an offered asset, review the applicable policies, and establish the agreement before transfer.
5. Monitor agreements and transfers, and test changes to credentials, policies, and connector configuration.

See [Data Space Integration setup](https://help.sap.com/docs/integration-suite/isuite-data-space-integration/what-s-new-in-data-space-integration), [provider design](https://help.sap.com/docs/integration-suite/isuite-data-space-integration/data-spaces), and [agreement monitoring](https://help.sap.com/docs/integration-suite/isuite-data-space-integration/monitoring-agreements). Validate the connector and identity requirements of the chosen data space; wallet verification alone does not grant access to every asset.

## Services and Components

- [Decentralized Identity Verification (Product Page)](https://www.sap.com/products/technology-platform/decentralized-identity-verification.html)
- [Decentralized Identity Verification (SAP Help Portal)](https://help.sap.com/docs/DECENTRALIZED_IDENTITY_VERIFICATION)
- [SAP Integration Suite – Data Space Integration](https://discovery-center.cloud.sap/serviceCatalog/data-space-integration)
- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services)
- [SAP Sustainability Data Exchange](https://www.sap.com/germany/products/business-network/sustainability-data-exchange.html)
- [SAP Sustainability Footprint Management](https://www.sap.com/products/scm/sustainability-footprint-management.html)

## Resources

- [Catena-X – Identity & Trust (IATP)](https://github.com/eclipse-tractusx/identity-trust)
- [Catena-X – IATP Verifiable Presentation Protocol](https://github.com/eclipse-tractusx/identity-trust/blob/main/specifications/M1/verifiable.presentation.protocol.md)
- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/)
- [Eclipse Dataspace Connector (EDC)](https://eclipse-edc.github.io/docs/)
- [Catena-X Network](https://catena-x.net/en/)

## Related Architectures

- [VC Issuance and Verification](../1-vc-issuance-and-verification/readme.md)
- [Bring Your Own Wallet](../2-bring-your-own-wallet/readme.md)
