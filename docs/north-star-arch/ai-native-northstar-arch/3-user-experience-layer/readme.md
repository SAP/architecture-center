---
id: id-nsa-3
sidebar_position: 3
slug: /ai-native-north-star-architecture/user-experience-layer
sidebar_custom_props:
    category_index: []
title: AI-native User Experience Layer with Joule Work
description: "The AI-native User Experience Layer shifts users from navigating apps to stating intent, as Joule Work unifies generative, voice, and multimodal experiences."
keywords:
    - user experience layer
    - joule work
    - sap joule
    - generative ui
    - multimodal interaction
    - voice ai
    - physical ai
    - sap analytics cloud
    - sap signavio
    - sap leanix
    - walkme
    - ai-native north star architecture
    - sap
    - business ai platform
sidebar_label: 3. User Experience Layer
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/ai-native-nsa-vision/id-nsa-2
pagination_next: north-star-arch/ai-native-northstar-arch/process-layer/id-nsa-4
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-23
---

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '30%', maxWidth: '320px' }}>

![executive-summary](images/ux-layer-ai-native.png)

</div>

<p style={{ textAlign: 'left' }}>

Today, users navigate between applications, follow predefined workflows, and manually piece together information across systems to get work done. AI-native experiences are assembled dynamically, surfacing relevant information and actions specific to each user’s intent, context, and goals, rather than being statically designed and delivered to serve the majority.

This requires a fundamental shift in how we design and deliver the user experience. Users will no longer navigate to applications but simply state intent, and the system assembles the experience around them. 
</p>

<div style={{ clear: 'both' }}></div>

**The UX layer brings together three tiers:**

<div className="nsa-float-image" style={{ float: 'left', marginRight: '20px', width: '45%', maxWidth: '500px' }}>

![user-exp-layer](images/user-exp-layer.png)

</div>

<p style={{ textAlign: 'left' }}>

The **Design Layer** is the Compositional Design System — the foundational layer that enables the capabilities of the other experience layers. It is built from two parts: (1) an agent and services — including intent analysis, planning, component selection, generation, and rendering — and (2) a catalogue of assets. The catalogue contains composites: flexible, scalable components made up of primitives, such as buttons, text, boxes, and circles. The catalogue further includes design knowledge: guidance on how composites can be modified and in what contexts they should be used, alongside general design knowledge encoding the enterprise qualities SAP delivers at scale — accessibility, product standards, globalisation, and compliance — together with institutional design best practices built throughout the system.

The **Intelligence Layer** makes experiences context-aware and trustworthy. It powers conversation, voice, and multimodal interaction — letting users express intent naturally across any modality. It also defines how users stay in control: through transparency, agency, and privacy boundaries that make AI assistance feel safe and predictable rather than opaque.

**Joule Work** unifies these layers into a single entry point that interprets user intent, surfaces the right insights, automates routine work, and coordinates AI agents and workflows across the enterprise — enabling people to focus on the decisions that move the business forward, within guardrails they control.

</p>

<div style={{ clear: 'both' }}></div>

Joule Work extends across multiple modalities — desktop, web, mobile, CarPlay, and more — with transparency and privacy by design. Voice AI makes applications as natural as having a conversation. Physical AI also extends Joule into robotics and smart glasses.

Joule Work structures these experiences into five experience modes, each serving a particular intent and purpose for users:

**Conversations** is where users express intent and explore outcomes through continuous dialogue across SAP.
- **Discover** surfaces AI-prioritized tasks, alerts, and opportunities from across connected systems so users can act directly, continue in a Conversation, or open a Space.
- **Spaces** are dynamic workspaces assembled on the fly, bringing together the right data, tools, and context for a specific goal.
- **Jobs** for making agentic work traceable for the business user, automating routine tasks within defined guardrails and escalating to humans for key decisions or missing information.
- **Develop** gives builders the tools to create and deploy agentic solutions using Joule Studio's AI-first development environment, connecting them to SAP's business context, data, and interfaces to build solutions grounded in real business processes.

![Experience Modes](images/experience-modes.png)

Joule Work is delivered as a service managed by SAP. This enables continuous improvement of the experience, delivering innovation without additional effort for customers. Embedded insights from the SAP Analytics Cloud solution bring real-time visibility.

When results carry semantic information — measures, dimensions, and visualization hints — the design layer determines how to present them. The same semantic specification renders through native components on web, desktop, and mobile. Together, these capabilities create experiences that explain what happened and why it matters, then recommend the next action, helping users move smoothly from data to decision.

This NorthStar applies to agentic and AI-native interaction patterns. It complements, not replaces, SAP application experiences.

While the experience layer allows users to articulate their needs, translating those intentions into tangible business outcomes demands a sophisticated orchestration of applications, intelligent agents, and interconnected business logic, which is the role of the process layer.
