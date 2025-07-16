---
id: id-ra0005-10
slug: /ref-arch/e5eb3b9b1d/10
sidebar_position: 10
title: "Vibe Coding with Cline and SAP AI Core"
description: "Learn how to set up and use Cline, an autonomous coding agent, with SAP AI Core to accelerate your development workflows."
keywords:
  - sap
  - cline
  - ai core
  - generative ai
  - autonomous coding
sidebar_label: "Vibe Coding with Cline and SAP AI Core"
image: img/logo.svg
tags:
  - genai
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - jmsrpp
  - mahesh0431
last_update:
  author: jmsrpp
  date: 2025-07-16
---

As an extension for VSCode, Cline autonomously generates code, suggests optimizations, and executes terminal commands – while you stay in control. Developers working with SAP AI Core can now enjoy this Cline extension and its functionality with access to cutting-edge AI models available in SAP AI Core, including the latest models from Anthropic including Claude 4, Google including Gemini 2.5 Pro, GPT models from OpenAI, and others.

## Getting Started

To get started with Cline and SAP AI Core, you will first need to create a service key for SAP AI Core. This will provide you with the necessary credentials to connect Cline to the AI models available in SAP AI Core. Follow the [initial setup](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/initial-setup) for details.

### Configure Cline for SAP AI Core

Once you have your SAP AI Core service key, you need to configure the following settings in Cline:

1.  **API Provider**: Select `SAP AI Core`.
2.  **API Core Client ID**: Your client ID from the service key.
3.  **API Core Client Secret**: Your client secret from the service key.
4.  **AI Core Base URL**: The `AI_API_URL` from your service key.
5.  **AI Core Auth URL**: The `url` from your service key.
6.  **AI Core Resource Group**: The resource group you want to use.
7.  **Model**: The model you want to use (e.g., `anthropic--claude-4-sonnet`, `gemini-2.5-pro`, `gpt-4.1`). You must have a [deployment](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core) for this model in SAP AI Core.

With these settings configured, you are ready to start "vibe-coding" with Cline and SAP AI Core.

## AI-Assisted Development Process

### Grounding Rules

Provide grounding rules via markdown in your repository directory. For example, split general and SAP-specific guidelines as follows:

*   `prd rule.md`: Product Requirements Document generation with TDD approach
*   `cap-fiori.md`: SAP CAP and Fiori best practices for deterministic generation

**Note**: These are demo-focused rules. Production applications require comprehensive grounding rules.

### Generation Workflow

1.  **Configure Cline**: Set to "Act mode" with auto-approve, read edit enabled
2.  **Use Generation Prompt**:
    *   **Goal**: Generate / Create a CAP Application
    *   **Application Details**: Application will be used to manage incidents. Each incident will have priority and status to indicate importance of it. Incident can also be updated with comments to indicate progress. afterwards generate the UI. I don't want to deploy it to sap hana, for now only want to test it locally.
3.  **Review & Approve**: AI generates PRD → Review → Approve → Complete implementation

## Conclusion

By integrating Cline with SAP AI Core, you can significantly enhance your development productivity. This powerful combination allows you to leverage state-of-the-art AI models directly within your development environment, streamlining your workflow and enabling you to build innovative applications faster. This project demonstrates the potential of AI-assisted enterprise development while highlighting the importance of proper context, grounding rules, and human oversight in the development process.
