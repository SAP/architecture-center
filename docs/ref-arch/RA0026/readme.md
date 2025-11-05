---
id: id-ra0026
slug: /ref-arch/083f2d968e
sidebar_position: 26
sidebar_custom_props: 
    category_index: []
title: Embodied AI Agents
description: >-
  Embodied AI agents extend digital workflows into the physical world, enabling
  cognitive robots to adapt to changing business needs. SAP's vendor-agnostic
  approach leverages business semantics, contextual reasoning, and multi-agent
  interoperability, with Joule as the robotics interface.
keywords:
  - sap
  - joule
  - embodied AI agents
  - physical AI
  - robotics
  - robots
sidebar_label: Embodied AI Agents
image: img/ac-soc-med.png
tags:
  - genai
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - adelyafatykhova
  - niklasweidenfeller
  - AjitKP91
  - pra1veenk
discussion: 
last_update:
  author: AjitKP91
  date: 2025-11-04
---

**Embodied AI** combines artificial intelligence with a physical form — such as robots — that can perceive and act in the real world.
Embodied AI agents take the next step: extending the impact of SAP Business AI into physical operations by making robots cognitive. This empowers enterprises to faster adapt to changing operational environments.

## Reference Architecture

![drawio](drawio/reference-architecture-basic.drawio)

:::tip Joule    
Joule is the one AI copilot for the SAP ecosystem, providing a consistent user experience across SAP applications. It integrates natively with your SAP landscape, enabling employees to interact with systems through natural language to perform tasks, retrieve data, and generate insights. Joule leverages deep access to SAP functionality and business context to streamline work and enhance productivity. It provides secure, role-based insights grounded in your enterprise data, ensuring compliance with SAP governance and AI ethics principles. Joule keeps humans in control while driving efficiency, data-driven decisions, and continuous business transformation.      
:::

## Key Components

The Embodied AI Agents architecture consists of following key components:

-   ### AI Foundation
    The AI Foundation is the AI operating system to build, run, and integrate custom AI agents and advanced AI solutions at scale, all through a single, unified entry point. Joule Agents are autonomous, context-aware AI agents embedded within the SAP Business Suite. They are designed to operate across business functions, connecting data, decisions, and actions to streamline workflows and automate end-to-end processes. Leveraging the SAP Knowledge Graph, SAP Business Data Cloud, and the SAP application portfolio (On-Premise, Cloud), Joule Agents enable intelligent orchestration of business activities through deep understanding of enterprise data and process context. Their ability to collaborate with users and other agents allows them to reason, act, and adapt within complex business environments—enhancing operational efficiency, decision accuracy, and organizational agility.
    SAP AI Core provides integrated access to SAP- and non-SAP AI models, such as foundation models, but also use case specifc, custom-trained models.


-   ### Joule Agents
    In the provided reference architecture, Joule Agents serve as the cognitive layer that bridges autonomous physical systems with SAP's business applications, providing real-time context and decision-making capabilities.
    With Joule Studio, users can create, deploy, monitor, and manage custom agents and skills for Joule, with drag and drop simplicity. The low-code, no-code experience dramatically accelerates the deployment of these capabilities, which extends Joule’s value and optimizes business workflows.

-   ### Embodied AI Agents 
    SAP Embodied AI Agents are intelligent systems which integrate directly with physical devices operating in real-world environments. They serve as cognitive cores that understand business context as well as physical environment observations and execute autonomous actions aligned with enterprise priorities. These agents can be deployed across various roles such as replenishment, visual inspection, retail compliance, and customer fulfilment etc.

    Embodied AI Agents can be equipped to perform tasks such as: 
    -   Sense and interpret physical environment in real time
    -   Adapt dynamically to errors, delays, or environmental changes
    -   Act autonomously in accordance with business priorities and operational constraints

    **Division of Responsibilities**: Physical device providers (e.g., robots, drones, autonomous vehicles) are responsible for the device's physical movements and sensory functions. SAP Embodied AI Agents, on the other hand, focus on determining the business significance of observations and selecting the appropriate business-driven responses.

    **Deployment Considerations**:
    The implementation or deployment of Embodied AI Agents depends on the capabilities and limitations of the underlying physical device and platform — such as latency, network connectivity, and edge computing capacity etc.

-   ### Embodied AI layer
    The Embodied AI layer acts as the central nervous system for enterprise autonomous physical systems, providing reusable services to standardize and manage the interaction between autonomous physical systems and SAP's digital business core, ensuring intelligent, safe, and business-aligned operation.
    Key to this layer is spatial knowledge, which provides cognitive robts with relevant execution context. Location & Spatial Data Management component, which provides autonomous systems with digestible, standardized physical-world information through reusable services such as a cross-vendor waypoint/POI annotation system and physical-world map integration, ensuring location data interoperability and a common understanding across different Lines of Business (LoBs) applications.
    The foundation enables cognitive learning, along with evaluation and explainability, all happening in the context of business tasks. Crucially, it is aware of business priorities, as well as behavioral guidelines and safety rules, ensuring that autonomous systems operate in full compliance with enterprise standards.
    SAP Integration Suite ensures standardised, easy to configure connectivity to various vendors of cognitive robots, such as humanoids, quadrupeds and drones.

## Resources
-   [Joule - AI copilot](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)
-   [Joule Agents](https://www.sap.com/products/artificial-intelligence/ai-agents.html)
-   [Joule Studio, agent builder](https://discovery-center.cloud.sap/ai-feature/c95490eb-95c3-4b0a-b9ea-08144355d482/)

