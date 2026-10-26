---
id: id-nsa-2
sidebar_position: 2
slug: /ai-native-north-star-architecture/vision
sidebar_custom_props:
    category_index: []
title: AI-native North Star architecture - Vision
description: "The vision for SAP's AI-native North Star architecture: four layers - User Experience, Process, Foundation, and Platform - forming a system of context."
keywords:
    - ai-native north star architecture
    - system of context
    - sap joule
    - sap knowledge graph
    - sap business data cloud
    - sap autonomous suite
    - agentic process execution
    - semantic grounding
    - data flywheel
    - intent-driven execution
    - enterprise agents
    - sap
    - business ai platform
sidebar_label: 2. Vision
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/executive-summary/id-nsa-1
pagination_next: north-star-arch/ai-native-northstar-arch/user-experience-layer/id-nsa-3
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-23
---

The AI-native architecture from SAP rests on three simple premises:
- Models that reason are the baseline.
- Context, which grounds AI in business data and semantics, is what makes reasoning and its results relevant to the business.
- Agents and Assistants that plan, act, and learn turn this into outcomes.

The four architectural layers that make up the AI-native North Star architecture from SAP deliver all three.

![AI-native North Star architecture](images/vision-nsa.png)

The four layers are as follows:

- The **user experience layer** evolves from static to adaptive. Joule becomes the central engagement layer across the SAP Autonomous Suite, shifting interaction from app navigation to intent-driven execution: instead of navigating across several applications, a user states the goal, such as resolving a customer's disputed invoice, and Joule carries out the steps across applications, in whichever channel the user is working in. Interfaces become contextual, multimodal, and generative.
- The **process layer** evolves from predefined to agentic. The business logic, rules, and data that applications have traditionally embodied become capabilities that agents plan and execute across SAP, partner, and third-party systems, with every call routed through a governed gateway. A unified design-time environment supports building both applications and agents from business intent to production.
- The **foundation layer** evolves from a system of record to a system of context. SAP Business Data Cloud provides governed data, SAP Knowledge Graph links it to business meaning, and decision traces record why past decisions were made. That connected context is what turns data into enterprise intelligence: agents can reason about why things happen, not only what happened.
- The **platform layer** evolves from hosting applications to running SAP-managed enterprise agents integrated across the customer landscape. The platform provides runtime, sandbox, observability, and governance to build and operate reliable enterprise agents on top of stateless AI models. Agent lifecycle, identity, routing, and integration are built into the platform.

<div className="nsa-float-image" style={{ width: '35%', maxWidth: '300px', margin: '0 auto' }}>
![Data Flywheel](images/data-flywheel.png)
</div>

<div style={{ clear: 'both' }}></div>

### How each layer plays a distinct role in the system of context

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '45%', maxWidth: '500px' }}>

![layers](images/layers.png)

</div>

<p style={{ textAlign: 'left' }}>
<ul>
<li> The <b>experience layer</b> generates context from each user interaction.</li>
<li> The <b>process layer</b> extends it across the landscape by connecting applications, APIs, events, and business capabilities, allowing agents to reason across them.</li>
<li> The <b>foundation layer</b> stores and compounds this into institutional knowledge.</li>
<li> The <b>platform layer</b> runs and protects it at enterprise scale. Trust governs how this context flows across all four layers.</li>
</ul>
</p>

<div style={{ clear: 'both' }}></div>

### How users experience it

The four layers work together in each user interaction. Users switch between applications to verify data, follow up on issues, and complete processes. With an AI-native architecture, this becomes a connected, outcome-first flow in which the system not only identifies issues but also resolves them within defined business policies.

As an example, a finance analyst asks Joule to "resolve high-value disputes likely to delay payment and minimize impact on days' sales outstanding (DSO)." Joule routes the request to an agent that spans sales, ERP, and service management, with the authority to analyze, decide, and execute resolution workflows within governed boundaries.

The agent queries SAP Knowledge Graph to discover the right APIs and data products, retrieves disputes across applications that previously lacked a shared access layer, and draws on decision traces from past resolutions: which escalation paths worked, which settlement patterns reduced DSO, and which customers responded to which approaches. The agent identifies high-risk disputes, selects optimal resolution strategies based on historical outcomes, executes follow-ups such as customer communication and internal escalations, and initiates resolution workflows. Only exceptions or policy-bound decisions are routed for human approval. As disputes are resolved, payment commitments are secured and tracked through to completion, helping ensure closure rather than partial progress.

The results are a measurable reduction in DSO, faster dispute-resolution cycles, and higher recovery rates, with most cases resolved without manual intervention. The next time a similar dispute arises, the agent’s resolution strategies improve because it learned from this one. This is the system of context in action: SAP Knowledge Graph provides semantic grounding, decision traces from past resolutions inform execution, and each completed resolution feeds back as a verified outcome signal.

![UX Layer](images/ux-layer.png)

The example above touched every layer of the architecture. The following sections examine each one.