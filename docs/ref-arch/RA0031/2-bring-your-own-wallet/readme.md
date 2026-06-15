---
id: id-ra0031-2
slug: /ref-arch/08N_yhbT/2
sidebar_position: 2
sidebar_custom_props:
  category_index: []
title: 'DIV – Bring Your Own Wallet'
description: >-
  Bring Your Own Wallet (BYOW) describes the provisioning model in which a
  dataspace member self-provisions SAP DIV on SAP BTP instead of receiving a
  wallet from the Operating Company. The operator still issues the membership
  credential, which is pushed to the member-hosted DIV wallet.
keywords:
  - sap
  - decentralized identity
  - verifiable credentials
  - SSI
  - DID
  - wallet
  - bring your own wallet
  - Catena-X
  - dataspace
  - membership credential
  - self-hosted wallet
sidebar_label: 'Bring Your Own Wallet'
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

**Bring Your Own Wallet (BYOW)** is a provisioning model for SAP Decentralized Identity Verification (DIV) in the context of dataspaces such as Catena-X. It describes how a dataspace member self-provisions their own DIV instance on SAP BTP, rather than receiving a managed wallet from the Operating Company.

## Background

Until the beginning of 2024, only the **Operating Company** (e.g., Cofinity-X in the Catena-X network) could provision and operate a DIV wallet on behalf of dataspace members. Members had no direct access to DIV as an SAP BTP service — they relied entirely on the operator for identity and credential management.

With the introduction of BYOW in 2026, dataspace members can now provision DIV directly from their **SAP Integration Suite** subscription via the **Data Space Integration (DSI)** capability. This fundamentally changes the ownership model: the member controls their own wallet infrastructure on SAP BTP, while the operator retains its role as the **trusted issuer** for the membership credential.

## Architecture

![Decentralized Identity Verification L1 BYOW](drawio/decentralized-identity-verification-l1-byow.drawio)

<!-- ![Decentralized Identity Verification L1 BYOW](images/decentralized-identity-verification-l1-byow.drawio.svg) -->

In the BYOW model, the **Operating Company's DIV wallet** acts as the issuer of the membership credential. After verifying the member's identity, the operator issues a signed membership credential and pushes it directly to the **member's own DIV wallet** hosted on their SAP BTP account.

From that point on, the member uses their own DIV wallet autonomously to participate in the dataspace — authenticating with partners, presenting credentials, and exchanging data via the Data Space Integration and the IATP protocol.

## Key Advantages

### Member Controls Their Own Wallet

The DIV wallet runs in the member's own SAP BTP account. The member manages their company identity, DID, subscriptions, and credential lifecycle independently — without depending on the operator for day-to-day operations.

### Reduced Dependency on the Operating Company

In the traditional model, the operator was the bottleneck for all wallet operations. With BYOW, the operator's role is limited to **issuing the initial membership credential**. All subsequent credential operations — issuance, verification, data exchange — are handled autonomously by the member's own wallet.

### Direct Integration with SAP Integration Suite

BYOW wallets can be provisioned as part of the **Data Space Integration (DSI)** capability within SAP Integration Suite. This enables automated wallet setup, bootstrapping of company identity and DID, and direct integration with SAP's data space connector infrastructure — without manual configuration steps.

### Preserved Trust Model

Although the wallet is self-hosted, the **trust model of the dataspace is fully preserved**. The membership credential is still issued by the trusted Operating Company and cryptographically verifiable by all dataspace partners. Partners can validate the credential by resolving the operator's DID from the network — no central runtime dependency on the operator is required.

### Scalability for Large Dataspaces

BYOW removes the scaling bottleneck from the Operating Company. As more organizations join a dataspace, each member provisions and operates their own wallet — the operator infrastructure is not a single point of failure or congestion.

## Services and Components

- [Decentralized Identity Verification (Product Page)](https://www.sap.com/products/technology-platform/decentralized-identity-verification.html)
- [Decentralized Identity Verification (SAP Help Portal)](https://help.sap.com/docs/DECENTRALIZED_IDENTITY_VERIFICATION)
- [SAP Integration Suite – Data Space Integration](https://discovery-center.cloud.sap/serviceCatalog/data-space-integration)

## Resources

- [Catena-X – Identity & Trust (IATP)](https://github.com/eclipse-tractusx/identity-trust)
- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/)
- [Eclipse Dataspace Connector (EDC)](https://eclipse-edc.github.io/docs/)

## Related Architectures

- [VC Issuance and Verification](../1-vc-issuance-and-verification/readme.md)
- [Product Carbon Footprint Use Case](../3-product-carbon-footprint-use-case/readme.md)
