---
id: id-ai-standards-at-sap-1
slug: /ai-standards-at-sap
sidebar_position: 1
title: AI Standards at SAP
description: >-
    SAP's central reference for AI standardization, covering its AI-First strategy, open standards adoption (MCP, A2A, OpenTelemetry), and active contributions to the Agentic AI Foundation (AAIF), A2A Project, and IETF.
keywords:
    - AI standards at SAP
    - architecture
    - AI
    - artificial intelligence
    - governance
    - security
    - compliance
    - north star architecture
    - nsa
    - golden path
sidebar_label: AI Standards at SAP
image: img/ac-soc-med.png
tags:
    - ai-standards-at-sap
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
last_update:
  author: SAP
  date: '2026-05-18'
---

## Executive Overview

Since 2025, SAP has embraced an **[AI-First, Suite-First strategy](https://one.int.sap/company/our_strategy#/main)** with the goal of becoming the **#1 Enterprise Application and Business AI company**, powered by its leading platform. This strategic direction — guiding focus and actions across Product, Go-to-Market, and Corporate Functions — is supported by the **Business AI @ SAP** program and a company-wide effort to upskill employees in this rapidly evolving field.

As SAP accelerates the integration of agentic AI across our enterprise software portfolio, the need for coordinated, standardized development practices is critical. Aligning to unified global standards enables AI agents within SAP — and those of our customers — to communicate, share context, and execute transactions securely.

This page serves as the central reference for SAP employees contributing to or impacted by standardization initiatives such as the **Agentic AI Foundation (AAIF)**. It offers a collaborative space for bundling our efforts, ensuring transparency, and providing clear paths for engagement with the working groups driving these efforts.

---

## Why Standards Matter at SAP

SAP’s [Rules for SAP Apps and Services](https://sap.sharepoint.com/sites/213035/SitePages/Rules-for-SAP-Apps-and-Services.aspx) mandate that any SAP capability must be based on mainstream open source software and open standards where they exist — with contributing back as an obligation. Open standards make agents safer, easier to build, and more portable across tools and platforms. They prevent the ecosystem from fragmenting and ensure SAP’s "Agent-First" strategy remains scalable.

Per SAP’s [Core Principles for AI](https://sap.sharepoint.com/sites/213035/SitePages/Core-Principles-for-AI.aspx), teams must leverage SAP’s AI infrastructure through **AI Core**, **BTP Fabric**, and platform services to ensure consistency. Adopting open standards — **A2A**, **MCP**, and **OpenTelemetry (OTEL)** — over proprietary alternatives enables ecosystem integration and avoids vendor lock-in.

SAP’s [Strategic Response to Emerging AI Agent Interoperability Protocols](https://sap.sharepoint.com/:b:/r/teams/SAPBusinessAI/Shared%20Documents/General/03%20Strategy%20%26%20Goals/Strategy/01%20-%20Projects/MCP%20Model%20Context%20Protocol/20251125_Strategic%20Recommendations%20MCP%20%26%20A2A_BAI%20Strategy_v2.pdf?csf=1&web=1&e=LxoHSa) makes this commitment explicit: by establishing clear product, commercial, and legal frameworks for data and transactional access through MCP and A2A, SAP signals its willingness to integrate with a diverse range of AI solutions and third-party agents — encouraging innovation among partners and developers while enhancing the overall value of SAP’s offering.

---

## SAP Contributions

### 1. [Agentic AI Foundation (AAIF)](#agentic-ai-foundation)

Founded in December 2025 under the neutral governance of the **Linux Foundation**, the [Agentic AI Foundation](https://aaif.io/) manages core projects including the **Model Context Protocol (MCP)**, **goose**, and **AGENTS.md**.

The AAIF [Technical Steering Committee](https://github.com/aaif/technical-committee) brings together representatives from **Anthropic**, **Microsoft**, **Google**, **Amazon Web Services**, **OpenAI**, **Block**, **Bloomberg**, and **Cloudflare**, reflecting the broad industry alignment behind this foundation.

SAP is a **Founding Gold Member** and is actively involved in multiple Working Groups (WGs).

### 2. [The A2A Project](#the-a2a-project)

 This open standard is designed to enable seamless horizontal communication and collaboration between AI agents across different vendor ecosystems. Next to **SAP**, the TSC includes representatives from **Google**, **Microsoft**, **Cisco**, **Amazon Web Services**, **Salesforce**, **ServiceNow**, and **IBM Research**.

 SAP is part of the [Technical Steering Committee](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md) of the [Agent2Agent (A2A) Project](https://a2a-protocol.org/latest/).

### 3. [IETF (Internet Engineering Task Force)](#ietf)

Founded in 1986, the [IETF](https://www.ietf.org/) is the premier standards development organization for the Internet — producing voluntary standards that are widely adopted by users, network operators, and equipment vendors, shaping the trajectory of the Internet’s development.

---

## Stakeholders

* **SAP OCTO Architects:** Cross-product architectural alignment.
* **SAP OSPO:** Open Source strategy and AAIF membership management.
* **SAP AI Development Teams:** Implementing standards in core products.
* **SAP Legal & Compliance:** Regulatory verification (EU AI Act).
* **SAP Security Research:** Hardening protocols against agentic threats.


---

## Agentic AI Foundation

### Working Groups

| Working Group | Description &nbsp;&nbsp;&nbsp; | SAP Lead / Contact | Mailing List | Discord | GitHub |
| :--- | :---- | :--- | :--- | :--- | :--- |
| **Accuracy & Reliability** | Address the probabilistic gap in enterprise operations and measure agent output quality across dimensions such as functional correctness, task completion, and contextual correctness. | *TBD* | [wg-accuracy-reliability@lists.aaif.io](mailto:wg-accuracy-reliability@lists.aaif.io) | [#wg](https://discord.gg/XPXPSazX4M) | [repo](https://github.com/aaif/wg-accuracy-and-reliability) |
| **Agentic Commerce** |Establish taxonomy and best practices to enable secure, interoperable autonomous commerce interactions across fragmented merchant, wallet, payment, and identity ecosystems. | [**Siegfried Kiermayer**](mailto:siegfried.kiermayer@sap.com) | [wg-agentic-commerce@lists.aaif.io](mailto:wg-agentic-commerce@lists.aaif.io) | [#wg](https://discord.gg/ZVvcb3BAM2) | [repo](https://github.com/aaif/wg-agentic-commerce) |
| **Governance, Risk & Regulatory** |Assess policy frameworks and licensing concerning agentic AI systems to mitigate agentic AI policy-related risk. | *TBD* | [wg-governance-risk-regulatory@lists.aaif.io](mailto:wg-governance-risk-regulatory@lists.aaif.io) | [#wg](https://discord.gg/wc6nB5uYmm) | [repo](https://github.com/aaif/wg-governance-risk-and-regulatory) |
| **Identity & Trust** |Develop vendor-neutral standards enabling AI agents to prove their identity, authorization, and actions across platforms while maintaining security and auditability. | [**Alper Dedeoglu**](mailto:a.dedeoglu@sap.com) (Co-Chair) | [wg-identity-trust@lists.aaif.io](mailto:wg-identity-trust@lists.aaif.io) | [#wg](https://discord.gg/Cb6MkrsYsB) | [repo](https://github.com/aaif/wg-identity-and-trust) |
| **Observability & Traceability** | Establish comprehensive standards and tools to make agentic systems measurable, debuggable, and trustworthy through unified observability practices. | *TBD* | [wg-observability-traceability@lists.aaif.io](mailto:wg-observability-traceability@lists.aaif.io) | [#wg](https://discord.gg/6RX4KkpKqZ) | [repo](https://github.com/aaif/wg-observability-and-traceability) |
| **Security & Privacy** | Establish security and privacy as a shared discipline across the agentic AI ecosystem through open threat models, a shared taxonomy, and reusable design patterns. | [**Philipp Tiesel**](mailto:philipp.tiesel@sap.com) (Observer) | [wg-security-privacy@lists.aaif.io](mailto:wg-security-privacy@lists.aaif.io) | [#wg](https://discord.gg/Wbck3N2CsC) | [repo](https://github.com/aaif/wg-security-and-privacy) |
| **Workflows & Process Integration** | Define a shared workflow model, common terminology, and interoperability guidelines for agentic AI systems, enabling agent workflows to operate reliably across frameworks, tools, and execution environments. | [**Modood Alvi**](mailto:modood.alvi@sap.com), [**Fabrizio Primerano**](mailto:fabrizio.primerano@sap.com) | [wg-workflows-process-integration@lists.aaif.io](mailto:wg-workflows-process-integration@lists.aaif.io) | [#wg](https://discord.gg/BAzqNsGcti) | [repo](https://github.com/aaif/wg-workflows-and-process-integration) |

### Goal / Charter of Working Groups
**Accuracy & Reliability WG**:

>> Establish unified industry standards for agentic AI systems. Short-term priorities include creating a shared taxonomy and foundational positioning paper. Mid-term deliverables focus on reliability-by-design blueprints and evaluation protocols. Long-term objectives include a standardized Reliability Conformance Mark, automated benchmarking infrastructure, and universal SLA interoperability enabling cross-vendor agent orchestration.

**Agentic Commerce WG**:

>> Establish a common vocabulary, taxonomy, and shared understanding for agentic commerce workflows and interactions. The working group aims to address fragmented interfaces across merchants, wallets, payment providers, and identity systems to improve interoperability. It will identify ecosystem gaps and standardization challenges through a dedicated gap analysis document. Another focus is defining best practices for secure, trustworthy, and governable agentic commerce systems with human oversight and delegated authority. Additionally, the group plans to develop an end-to-end reference architecture covering discovery, checkout, payments, and post-purchase interactions.

**Governance, Risk & Regulatory WG**: 

>> Assess policy frameworks and licensing concerning agentic AI systems and later provide recommendations for how organizations can better mitigate agentic AI policy-related risk. Aspects to be considered include AI Agent Bill of Materials standard(s), covering foundation models, scaffolding, tools, APIs, and third-party components with provenance and versioning and more.

**Identity and Trust WG**:

>> Address agent identity, authentication, provenance, delegation chains, authorization models, and cross-organizational trust evaluation. It examines how agents are identified and authenticated, how they represent delegated authority, convey permissions and policy constraints, and establish trust across organizational boundaries. Develop taxonomies, surveys existing standards, identifies gaps, documents use cases, and creates reference architectures for both enterprise and consumer context

**Observability & Traceability WG**: 

>> Publish a Landscape Gap Analysis report documenting the current state of agentic observability, gaps in OTel/CloudEvents/vendor tools, and the WG's positioning.
Produce at least one specification or guidance document addressing the top-priority gap, with community review and at least one reference implementation.
Establish active coordination with the OTel GenAI SIG and OWASP AOS, with at least one joint deliverable or formal liaison.
Build a healthy contributor community with regular participation from multiple AAIF member organizations.
Data Model / Reference SDKs / Standard Specifications

**Security & Privacy WG**:

>> Establish foundational security and privacy frameworks for agentic AI through threat modeling, design patterns, and shared terminology that the ecosystem can adopt broadly. Deliver living documents addressing threat landscapes, agent control, data protection, and cross-WG security integration—ensuring security strengthens all AAIF initiatives while deferring ethics and compliance interpretation to appropriate bodies.

**Workflows & Process Integration WG**:

>> Establish a shared workflow model and common terminology for agentic AI systems, producing and extending open specifications and projects, interoperability guidelines, and design patterns that allow agent workflows to operate across frameworks, tools, and execution environments.
The WG focuses on agent workflow models and semantics, long-running and stateful agent execution, tool invocation and external system coordination, human-in-the-loop workflow patterns, workflow portability and interoperability, and operational patterns for production agent workflows.
Near-term deliverables include a workflow taxonomy, critical use cases documentation, and a workflow reference architecture.

### How to Get Involved

SAP employees are encouraged to contribute to the Agentic AI Foundation. As a Gold Member, our engineers have priority access to development cycles.
Please read the SAP internal and confidential ["Risk Mitigation Guidelines for SAP Employees Participating in Agentic AI Foundation (AAIF) Activities"](https://sap.sharepoint.com/:b:/s/102421/IQD1F8UWJ4cMS5GjVSb7sgNiATZazwn_TgU3pN7_73jzzsk) before you get engaged and read the restrictions proposed by SAP Legal below.

1. **Register for WGs:** [Sign-up Form](https://docs.google.com/forms/d/e/1FAIpQLSeQ-W_fc0Ft-aMIzm_w2ze6UZuPpCU41V0lrrESwV6Dlxjb1Q/viewform). **Note:** You must use your `@sap.com` email address.
2. **LFX Identity:** Ensure you have an [LFX ID](https://openprofile.dev/) to contribute to Linux Foundation projects.
3. **Communication:** Join the private working group channels in the [AAIF Discord](https://discord.com/invite/6RX4KkpKqZ) and the internal SAP Slack channel `#ai-standards`.
4. **Documentation:** Access GitHub permissions and internal meeting notes via the [SAP Standards SharePoint](https://sap.sharepoint.com/:b:/s/102421/IQCALis-Svy6SqmKkkYdbeapAVL9ir1g2UkS1p-iU3NzVHU).

**Proposed Restrictions**  
When participating in the AAIF Working Groups (WG), please 
1. Do not share or submit, in writing or verbally, any content, concept, or technical solution you 
do not want SAP competitors to modify and/or use for commercial purposes. 
2. Do not submit content to the AAIF articles, reports, white papers, deliverables, and 
presentations at conferences, and any other feedback or contribution, verbal or written, if it 
includes:

 >> i. Any SAP confidential information, SAP proprietary information, or personal data 
 
 >> ii. Any SAP customers’ confidential information
 
 >> iii. Any technical details of SAP proprietary solutions or any SAP proprietary software code 
including those available on publicly available websites. 

 >> iv. Any content (including text or images) copied from SAP and non-SAP websites, even if 
the website is publicly available.  Please include a website URL instead of copying 
content. 

 v. Any technical details, including for example, data models, data types, semantic rules, 
IDOCs, APIs, SAP business process models or methodology, and SAP semantic 
methodologies unless you receive an internal approval. 

4. Before sharing any SAP APIs with AAIF and its Working Groups, please review and comply 
with the SAP API Policy. For more information about SAP API Policy, please see SAP API 
Frequently Asked Questions.

### Learn More

Stay tuned with webinars, blog posts, conferences, etc. 

**Upcoming events**

May 28th, 2026 - internal webinar hosted by Klaus Haeuptle, Engineering Ecosystem with Alper Dedeoglu, Co-Chair of the Identity and Trust WG at AAIF and Development Architect in the Office of the CTO (OCTO), and Sebastian Wolf, Director of the SAP Open Source Program Office - about the current engagement with the Agentic AI Foundation.

---

## The A2A Project

### Technical Steering Committee

| Company | Representative | Title |
| :--- | :--- | :--- |
| **SAP** | [**Sivakumar N.**](mailto:sivakumar.n@sap.com) | SAP OCTO |
| Google | Todd Segal | Principal Engineer |
| Microsoft | Darrel Miller | Partner API Architect |
| Cisco | Luca Muscariello | Distinguished Engineer |
| Amazon Web Services | Abhimanyu Siwach | Senior Software Engineer |
| Salesforce | Stephen Petschulat | Principal Architect |
| ServiceNow | Sean Hughes | Director of Open Science |
| IBM Research | Kate Blair | Director of Incubation |

### How to Get Involved

1. **Join the community:** Follow the [A2A Project](https://a2a-protocol.org/latest/) and contribute via the [GitHub repo](https://github.com/a2aproject/A2A).
2. **Internal coordination:** Contact **Sivakumar N.** for SAP's TSC participation and internal alignment.

---

## IETF

*Point of Contact: Philipp Tiesel*

### How to Get Involved

IETF is still sorting how to map agent work to their working groups:

- The [Agent to Agent mailing list](https://mailman3.ietf.org/mailman3/lists/agent2agent.ietf.org/) collects most discussions
- The March IETF meeting in Shenzhen included the [CATALIST non-WG forming BOF](https://datatracker.ietf.org/wg/catalist/about/) to sort activities
- Requirements for Identity and Trust will result in extensions for [OAuth](https://datatracker.ietf.org/wg/oauth/documents/) and work in [WIMSE](https://datatracker.ietf.org/wg/wimse/documents/) and [SCIM](https://datatracker.ietf.org/wg/scim/documents/)
- The [DAWN mailing list](https://mailman3.ietf.org/mailman3/lists/dawn.ietf.org/) has been started to discuss agent discovery

