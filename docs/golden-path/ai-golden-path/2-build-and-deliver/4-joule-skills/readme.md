---
sidebar_position: 4
title: Joule Skills
description: >-
  Build, deploy and run custom Joule Skills using Joule Studio on SAP BTP for extending
  SAP Joule capabilities.
keywords:
    - sap
    - joule
    - joule studio
    - joule skills
    - sap build
    - low-code
sidebar_label: Joule Skills
image: img/ac-soc-med.png
tags:
    - ai-golden-path
    - genai
    - agents
    - build
    - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
last_update:
  author: SAP
  date: '2026-04-23'
---

# How to build, deploy and run Joule Skills

## What you will build

Joule Skills enable developers to extend SAP Joule's capabilities by connecting to SAP and non-SAP systems through a low-code/no-code development environment. Built within **Joule Studio** as part of SAP Build, these custom skills allow organizations to create intelligent conversational AI interfaces for business processes across their enterprise landscape.

By following this guide, you will learn how to:

- Create custom Joule Skills using Joule Studio's low-code interface
- Deploy Joule Skills to both testing and production environments
- Integrate with SAP backends including SAP S/4HANA, SAP SuccessFactors, and SAP Ariba

## Prerequisites & setup

Before building Joule Skills, ensure your environment meets these requirements:

- **SAP BTP Account**: Enterprise account (CPEA, BTPEA, or subscription) with SAP Build entitlement
- **SAP Build Developer License**: Required for building, testing, and deploying custom Joule Skills
- **Joule Entitlement**: Needed to deploy skills to production environments
- **Identity & Access Management**: Proper role assignments for Joule Studio access
- **System Connectivity**: Configure destinations in SAP BTP Cockpit for backend system access

**Setup Resources:**

