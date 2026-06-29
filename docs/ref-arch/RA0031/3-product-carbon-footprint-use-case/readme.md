---
id: id-ra0031-3
slug: /ref-arch/08N_yhbT/3
sidebar_position: 3
sidebar_custom_props:
  category_index: []
title: 'DIV – Product Carbon Footprint Use Case'
description: >-
  This reference architecture describes how SAP Decentralized Identity
  Verification (DIV) enables secure, privacy-preserving exchange of
  Product Carbon Footprint (PCF) data between supply chain partners
  using Self-Sovereign Identity and Verifiable Credentials, with each
  member provisioning their own DIV wallet (Bring Your Own Wallet).
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
sidebar_label: 'Product Carbon Footprint Use Case'
image: img/ac-soc-med.png
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - appdev
  - integration
  - security
  - ref-arch
contributors:
  - thomas-t7
last_update:
  date: 2026-06-15
  author: thomas-t7
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
