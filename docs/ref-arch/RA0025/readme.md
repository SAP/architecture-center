---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0025
slug: /ref-arch/129d486477
sidebar_position: 25
sidebar_custom_props:
    category_index:
            - ai
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Test MS Copilot
description: Test MS Copilot usecase w/o anti patterns
sidebar_label: Test MS Copilot
keywords: [sap]
image: img/logo.svg
tags: [genai, azure, aws, gcp]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - contributor1
    - contributor2
last_update:
    date: 2025-08-01
    author: user-129d486477
############################################################
#                   End of Front Matter                    #
############################################################
---

## Architecture

This architecture showcases an integration between Microsoft Copilot and SAP Business Technology Platform (BTP), leveraging Joule AI, SAP AI Core, and Microsoft Azure AI capabilities to provide seamless AI assistance and enterprise-grade services across SAP and non-SAP landscapes.

![drawio](drawio/ref_arch_MSCopilot 2.drawio)

## Flow

1. A user interacts via mobile/desktop clients through Microsoft Teams.
2. Microsoft Copilot acts as the interface, fetching capabilities from Azure AI Foundry agents and SAP Joule.
3. Joule, SAP’s digital assistant, orchestrates responses using Joule Studio, Joule Skills, and integrates with SAP Build Code.
4. The Agent Catalog and ORD Aggregator register both internal and external agents.
5. Joule invokes SAP AI Core and SAP AI Launchpad for orchestration, prompt handling, and model access.
6. Enterprise data is accessed via the SAP Connectivity and Destination Services—securely linked to SAP On-Premise, Cloud, and 3rd party apps.
7. The identity flow is managed via Microsoft Entra ID and SAP Cloud Identity Service using SAML2/OIDC standards.
8. Azure OpenAI (GPT-4o, GPT-4.1, etc.) is accessed securely via HTTPS when necessary.

## Characteristics

- 🌐 **Multi-cloud interoperability**: Seamless collaboration between Microsoft Azure and SAP BTP.
- 🧠 **AI-powered productivity**: Combines Azure OpenAI (e.g., GPT-4o) with SAP AI Core and Joule.
- 🔒 **Enterprise-grade security**: Identity federation via Microsoft Entra ID & SAP Cloud Identity Service.
- 🔄 **Composable architecture**: Includes support for CAP, agents, and vector/knowledge graph engines.
- 🔗 **Unified experience**: Consistent UI and services across Microsoft Teams, SAP Build, and Joule Studio.

## Examples in an SAP context

- A supply chain analyst asks Copilot in Teams for a delivery status. Copilot invokes Joule, which fetches live data via BTP connectivity from SAP S/4HANA.
- A business user develops a new automation via SAP Build Code using business services and Joule-generated code prompts.
- An SAP Fiori application is enhanced with generative AI summarizations from GPT-4 hosted on Azure, invoked securely via SAP AI Core.

## Services and Components

### SAP BTP
- SAP Build Code (CAP)
- SAP AI Core & Launchpad
- SAP HANA Cloud (Vector Engine, Knowledge Graph Engine)
- SAP Cloud Identity Service
- SAP Connectivity & Destination Service
- Joule Studio, Skills, Agents

### Microsoft Azure
- Microsoft Teams
- Microsoft Copilot
- Azure AI Foundry
- Azure OpenAI (GPT-4o, GPT-4.1, GPT-4.1 nano)
- Microsoft Entra ID

## Resources

- [SAP Joule Overview](https://www.sap.com/products/artificial-intelligence/joule.html)
- [Microsoft Copilot Documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/)
- [SAP BTP Documentation](https://help.sap.com/btp)
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/overview)

## Related Missions

- [Getting Started with SAP Joule](https://developers.sap.com)
- [Integrate SAP with Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/)
- [Use SAP AI Core for Prompt Orchestration](https://help.sap.com/docs/ai-core/)
