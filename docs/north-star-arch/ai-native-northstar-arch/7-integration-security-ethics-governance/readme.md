---
id: id-nsa-7
sidebar_position: 7
slug: /ai-native-north-star-architecture/integration-security-ethics-governance
sidebar_custom_props:
    category_index: []
title: Integration, Security, Ethics & Governance
description: >-
    Cross-cutting governance for SAP's AI-native architecture: a single governed gateway enforces integration boundaries, agents operate as first-class principals with scoped identity, a Three-Tier AI Defense Architecture addresses agentic threats, and structured AI ethics review ensures responsible deployment under the EU AI Act and global compliance frameworks.
keywords:
    - AI integration
    - governed gateway
    - agent identity
    - Model Context Protocol
    - MCP
    - Agent-to-Agent protocol
    - A2A protocol
    - Three-Tier AI Defense
    - zero-trust authentication
    - prompt injection detection
    - EU AI Act
    - AI governance
    - AI ethics
    - SAP Global AI Ethics Policy
    - AI Ethics Impact Assessment
    - responsible AI
    - shift-left security
    - compliance
    - human-in-the-loop
    - North Star Architecture
    - NSA
sidebar_label: 7. Integration, Security, Ethics & Governance
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/platform-layer/id-nsa-6
pagination_next: north-star-arch/ai-native-northstar-arch/ecosystem/id-nsa-8
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-05-13
---

Autonomous agents operate within enterprise-grade boundaries for governance, identity, and interoperability. Integration remains the biggest challenge in enterprise AI, and governance and compliance are not yet fully solved across industries. SAP is focusing on building architectural foundations that make these challenges tractable.

## Integration

Agent traffic flows through a **single governed gateway** that enforces trust at the platform level. Agents are exposed only within governed boundaries and only when explicitly made available for collaboration across systems or organizational domains. The gateway provides landscape boundaries that define which systems an agent can access, fine-grained access policies that govern tool usage down to the parameter level, a unified tool catalog, and human-in-the-loop routing for critical decisions.

Integration shifts from **connector driven to intelligence driven**.

**AI enables integration**: Agents dynamically determine intent, select the right APIs, and orchestrate calls across systems. They learn from usage to improve quality over time, and they reduce environmental impact by removing redundant integration logic and minimizing avoidable system-to-system data transfers.

**Integration enables AI**: Existing APIs, events, and data across SAP and third-party software systems become tools that agents can discover and use through open standards, without requiring new development artifacts. Two open protocols make this possible. The Model Context Protocol provides tool integration, enabling agents to discover and invoke capabilities across systems. The Agent2Agent protocol supports multiagent coordination, enabling agents built by different teams, partners, and customers to collaborate within governed boundaries. SAP participates in the open standards ecosystem to ensure agents interoperate across the enterprise landscape, not just within SAP.

## Security and agent identity

Agentic AI introduces new categories of risk that traditional security frameworks were not designed to address. Agents make autonomous decisions, access external tools, and operate across trust boundaries. Multiagent systems acting across organizations magnify these risks. Regulatory frameworks, including the **EU AI Act** and **US AI Action Plan**, make AI security mandatory. Trust is what converts capability into permission to act. Without it, agents can advise but cannot operate. With it, agents execute across real workflows, accumulate institutional judgment, and become more valuable with each interaction.

In the AI-native model, **agents are first-class principals**: they authenticate, receive authorizations, and are governed like any other enterprise actor. Each agent carries its own identity that combines an application registration, policy assignments for persistent roles, and **scoped authorizations**. Users can grant agents a **bounded subset of their permissions** for unattended execution to make sure agents never act beyond their authorized scope. Third-party agents must also authenticate via identity services from SAP; agents without valid credentials are denied access. When agents from SAP call into third-party systems, they perform **token exchanges** to maintain governed access across trust boundaries.

The **three-tier AI defense architecture** from SAP addresses agentic threats through a progressive approach:

- **Foundation tier**: Zero-trust authentication, traffic inspection, prompt-injection detection, behavioral analytics, and cryptographically verifiable agent credentials. Entities are validated, and actions are recorded.
- **Supervision tier**: Deterministic control agents that monitor, sanitize, and authorize other AI agents. These supervisory agents enforce input validation, output filtering, and anomaly detection—with human oversight for high-risk decisions.
- **Automation tier**: Specialized AI agents that scale security operations through continuous audits, risk assessment, and policy enforcement. Identity management agents handle provisioning and contextual authorization. This layer embeds secure development practices into AI-assisted workflows, helping ensure AI-generated code is validated and compliant before release.

AI is also an ally: intelligent agents audit systems, perform authorization checks, detect vulnerabilities, and enforce compliance early in development. This embeds a **shift-left approach** that prevents risks rather than reacting to them.


## AI ethics

As AI becomes embedded across the architecture, shaping how systems reason, act, and interact, AI ethics becomes a foundational cross-cutting concern across each layer. It works to ensure AI systems are designed, developed, deployed, used, and commercialized in line with defined standards of trust and responsibility. Agents introduce a distinct ethical risk profile because they are able to not only generate outputs but also plan, act, invoke tools, and operate across system and organizational boundaries with limited human intervention. Their autonomy, scale, and ability to affect real workflows increase the potential for unintended harm, unfair outcomes, opaque decision-making, and weakened accountability. SAP helps operationalize AI ethics through a global policy framework, structured use-case review, defined oversight structure, and lifecycle controls integrated with security, data protection, risk management, and compliance.

SAP’s approach is anchored in the [SAP Global AI Ethics Policy](https://www.sap.com/products/artificial-intelligence/ai-ethics.html?pdf-asset=a8431b91-117e-0010-bca6-c68f7e60039b&page=1), aligned with internationally recognized frameworks including UNESCO’s Recommendation on the Ethics of Artificial Intelligence and the Organization for Economic Cooperation and Development (OECD) AI Principles. A defined oversight structure, supported by a dedicated AI ethics office, provides oversight, escalation paths, and accountability across the AI portfolio at SAP. An external advisory panel is consulted to deepen the understanding of broader ethical implications where necessary.

SAP applies a structured AI ethics impact assessment to classify use cases by risk and determine the appropriate review path. High-risk use cases are reviewed through defined governance bodies, with escalation to the AI ethics steering committee and, when broader implications arise, the Executive Board of SAP SE. When no ethically acceptable trade-off can be identified, the AI system cannot proceed in that form. Clear ethical principles, accountable oversight, and structured review define the boundaries within which agents can operate.

## Governance and Compliance

SAP governs both internal AI use and AI delivered through its products to ensure regulatory compliance. All AI use cases undergo **risk classification**; high-risk systems apply continuous monitoring, human oversight, data governance, and accuracy controls. Third-party components are governed through due diligence and ongoing compliance checks. SAP certifies its AI against international standards aligned with the International Organization for Standardization and the National Institute of Standards and Technology, supporting customers with the documentation required for their own compliance obligations.

With trust, integration, and governance in place, the AI-native enterprise opens beyond SAP.