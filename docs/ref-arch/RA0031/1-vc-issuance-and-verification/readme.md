---
id: id-ra0031-1
slug: /ref-arch/08N_yhbT/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: 'DIV – Verifiable Credential Issuance and Verification'
description: >-
  This reference architecture describes how SAP Decentralized Identity
  Verification (DIV) issues, signs, and verifies W3C Verifiable Credentials
  and Verifiable Presentations on SAP BTP.
keywords:
  - sap
  - decentralized identity
  - verifiable credentials
  - SSI
  - DID
  - credential issuance
  - credential verification
  - IATP
sidebar_label: 'VC Issuance and Verification'
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

The core capability of SAP Decentralized Identity Verification (DIV) is the **issuance and verification of W3C Verifiable Credentials (VCs)**. A credential issued by one company can be cryptographically verified by any other party without requiring a shared central authority — trust is anchored in the issuer's **Decentralized Identifier (DID)** that is publicly resolvable on a distributed ledger.

DIV supports two fundamental operations:

- **Issuance (Signing)** — an application creates a VC with business claims and requests DIV to sign it with the company's cryptographic key
- **Verification** — a received VC or Verifiable Presentation (VP) is verified by resolving the issuer's DID, checking the cryptographic proof, and validating the issuer against the configured trust list

Both operations are available as REST APIs and are also exercised automatically during the **IATP Presentation Flow** used in the Catena-X dataspace to enable secure machine-to-machine data exchange.

## Architecture

The high-level architecture of decentralized identity verification is best illustrated by the following example, “Sharing Data in a Dataspace.”

![drawio](drawio/decentralized-identity-verification-l1-as-of-2024.drawio "Decentralized Identity Verification L1 as of 2024")

Data Space Integration (DSI) and Decentralized Identity Verification (DIV) are enabling SAP customers to share data in a trusted, sovereign way in interoperable industrial data spaces.

Therefore basically 3 steps are required

- Onboard a new member to the dataspace. The operating company will issue the membership credential after a successful check of the applicant
- Then the supplier gearbox will configure its Data Space Integration so that data can be shared in the network
- And finally the car manufacture will agree to the data sharing conditions and retrieve data.

### 1. Issue Membership Credential & Create Data Offer

The operating company will check the application from the car manufacturer. After a successful check the operation company will issue a membership credential. The signed credential will be handed over from the operating company to the car manufacturer. The credential contains the business partner number and meta information like issuance date and the issuer. Later on this credential can be used in the data space for authentication.
Now the car manufacturer is onboarded and can use the membership credential to communicate in the data space.

The gear box supplier now configures an asset that then can be shared in the data space with a select number of trusted participants.
The access policy is basically an access list which contains the business partner numbers of members that are allowed to access a selected asset.
Here you also have the possibility to enhance the check for example to check also if the partner has signed the Data exchange governance framework agreement. As the last the policy has to bind to the asset.

### 2. Identification & Verification

The car manufacturer would like to sign a contract agreement and afterwards retrieve data from the supplier. Therefor the car manufacture must send a verifiable presentation (VP) which proofs its membership and its identity. A verifiable presentation can be seen as a signed envelope which contains all necessary credential (like the membership credential) for a certain interaction. This signed envelop is send to the gear box supplier for authentication and authorization checks.

The gearbox supplier gets the VP and verifies all the included data like the verifiable presentation and its containing verifiable credentials.
After all checks are passed the car manufacturer can sign the contract agreement. Additionally, there was an access token issued which can be used to retrieve the data.

## Services and Components

- [Decentralized Identity Verification (Product Page)](https://www.sap.com/products/technology-platform/decentralized-identity-verification.html)
- [Decentralized Identity Verification (SAP Help Portal)](https://help.sap.com/docs/DECENTRALIZED_IDENTITY_VERIFICATION)

## Resources

- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/)
- [IATP – Verifiable Presentation Protocol (Catena-X)](https://github.com/eclipse-tractusx/identity-trust/blob/main/specifications/M1/verifiable.presentation.protocol.md)
- [IATP – Credential Issuance Protocol (Catena-X)](https://github.com/eclipse-tractusx/identity-trust/blob/main/specifications/M1/credential.issuance.protocol.md)
- [did-jwt-vc – DIF JavaScript Library](https://github.com/decentralized-identity/did-jwt-vc)
- [DIF Universal Resolver](https://blog.identity.foundation/a-universal-resolver-for-self-sovereign-identifiers-2/)

## Related Architectures

- [Bring Your Own Wallet](../2-bring-your-own-wallet/readme.md)
- [Product Carbon Footprint Use Case](../3-product-carbon-footprint-use-case/readme.md)