- **[How to Get Started with Joule Studio](https://community.sap.com/t5/application-development-and-automation-blog-posts/how-to-get-started-with-joule-studio/ba-p/14152855)** – Step-by-step setup guide covering prerequisites, commercial details, and technical setup
- **[Technical Setup Guide](https://help.sap.com/docs/Joule_Studio/45f9d2b8914b4f0ba731570ff9a85313/04b323352fa645238211ce017f634d34.html)** – Official documentation for configuring Joule Studio within SAP Build
- **[Joule Studio FAQ](https://community.sap.com/t5/technology-blog-posts-by-sap/joule-studio-goes-live-answers-to-your-top-questions/ba-p/14152403)** – Answers to frequently asked questions about setup and capabilities

## Architecture at a glance

This reference architecture outlines how Joule Studio can be leveraged to integrate and extend SAP and non-SAP solutions across cloud and hybrid landscapes. By tapping into the expertise of citizen developers, Joule Studio facilitates the adaptation, improvement, and innovation of business processes, driving positive business outcomes through sophisticated AI capabilities.

![Architecture Overview](./images/joule-studio-ref-arch.svg)

## Build

Joule Studio provides a visual, low-code environment for creating custom skills that connect to business data and orchestrate workflows across systems. Follow [Build Your First Joule Skill in Joule Studio (Developer Tutorial)](https://developers.sap.com/group.joule-studio-first-skill.html) to set up your environment, create and deploy custom Joule Skills.

### Development Workflow

1. **Create Project**: Access Joule Studio from SAP Build lobby and create a new Joule Skill project
2. **Design Skill Logic**: Define input/output parameters, add actions (API calls), configure conditional logic, and create response templates
3. **Configure Destinations**: Set up Action Projects to wrap OData APIs and connect to SAP/non-SAP systems
4. **Map Data**: Use the skill editor to map data between systems, apply formulas, and orchestrate multi-step workflows
5. **Test Locally**: Validate skill behavior in the standalone Joule assistant before deployment

### Capabilities

- **Multiple Skill Types**: Navigation, list/search, transactions (create/update/delete), decision-making, data access
- **Workflow Integration**: Trigger SAP Build Process Automation workflows and automations from within skills
- **System Connectivity**: Connect to SAP backends (SAP S/4HANA, SAP SuccessFactors, SAP Ariba) and third-party systems via OData APIs
- **Conditional Logic**: Implement branching workflows with the Condition Editor
- **Data Transformation**: Use Formula Editor for data manipulation and type conversions
- **Reusable Components**: Call other Joule Skills or leverage existing SAP Build automation artifacts

## Deploy

Joule Skills can be deployed to two different environments depending on your use case:

### Standalone Environment (Testing)

- Isolated test environment accessed via standalone Joule assistant
- Quick deployment for rapid iteration and validation
- Ideal for development and functional testing
- Not connected to production Joule instances

### Shared Environment (Production)

- Deploys skills to unified Joule across all LOB solutions
- Accessible from SAP Build Work Zone, SAP S/4HANA, SAP SuccessFactors, and other Joule-enabled applications
- Requires deployment time in production tenants
- Skills appear alongside standard SAP-delivered Joule capabilities

## Run

Once deployed, Joule Skills can be invoked through natural language interactions across SAP Joule-enabled applications.

### Integration Points

Skills integrate with various SAP and non-SAP systems:

- **SAP Backends**: SAP S/4HANA (cloud and on-premise), SAP SuccessFactors, SAP Ariba etc.
- **SAP Build Components**: Process Automation workflows and automations
- **Third-party Systems**: Via OData APIs and configured destinations

### Runtime Configuration

- **[Use SAP Joule with On-Premise SAP S/4HANA](https://www.mindsetconsulting.com/can-i-use-joule-with-an-s-4hana-system-on-premise/)** – Guide for connecting Joule Skills to on-premise systems via Cloud Connector

## Best Practices

| Dos ✅ | Don'ts ❌ |
|--------|-----------|
| Leverage existing SAP Build automations and workflows | Rebuild existing functionality from scratch |
| Implement proper error handling and user-friendly error messages | Leave API errors unhandled or expose technical error messages to users |
| Test skills in standalone environment before production deployment | Deploy directly to production without thorough testing |

### Confirmation Steps for Data Modifications (AI Ethics Pre-requisite)

For create, update, and delete operations, implementing **confirmation steps** is a critical requirement to ensure user consent and maintain AI ethics standards. This prevents unintended data modifications and provides users with visibility into actions before execution.

**[Action Group Confirmation Documentation](https://help.sap.com/docs/joule/joule-development-guide-4b327297dce247fcb88a5f5bfeea97a1/action-group)**

Key points:

- Always implement confirmation dialogs for transactional operations (create, update, delete)
- Clearly display what data will be modified before execution
- Allow users to review and approve changes before committing to backend systems

### Message Generation from Joule

Leverage **Joule's built-in Message Generation** capabilities to create dynamic, context-aware responses instead of static message templates. This allows for more natural conversational experiences and reduces the maintenance burden of hardcoded responses.

**[Gen AI Response Generation Documentation](https://help.sap.com/docs/joule/joule-development-guide-4b327297dce247fcb88a5f5bfeea97a1/gen-ai-response-generation)**

Benefits:

- Generate contextual responses based on user intent and data
- Provide more natural, conversational interactions
- Reduce template maintenance overhead

### Scenario Dependencies for Complex Use Cases

For complex workflows requiring multi-step coordination, use **Scenario Dependencies** to orchestrate multiple Joule Skills. This feature allows you to chain skills together and manage dependencies between them.

**[Scenario Dependencies Documentation](https://help.sap.com/docs/joule/joule-development-guide-4b327297dce247fcb88a5f5bfeea97a1/scenario-dependencies)**

**Important**: Scenario Dependencies should not replace custom agents when agents are the better architectural choice. Use scenario dependencies for simple skill orchestration, but consider custom agents for:

- Complex reasoning and decision-making
- Advanced state management across sessions
- Integration with external AI models or specialized tools
- Requirements beyond simple skill chaining

### Asynchronous Backend Calls

Implement **asynchronous API requests** for long-running operations to prevent timeouts and improve user experience. This is particularly important for operations that involve heavy backend processing or multi-system coordination.

**[Asynchronous API Requests Documentation](https://help.sap.com/docs/joule/joule-development-guide-4b327297dce247fcb88a5f5bfeea97a1/asynchronous-api-requests)**

Use cases:

- Long-running data processing operations
- Multi-step workflows with external system dependencies
- Report generation and large data queries
- Operations that may take more than a few seconds to complete

### Tutorials

- **[Create a Joule Skill](https://help.sap.com/docs/Joule_Studio/45f9d2b8914b4f0ba731570ff9a85313/00c231a71c6e4255afdacd31264418a6.html)** – Official SAP Help documentation for creating custom Joule Skills
- **[Build Custom Joule Skills for SAP and Non-SAP Systems (Discovery Center Mission)](https://discovery-center.cloud.sap/missiondetail/4643/?tab=overview)** – Comprehensive mission covering multi-system integration and best practices
- **[Code-Along: Build a Joule Skill from Scratch (YouTube)](https://www.youtube.com/watch?v=tYm2mwsIuXY)** – Live demonstration of the complete skill development process
- **[Build Custom Joule Skills Using Joule Studio (SAP BTP Garage)](https://www.youtube.com/watch?v=lNg6MInY8a4)** – Workshop-style walkthrough with real-world examples
- **[The Complete Joule Studio Resource Hub](https://community.sap.com/t5/technology-blog-posts-by-sap/the-complete-joule-studio-resource-hub-everything-you-need-to-get-started/ba-p/14183113)** – Curated collection of learning resources and documentation

:::info References
- [SAP Architecture Center](https://architecture.learning.sap.com/)
- [Joule Studio](https://help.sap.com/docs/Joule_Studio?locale=en-US)
- [Guidelines for Capability Development](https://help.sap.com/docs/joule/joule-development-guide-4b327297dce247fcb88a5f5bfeea97a1/guidelines-for-capability-development?locale=en-US)
- [Build Your First Joule Skill in Joule Studio](https://developers.sap.com/group.joule-studio-first-skill.html)
:::

