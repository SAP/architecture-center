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
    date: 2026-10-26
---

Autonomous agents operate within enterprise-grade boundaries for governance, identity, and interoperability. Integration remains the biggest challenge in enterprise AI, and governance and compliance are not yet fully solved across the industry. SAP focuses on building the architectural foundations that make these challenges tractable.

## Integration

Providing our customers with a seamlessly integrated suite of products in SAP Business Suite remains our highest strategic objective. This is a prerequisite for delivering end-to-end business processes and for maximizing opportunities to cross-sell within our portfolio. This objective is realized by providing a true SaaS integration experience, distinguished by full automation, SAP-managed and operated landscapes, standardized integration patterns, shared [suite harmonization qualities](https://sap.sharepoint.com/teams/Grow-as-a-Suite/SitePages/Cross%20topics_Grow-as-a-Suite1.aspx), well-defined and discoverable API, as well as aligned data models across all suite offerings. 

Customers consistently indicate that SAP applications lack out-of-the-box integration capabilities and are difficult to integrate. The reality is that most integrations are still customer-managed, which means that customers or partners are required to set up, maintain, and operate technical wiring between SAP applications – an effort that is complex, time-consuming, cost-intensive, and error-prone.


**Automation and SAP-Managed Landscapes**
On our SaaS journey, shifting technical setup and landscape operations from customers (customer-managed) to SAP (automated and SAP-managed) is a key objective of this North Star target state. The goal is to provide an out-of-the-box, seamlessly integrated product suite that supports all major business processes across both public and private cloud. Going forward, customers should only make business-focused integration choices, supported by smart defaults and recommendations from SAP. The required technical implementation, for example, setting up trust, system configurations, and so on, will be automatically set up, fully managed, and operated by SAP. In a suite context, this means that customers can manage capabilities, such as adding or removing products and integrations, using SAP For Me, but are not exposed to their technical realization through SAP BTP accounts, service instances, subscriptions, and so on. 

The clear separation between business and technical integration, an intent-driven approach to provisioning and integration, and full automation based on best practices and landscape blueprints are all facilitated by [Unified Services](https://pages.github.tools.sap/CPA/unified-service-adoption/unifiedservices/). Once applications and services have been centrally registered ([Unified Service Manager](https://pages.github.tools.sap/atom-cfs/atom-docs/docs/product-concepts/managed-service/)), their provisioning and integration can be orchestrated through Unified Services, independent of where and how they have been built. The target landscape (desired state) is defined by combining landscape blueprints, customer input, and information about the actual as-is landscape ([Unified Metadata Service](https://pages.github.tools.sap/ums/documentation/docs/what-is-ums/)) and is then described and stored declaratively as resources in a central repository ([Unified Resource Manager](https://pages.github.tools.sap/atom-cfs/atom-docs/docs/product-concepts/urm-as-fulfillment-control-plane/)). Later, operators will be triggered to translate the intent into real landscape changes, for example, creating integrations ([Unified Customer Landscape](https://pages.github.tools.sap/atom-cfs/atom-docs/docs/product-concepts/customer-landscape/)). Standard interfaces such as the [Service Provider Fulfillment Interface (SPFI)](https://pages.github.tools.sap/atom-cfs/atom-docs/docs/product-concepts/provisioning/about-unified-provisioning/spfiapi/) and the [Service Provider Integration Interface (SPII)](https://pages.github.tools.sap/atom-cfs/atom-docs/docs/product-concepts/customer-landscape/spii/) help to unify the different set of tools and APIs available today. Outbound traffic follows the same principle through the **Unified Outbound Gateway**, a mandatory platform component that manages all egress from SAP applications and agents — covering API tracing, data loss prevention, and IAM grant management — so that governed, observable outbound connectivity is a platform quality rather than each team's own concern.

For Joule and agentic solutions, integrated blueprints bring the required platform components together. Customers select the application tenants to connect when provisioning the Joule solution. Assistants and custom agents then reuse the relevant landscape integrations according to their declared dependencies in UMS. Joule Studio and the agent runtime create the required Unified Services resources during deployment, keeping the integration choices consistent across components.

For Joule and agentic solutions, integrated blueprints bring the required platform components together. Customers select the application tenants to connect when provisioning the Joule solution. Assistants and custom agents then reuse the relevant landscape integrations according to their declared dependencies in UMS. Joule Studio and the agent runtime create the required Unified Services resources during deployment, keeping the integration choices consistent across components.

**Standardized Integration Patterns**
Integrating end-to-end business processes that span across heterogenous solution landscapes has long been one of the top strategic priorities. It’s also crucial to acknowledge that within SAP, we have a lot of heterogeneity in adopting integration patterns and the corresponding SAP frameworks and technologies applicable for these patterns. A primary reason for this comes from the fact that our suite of solutions (and their corresponding integrations) has been ‘both’ a combination of organically grown solutions, as well as acquired and enhanced products. [Best practices for application integration](https://sap.sharepoint.com/:w:/r/teams/CPAIntegration/_layouts/15/Doc.aspx?sourcedoc=%7B64BF5611-1A2D-4B65-82F1-8BBEC3F82969%7D&file=CPA_APIs_and_Events_ADR_Application_Integration_Guidance.docx&action=default&mobileredirect=true) provides guidance for integration patterns and SAP integration technologies.
 
**AI Powers Integration and Integration Powers AI**
In the era of AI-powered innovations, the composability that APIs provide is crucial to connect to real world of data, business applications, and services. In hybrid landscapes, integration powers AI use cases by providing the composable, trusted data and APIs it relies on for automation. As the solutions evolve, enterprises and consumers often deal with a plethora of APIs - and AI brings its own additional asks for APIs. Existing APIs, events, and data across SAP and non-SAP systems become tools that agents can discover and use through open standards, without requiring new development artifacts.

Existing business APIs will become easier for agents to use through richer descriptions, semantic annotations and tenant-specific metadata. New APIs can be designed around the tasks agents need to perform. AI-specific enrichments will be published as internal metadata through ORD and maintained separately from public API documentation, while preserving the API contract.

Traditional integrations are static, rigid, assisted with pre-built connectors and packages. They now need to evolve to be more dynamic, API-driven and AI-powered. Integration is thus shifting from connector-driven to intelligence-driven. AI agents dynamically determine the intent, generate workflows on demand, intelligently selecting and orchestrating the API calls.  AI agents don’t just consume APIs, they can enhance integration itself by learning from usage, improving API design, automating integration mappings, and predicting integration failures before they occur.  For more details on SAP’s positioning, please check [agent-to-agent interoperability patterns](https://sap.sharepoint.com/sites/209131/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2F209131%2FShared%20Documents%2FWG%20AI%2FWG%5FAI%5FWhitepaper%5FAgent%5FInteroperability%2Epdf&parent=%2Fsites%2F209131%2FShared%20Documents%2FWG%20AI) and the [agent integration patterns](https://sap.sharepoint.com/teams/CPADataManagement/Shared%20Documents/Forms/AllItems.aspx?id=%2Fteams%2FCPADataManagement%2FShared%20Documents%2FWG%20AI%2F20%5FDocs%5Fand%5FMaterial%2FWS%5FAI%5FAgent%5FArchitecture%2FWG%5FAI%5FADR%5FAgent%5FArchitecture%2Epdf&parent=%2Fteams%2FCPADataManagement%2FShared%20Documents%2FWG%20AI%2F20%5FDocs%5Fand%5FMaterial%2FWS%5FAI%5FAgent%5FArchitecture). A well-crafted, AI-powered integration strategy depends not only on robust and high-quality APIs following our [SAP API Guidelines](https://pages.github.tools.sap/CPA/api-guidelines/), but also significantly relies on the quality of their metadata, as clear, machine-readable documentation (for example, [OpenAPI specification](https://spec.openapis.org/oas/latest.html)) and discoverability, are essential to ensure seamless and highly-automated integration.  AI also reduces environmental impact by eliminating redundant integration logic and minimizing avoidable system-to-system data transfers.

Provisioning and integration increasingly rely on JSON and YAML files, such as deployment manifests that describe what a platform should create or configure. When other teams or customers depend on their structure, these files become API contracts. SAP’s JSON/YAML API Guideline applies the same discipline to these contracts as to other APIs: defined schemas, versioning, backward compatibility and validation before use. The CPA JSON Schema Registry is the recommended place to publish and discover their schemas.

[One Domain Model](https://sap.sharepoint.com/sites/201365/SitePages/Concept-of-ODM.aspx) (ODM) 2.0 provides a shared vocabulary of terms and definitions that all applications and services need to follow, ensuring high quality of metadata for business objects and consistency across the ecosystem.

[Open Resource Discovery](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/) (ORD) will continue to be the central protocol used by applications and services to describe their resources and capabilities in a consistent and standardized way across SAP. By providing access to metadata on APIs (OData, OpenAPI, MCP), events (AsyncAPI), business entity types, and data products, ORD supports both static documentations, such as in SAP [Business Accelerator Hub](https://api.sap.com/), as well as dynamic use cases, such as tenant-specific configurations and runtime extensions in the SAP BTP. 

It facilitates the discovery of APIs through a central catalog and enables automatic integration. ORD will also enable SAP Business Knowledge Graph, discovery of AI agents (A2A), MCP servers, and their capabilities (tools, resources and prompts).

All Lines of Business must expose both public and internal APIs via ORD in a tenant-specific manner, including customer extensions, enabling Joule and agents to discover and consume application data and functionality at scale. The Agent Gateway (see Section 4) is the mandatory routing and policy hub for all agent interactions. It consolidates ATIL and the MCP Builder runtime into a single component, and exposes available tools per consumer via the MCP get-tools endpoint. Applications also expose AI Authorization metadata describing which entities a user can access; Joule and agents use this during tool discovery to ensure proposed actions stay within the user's actual rights. Agent traffic flows through a single governed gateway that enforces trust at the platform level. Agents are exposed only within governed boundaries and only when explicitly made available for collaboration across systems or organizational domains. The gateway provides landscape boundaries that define which systems an agent can access, access policies governing agents and tools, a unified tool catalog, and human-in-the-loop routing for critical decisions. Applications continue to enforce their own business authorizations when tools invoke their APIs. Two open protocols make this possible: The Model Context Protocol (MCP) provides tool integration, enabling agents to discover and invoke capabilities across systems. The Agent-to-Agent (A2A) protocol enables multi-agent coordination, enabling agents built by different teams, partners, and customers to collaborate within governed boundaries. SAP participates in the open standards ecosystem to ensure agents interoperate across the enterprise landscape, not just within SAP.

Integration shifts from **connector driven to intelligence driven**.

## Security

Protecting customers’ critical business data across cloud and on-premises environments has always been central to SAP’s mission. SAP has built a long-standing foundation of secure software development and security offerings, including, but not limited to, [SAP BTP Cloud Identity Services](https://www.sap.com/products/financial-management/identity-management.html), [SAP BTP Key Management](https://pages.github.tools.sap/kms/kms-docs/docs/getting-started/), [SAP BTP Credential Store](https://www.sap.com/germany/products/technology-platform/credential-store.html), [SAP Identity Management](https://www.sap.com/products/financial-management/identity-management.html), [SAP Single Sign-On](https://www.sap.com/products/financial-management/secure-login-service-for-gui.html), [SAP Enterprise Threat Detection](https://www.sap.com/products/financial-management/enterprise-threat-detection.html), and [SAP NetWeaver Code Vulnerability Analyzers](https://pages.community.sap.com/topics/abap-testing-analysis/code-vulnerability-analyzer).

**Agentic AI** introduces new categories of risk that traditional security frameworks were not designed to address. Its ability to make autonomous decisions, access external tools, and coordinate across trust boundaries expands the attack surface and creates interaction-driven vulnerabilities. Multi-agent systems acting across organizations magnify these risks. Regulatory frameworks such as the U.S. AI Action Plan and EU AI Act now make AI security mandatory, emphasizing collaborative, shared-threat intelligence principles aligned with SAP’s architecture. Trust is what converts capability into permission to act. Without it, agents can advise but cannot operate. With it, agents execute across real workflows, accumulate institutional judgment, and become more valuable with each interaction. **AI is also an ally**: Intelligent agents can audit systems, perform authorization checks, detect vulnerabilities, and enforce compliance early in development, embedding a shift-left approach that prevents risks rather than reacting to them. 
In the AI-native model, agents are first-class principals: they authenticate, receive authorizations, and are governed like any other enterprise actor. Each agent carries its own identity that combines an application registration, policy assignments for persistent roles, and scoped authorizations. Users can grant agents a bounded subset of their permissions for unattended execution to make sure agents never act beyond their authorized scope. An agent can also act in its own right, with scoped authorizations assigned specifically to its identity rather than delegated by a user. Third-party agents must also authenticate via identity services from SAP; agents without valid credentials are denied access. When agents access other systems, the Unified Outbound Gateway performs token exchange on their behalf, while the Unified Inbound Gateway performs inbound token validation.

Agent permissions complement the application’s business authorizations. API and tool metadata supports permission generation, and integration turns those permissions into tenant-aware AMS policies. Administrators assign these policies to user and agent identities; Agent Gateway enforces them when agents and tools are called. Applications continue to enforce their business authorization checks. The initial gateway model distinguishes read and write access to target APIs, with finer-grained controls evolving as the supporting metadata and policy capabilities mature.

**What the SAP Security Framework Provides**
SAP’s Three-Tier AI Defense Architecture extends its proven security, identity, and runtime capabilities into a comprehensive framework designed to counter agentic threats while meeting global regulatory requirements. It unites foundational protection, agent oversight, and AI-driven automation to secure distributed, autonomous, and adaptive enterprise systems. AI systems amplify familiar risks such as broad attack surfaces, distributed architectures, and multi-party supply chains, while introducing novel ones such as prompt injection, model extraction, and data poisoning during training or runtime. Since AI agents act autonomously at scale, their decisions can have cascading effects across critical business operations. SAP’s approach adapts zero-trust principles to these realities, ensuring consistent protection across cloud, edge, and on-premise environments.

**Identity Management** becomes more complex in multi-agent ecosystems where models, services, and processes require distinct credentials and dynamic authorizations. SAP enables policy-based authentication, adaptive credential lifecycles, and context-aware access control. Critically, agents must not inherit a user's full permissions. Scoped delegable authorizations let users define an upper bound on what they delegate — restricting agents to, for example, only non-destructive operations — so the effective permission is always the intersection of what the agent is allowed and what the user has granted. **Observability** expands beyond logging to capture agent behavior, decision auditing, and anomaly detection.

**The secure use of third-party AI components** is another focus area. Modern AI systems often rely on external LLMs, agents, and tools accessed using the Model Context Protocol (MCP). SAP’s security posture enforces rigorous vetting, encrypted channels, and strict isolation to prevent compromise propagation across interconnected systems.

**Encryption, key management, and configuration controls** are optimized for AI workloads that handle high volumes of sensitive data and maintain persistent states. Automated configuration validation and drift detection preserve security posture.

**Data protection** follows a privacy-preserving design. Modules such as the Data Protection and Anonymization component in [SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core) and [SAP Data Privacy Integration](https://www.sap.com/germany/products/technology-platform/data-privacy-integration.html) apply anonymization and data masking to maintain compliance without compromising model performance.

**Monocultures** represent a new systemic risk. As organizations deploy similar AI models, shared vulnerabilities could lead to cross-enterprise compromise. SAP’s diverse, modular security architecture mitigates this concentration risk through isolation boundaries, policy variation, and continuous model validation.

**Agentic coding** introduces another frontier. Coding agents that assist in software development must adhere to security-aware guidelines, ensuring AI-generated code undergoes proper review and validation before deployment. SAP promotes new coding standards interpretable by AI agents to keep automated development aligned with enterprise security policy.

**How the Three-Tier AI Defense Architecture Works**
SAP implements security through a progressive three-tier defense model that integrates traditional controls, agent oversight, and AI-powered automation.

- **Tier 1: The AI Security Mesh Foundation Layer** provides zero-trust authentication, authorization, and traffic inspection. It validates all entities, monitors LLM calls and tool usage, authorizes actions, and records events. Core controls include secure gateways, mutual TLS with dynamic certificate rotation, zero-trust policy enforcement, prompt-injection detection, behavioural analytics, and SBOM verification. Every entity is validated; every action is recorded. The **Agentic Identity and Access Management (AIAM)** Framework manages non-human identities using cryptographically verifiable agent birth certificates, dynamic permission templates, automated credential rotation, integration with SAP BTP Identity Authentication, and behavioural identity validation.

- **Tier 2: The Agent Supervision Layer** deploys deterministic control agents that monitor, sanitize, and authorize other AI agents. These supervisory agents enforce input validation, output filtering, anomaly detection, and human oversight. Advanced capabilities include emergent threat modeling, predictive defense updates, and proactive detection of novel attack patterns.

- **Tier 3: The Core Security Agent Automation Layer** uses specialized AI agents to scale and automate security operations. Identity management agents handle provisioning and contextual authorization, while Security and Compliance Agents perform continuous audits, risk assessment, and policy enforcement. Operations and Maintenance Agents manage identity synchronization, registry monitoring, and predictive maintenance. This layer embeds secure development best practices directly into AI-assisted workflows, ensuring AI-generated code is validated, reviewed, and compliant before release.

## AI ethics

As AI becomes embedded across the architecture, shaping how systems reason, act, and interact, AI ethics becomes a foundational cross-cutting concern across each layer. It works to ensure AI systems are designed, developed, deployed, used, and commercialized in line with defined standards of trust and responsibility. Agents introduce a distinct ethical risk profile because they are able to not only generate outputs but also plan, act, invoke tools, and operate across system and organizational boundaries with limited human intervention. Their autonomy, scale, and ability to affect real workflows increase the potential for unintended harm, unfair outcomes, opaque decision-making, and weakened accountability. SAP helps operationalize AI ethics through a global policy framework, structured use-case review, defined oversight structure, and lifecycle controls integrated with security, data protection, risk management, and compliance.

SAP’s approach is anchored in the [SAP Global AI Ethics Policy](https://www.sap.com/products/artificial-intelligence/ai-ethics.html?pdf-asset=a8431b91-117e-0010-bca6-c68f7e60039b&page=1), aligned with internationally recognized frameworks including UNESCO’s Recommendation on the Ethics of Artificial Intelligence and the Organization for Economic Cooperation and Development (OECD) AI Principles. A defined oversight structure, supported by a dedicated AI ethics office, provides oversight, escalation paths, and accountability across the AI portfolio at SAP. An external advisory panel is consulted to deepen the understanding of broader ethical implications where necessary.

SAP applies a structured AI ethics impact assessment to classify use cases by risk and determine the appropriate review path. High-risk use cases are reviewed through defined governance bodies, with escalation to the AI ethics steering committee and, when broader implications arise, the Executive Board of SAP SE. When no ethically acceptable trade-off can be identified, the AI system cannot proceed in that form. Clear ethical principles, accountable oversight, and structured review define the boundaries within which agents can operate.

## Governance and Compliance

A crucial aspect of building trust is SAP’s use of a comprehensive internal governance and compliance system aligned with ISO and NIST. As AI adoption expands, SAP governs both internal AI use and the AI delivered through its products to ensure regulatory compliance and enable customers and partners to meet their obligations. SAP’s AI Governance framework strengthens regulatory adherence, supports AI literacy for staff, and prepares technical and operational controls that will be increasingly automated in the SAP BTP layer to reduce effort for SaaS applications.

**Avoidance of General Purpose AI Model Provision:** SAP does not design or train general purpose models above the 10²³ FLOP threshold and does not fine-tune such models beyond one-third of their training compute. If SAP ever assumes these roles, additional safeguards will be applied to meet stricter regulatory requirements.

**Central AI Inventory:** SAP maintains centralized repositories to track all internal AI and product-embedded AI systems, ensuring clear oversight, compliance workflows, and risk visibility across different categories of use.

**Risk Classification and Mitigation:** All AI use cases undergo risk classification. High-risk systems must apply stronger measures such as continuous monitoring, human oversight, data governance, accuracy controls, incident reporting, and post-market assessment, with guidance and platform-level automation to follow.

**Third-Party Governance:** Suppliers, SolEx partners, and OEM partners are governed through due-diligence, onboarding, and ongoing compliance checks so that all parties meet their technical, operational, and legal responsibilities.

**Certification:** SAP reinforces trust by certifying its AI against international standards. A unified governance system increases standardization and automation, lowers audit effort, and supports customers with instructions for use, CE materials, and other documents required for their compliance.

**Agent Governance:** Agents require clear ownership and lifecycle accountability. For SAP standard agents, SAP AI Agent Hub discovers ownership from provisioning records in URM. For custom agents, Joule Studio’s Custom Agent Deployment component writes the deployer’s contact to UMS at deployment. Agent Hub surfaces this information when its Owner and Sponsor capability is enabled; standard-agent ownership is read-only in the Hub.

Verification is governed separately. SAP AI Agent Hub writes each agent’s verification status and the tenant’s enforcement policy to UMS. When enforcement is enabled, Agent Gateway blocks calls to and from agents marked unverified. Customers control when they activate enforcement, independently of whether ownership information is displayed.

With trust, integration, and governance in place, the AI-native enterprise opens beyond SAP.