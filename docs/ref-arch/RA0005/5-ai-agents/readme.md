---
id: id-ra0005-5
slug: /ref-arch/5c9255f84a/5
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: AI Agents & Business Agent Foundation (BAF)
description: Please add a description (max 300 characters)
keywords:
  - sap
sidebar_label: AI Agents & Business Agent Foundation (BAF)
image: img/logo.svg
tags:
  - ref-arch
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors: 
discussion: 
last_update:
  author: vedant-aero-ml
  date: 2025-01-01
---

<em>![Work In Progress](../../../images/wip1.svg)</em>

Agents are autonomous systems powered by Large Language Models (LLMs) that perform tasks independently without continuous human input. These agents can analyze information, make decisions, and interact with systems, APIs, or other agents to accomplish complex tasks. By leveraging the reasoning and decision-making capabilities of LLMs, agents take a step beyond passive prompt responses, enabling dynamic task execution in layered workflows. Unlike Retrieval Augmented Generation (RAG), which follows a linear process, agents utilize iterative reasoning, refining their approach through intermediate outputs to solve complex, non-linear tasks. In data-intensive business environments, agents excel at efficiently querying, analyzing, and processing intricate interrelationships, leveraging their advanced reasoning capabilities.

## Project Agent Builder

*Project Agent Builder (PAB)* is SAP’s centralized platform for creating, managing, and consuming intelligent AI agents as reusable services on SAP BTP. It eliminates the need for custom agent runtimes by enabling no-code, configuration-based creation of LLM-powered agents. These agents support multi-step reasoning, tool orchestration, and RAG, with seamless integration into SAP products, BTP services, and third-party applications via REST or OData APIs. The platform leverages SAP AI Core for LLM access, anonymization, and metering, and ensures enterprise-grade security by acting on behalf of users with inherited roles. Built on LangChain, it combines open-source innovation with custom enterprise tools and flows. With a marketplace-driven approach for extensibility and deep integration with SAP Joule, Project Agent Builder lays the foundation for scalable & secure agent-based automation across the SAP ecosystem.

## PAB Streams

Project Agent Builder is architected around two primary streams that cater to distinct use cases and integration requirements: *Content Based Agents* and *Code Based Agents*.

**Content Based Agents**

*<solution diagram>*

Content Based Agents utilize structured business content and pre-defined semantic rules to drive agent behavior. They integrate off-the-shelf tools and capabilities to perform multi-step reasoning and dynamic decision-making with minimal custom coding. This approach enables quick configuration and seamless integration of business data into automated workflows.

**Code Based Agents**

*<solution diagram>*

Code Based Agents offer a highly customizable solution through bespoke logic and tailored development. They leverage developer-defined workflows on frameworks like LangGraph, AutoGen, CrewAI & smolagents to provide fine-grained control over agent operations. This model is ideal for scenarios that demand precise, code-level intervention to meet complex business requirements.