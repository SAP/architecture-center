---
id: id-ra0026-1
slug: /ref-arch/qmBok_Yq/1
sidebar_position: 1
title: 'bye [RA0026]'
description: 'byr'
sidebar_label: 'bye'
tags:
  - azure
contributors:
  - abhissharma21
  - navyakhurana
  - cernus76
last_update:
  date: 2025-10-09
  author: abhissharma21
---

![drawio](drawio/diagram-h0tXGdFhHD.drawio)

INTERNAL

**Office of the CTO – PAA**Architecture Validator Scoping Document

Title

Date

25-08-2025

Version

1.0

Status

Draft (Internal)

Contributor(s)

Vedant Gupta, Swati Maste, Jonas Mohr, Gabriel Kevorkian, Praveen Kumar Padegal, Pierre-Olivier Basseville, Navya Khurana

Reviewer(s)

PVN Pavan Kumar

GitHub Repo Link

[architecture-validator](https://github.tools.sap/platform-adoption-advisory/architecture-validator/tree/ruleGen)

**Version**

**Date**

**Changes**

**Table of Contents**

[EXECUTIVE SUMMARY 3](#_Toc207289772)

[PROBLEM STATEMENT & OBJECTIVES 3](#_Toc207289773)

[SCOPE DEFINITION 3](#_Toc207289774)

[TECHNICAL APPROACH 4](#_Toc207289775)

[KEY STAKEHOLDERS 4](#_Toc207289776)

[CONSTRAINTS AND ASSUMPTIONS 5](#_Toc207289777)

[DELIVERABLES AND TIMELINES 5](#_Toc207289778)

[RISKS 5](#_Toc207289779)

[USER FLOW 6](#_Toc207289780)

# EXECUTIVE SUMMARY

This document describes the objectives, scope, approach and deliverables for the Architecture Validator. The Architecture Validator started as a research project, intended to be productized as a tool available within Architecture Center, that automatically assesses solution architectures against an evolving set of architectural and design guidelines. The current version focuses on practical, incremental capabilities that assist contributors and reviewers to identify anti-patterns and improve architecture quality at scale, for draw.io solution diagrams. The tool uses Knowledge Graphs (KG) as the data representation layer and makes use of LLMs for other aspects like creating annotations for the representation and generating logical rules.

# PROBLEM STATEMENT & OBJECTIVES

The review of solution architectures is currently manual and time consuming. As published content grows, the manual process will not scale and may delay review processes or reduce quality. The main objectives of the Architecture Validator are as follows:

1. Demonstrate technical feasibility of automated validation workflows for architecture diagrams.
2. Provide a reusable, low-effort integration that fits contributor and reviewer workflows (for example GitHub PRs in Architecture Center, and a UI layer).
3. Reduce reviewer effort by pointing out SAP architectural guideline violations with a low error rate.
4. Allow rules and knowledge to evolve without frequent code changes, and substantial development effort.

# SCOPE DEFINITION

Current Scope

- Limited implementation that validates architecture diagrams and using a knowledge-graph based representation.
- Integration demonstrators for GitHub Actions (Architecture Center PR flow) and a standalone validator UI within Architecture Center.
- Export of validation report in for downstream rendering.
- Extensive set of rules covering aspects like CAP app development, extension development, integration scenarios, GenAI use cases, (limited) Joule related use cases, etc.

Extended Scope (fulfillment subjective)

- Limited set of stylistic checks where practical, derived from BTP Solution Guidance.
- Limited admin control for rule and metadata management through CRUD APIs.

# TECHNICAL APPROACH

The PoC uses a three‑phase validation pipeline: extraction, recognition and rule application.



Figure 1: Design Overview of Architecture Validator

**Extraction**

This phase transforms raw input, for now these are architecture diagrams made using draw.io tool into a standardized KG representation using Resource Description Framework (RDF) a flexible data model for representing information as subject–predicate–object triples, based on Web Ontology Language or OWL ontology giving semantic modelling capabilities.

**Recognition**

Enrichment of the extracted KG happens in this phase. Recognizers annotate architectural entities with additional RDF statements by mapping them to known artifacts in a persistent architecture knowledge base. The knowledge for the recognizers can come from various sources to perform enhancements based on checks like naming and related conventions, understanding the classification/family of the architectural component in consideration, extracting nested paths from connectors, etc.

**Rule Application**

The final step is validation against rules. These rules are based on architecting experience and contain guidelines to assess conformity with architecture best practices, patterns, and constraints.

# KEY STAKEHOLDERS

- Solution Contributors on Architecture Center – End users who will use the validator in their workflows.
- Reviewers on Architecture Center – Architects/Experts reviewing content for Architecture Center.
- Development Team – Responsible for architecting and developing the feature, and for integration scenarios (UI & Architecture Center)
- QA/Validation Partners – Responsible for bet testing features and providing feedback on functional validation.

# CONSTRAINTS AND ASSUMPTIONS

*Constraints*

- The PoC will aim for draw.io diagrams as the input type in the first release.
- The validator will return best-effort assessments and perfect accuracy is not expected.
- The validation rules are collected from experts and may contain bias. Ideal set of rules will be evolved.

*Assumptions*

- Architecture diagrams can be reasonably converted to a KG representation. A set of diagramming policies will also be published to allow for perfect parsing.
- Diagram are assumed to adhere to rules in the BTP Solution Guidance, as that has bene the source of inspiration to design the KG representation layer.

# DELIVERABLES AND TIMELINES

All dates are target dates and may be adjusted as the PoC progresses.

**Milestone 1** – Demo to Architecture Center stakeholders

- Activity: Project deployment and on-line testing from Architecture Center, demonstrating all validation scenarios. **End of core development**.
- Target date: 2025 CW 37

**Milestone 2** – Beta Testing Readiness

- Activity: Integrating feedback from Milestone 1 and rolling out Validator for quality testing internally. **Production readiness checks**.
- Target date: 2025 CW 38

**Milestone 3** – Full Readiness

- Activity: Integration of feedback and refinement of rules and product. **Final readiness checks**.
- Target date: 2025 CW 41

**Milestone 4** – Staged Integration with Architecture Center & Load Testing

- Activity: Integration and roll-out on Architecture Center.
- Target date: 2025 CW 42-43

# RISKS

1. **False Positives** – If the validator reports many inaccurate warnings, user trust may decline. Mitigation: Focus on high-precision rules, provide a way to enhance explainability and involve content reviewers early in tuning rules.
2. **Extraction Robustness** – Diagrams vary in quality and structure; extractors may fail or miss important elements. *Mitigation*: Start with a well-scoped diagram style, add heuristics and provide guidance to contributors.
3. **Knowledge Reconciliation** – Matching entities to knowledge base entries is error-prone. *Mitigation*: Integrate human-in-loop to verify and keep knowledge sources succinct.
4. **Resource Constraints** – Limited resources may may slow progress. *Mitigation*: Prioritize a small and high-value feature set.
5. **Rule Maintenance** – Building and maintaining SPARQL rules can be complex. *Mitigation*: Design rule templates, provide clear authoring guidance.
6. **LLM Dependency** – LLMs may hallucinate and can introduce errors. *Mitigation*: Restricting LLM use to non-critical enhancements and validate LLM outputs with deterministic checks.

# USER FLOW

Storyline for user contributing use case and architecture on Architecture Center.

**Persona **– Partner Consultant

**1. Setting the Context**

Designing a real-world agentic solution with a customer involving Microsoft Copilot integration with SAP BTP applications.

**2. Seeking Guidance from Architecture Center**

SAP Architecture Center is explored for reference scenarios, while there were multiple foundational examples, none map exactly to the use case.

**3. Initial Architecture**

A custom architecture fit the customer's needs is created and is contributed as a reference for others facing similar challenges.



**4. Submitting to the Architecture Validator**

It is uploaded to the Architecture Validator to ensure alignment with SAP architectural principles.

**5. Validation Report**

The Validator identifies a potential anti-pattern, where the integration skipped the Joule layer, which is the recommended pathway for Copilot connections. Details are provided in the validation report.

**6. Refining with Guided Recommendations**

Based on Validator feedback and linked reference architecture, the solution is restructured using Joule and Joule Studio to integrate Copilot to the application.



**7. Final Validation and Contribution**

The revised diagram passed all validation checks and is now queued for expert review, eventually becoming part of the Architecture Center.

**8. Outcome and Impact**

This process showed how the Architecture Validator can help consultants catch issues early, align with SAP standards, and contribute validated content back to the ecosystem.

