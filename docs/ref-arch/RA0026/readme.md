---
id: id-ra0026
slug: /ref-arch/083f2d968e
sidebar_position: 270
sidebar_custom_props:
    category_index: []
title: Embodied AI Agents & Robotics
description: >-
  Embodied AI combines agentic AI with cognitive robots to automate physical world tasks, embedded within the business process context. Leverging robotics and physical AI technologies, this makes end-to-end automation possible across the digital and physical world.
keywords:
  - sap
  - joule
  - embodied AI agents
  - physical AI
  - robotics
  - robots
sidebar_label: Embodied AI Agents & Robotics
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
  - anbazhagan-uma
  - eagle-dai
discussion:
last_update:
  author: adelyafatykhova
  date: 2026-05-11
---

**Embodied AI** combines artificial intelligence with a physical form — such as robots — that can perceive and act in the real world.
**Embodied AI Agents** take the next step: extending the impact of [SAP Business AI](https://www.sap.com/products/artificial-intelligence.html) into physical operations by [combining business-aware AI agents with robots for autonomous task execution](https://news.sap.com/tags/embodied-ai/).
This empowers organizations to adapt more quickly to dynamic operational environments.

:::tip Physical AI vs. Embodied AI vs. Embedded AI
**Physical AI** refers to all forms of artificial intelligence focused on the physical world, including specialized models for perception, navigation, manipulation, and more. [**Embodied AI**](https://news.sap.com/tags/embodied-ai/) leverages physical AI combined with AI agents. [**Embedded AI**](https://www.sap.com/resources/embedded-ai-explained) focuses on digital systems, enabling smarter decisions inside business applications.
:::

## Key Capabilities

Embodied AI enables end-to-end automation of tasks across the physical and digital world.
SAP embeds Embodied AI into the business process, unlike standalone automation approaches, seamlessly incorporating this technology with enterprise software systems.
Embodied AI is one of SAP's [six disruptions](https://www.asug.com/insights/six-disruptions-to-guide-the-next-generation-of-enterprise-software) that will transform how industries operate.

Embodied AI Agents can be equipped to perform tasks such as:

- Sense and interpret physical environment in real time
- Adapt dynamically to errors, delays, or environmental changes
- Act autonomously in accordance with business priorities and operational constraints

This results in business benefits including decreased manual effort, increased human safety, and increased adaptability to changing demands.

## Foundational Building Blocks

These building blocks form the foundation of Embodied AI:

1. **Native Integration into SAP**: this brings business context, data, and processes into physical execution while also ensuring that connected systems are kept updated with the latest real world observations.
2. **Agentic AI**: agentic reasoning and decision-making capabilities can handle the complex, unpredictable nature of the physical world.
3. **Cognitive Robots**: robotics hardware advances across diverse forms, such as quadrupeds, wheeled humanoids, and humanoids, are increasingly capable to do the full motion of physical tasks required in industry.
4. **Physical AI Models**: this includes **vision-language models** (VLMs), **vision-language-action models** (VLAs), **robotic world models**, and **robotics foundation models** (RFMs); **vertical training** refers to the process of teaching models how to perform specialized tasks in specific bodies, which can be used to customize for customer-specific tasks.

:::tip What Robots Does SAP Support?
Embodied AI at SAP is **vendor agnostic**, including robots of all forms.
Since [SAP first announced exploring physical AI in 2025](https://news.sap.com/2025/06/neura-robotics-sap-nvidia-future-of-physical-ai/), it has been [expanding its partner ecosystem](https://news.sap.com/2025/11/sap-physical-ai-partnerships-new-robotics-pilots/).
:::

## Use Cases

Embodied AI is well-suited for tasks involving some degree of **unpredictability**.
This unpredictability can be in the task itself or in the task environment.
A use case can correspond to one or multiple SAP applications.
The following table shows typical use cases across supply chain, logistics, and manufacturing.

| Use Case                    | Associated SAP Software |
| :------------------------------ | :------------------------------ |
| **Warehouse Pick & Place** ([ref](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/2)) | [SAP Extended Warehouse Management (EWM)](https://www.sap.com/products/scm/extended-warehouse-management.html), [SAP Logistics Management (LGM)](https://www.sap.com/products/scm/logistics-management.html) |
| **Asset Inspection** ([ref](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/3)) | [SAP Asset Performance Management (APM)](https://www.sap.com/products/scm/apm.html), [SAP Field Service Management (FSM)](https://www.sap.com/products/scm/field-service-management.html) |
| **Health & Safety Inspection** ([ref](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/4)) | [SAP S/4HANA for EHS workplace safety (EHS)](https://www.sap.com/products/scm/safety-management-software.html) |
| **Quality Inspection** ([ref](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/5)) | [SAP S/4HANA Manufacturing for planning and scheduling (S/4 PP)](https://www.sap.com/products/scm/manufacturing-for-planning-and-scheduling.html) |
| **Material Handling & Assembly**  | [SAP Digital Manufacturing (DM)](https://www.sap.com/products/scm/digital-manufacturing.html) |

Further use case areas include in retail and service environments.
An advantage of native SAP integration is that Embodied AI Agents can multi-task, for example reporting safety incidents via [SAP EHS](https://www.sap.com/products/scm/safety-management-software.html) while doing a warehouse operations task from [SAP EWM](https://www.sap.com/products/scm/extended-warehouse-management.html).


:::info
Embodied AI does **not** replace traditional robotics and manufacturing automation such as Autonomous Mobile Robots (AMRs), which are a good fit for predictable, repetitive tasks.
Instead, it complements these to be able to automate what was "not-automatable" and achieve end-to-end autonomous enterprise.
:::


## Architecture

SAP brings applications, agents, and data together to contextualize, reason, and act in the physical world.
The Embodied AI architecture is designed for [extensibility](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/1) and forms the backbone of delivering all Embodied AI use cases.

![drawio](drawio/reference-architecture-overview.drawio)

## Key Components

The Embodied AI architecture involves the following components.

:::tip Curious about Extensibility?
Check out the [reference architecture](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/1) to discover how partner technologies and custom agents can be incorporated into the system landscape.
:::

- ### SAP Business Technology Platform (BTP)

  [BTP](https://learning.sap.com/products/business-technology-platform) is SAP's comprehensive platform for building, deploying and running applications and AI agents. On BTP, [SAP AI Foundation](https://www.sap.com/products/artificial-intelligence/ai-foundation-os.html) delivers services, models and infrastructure for intelligent agent development — from foundation model access and orchestration to enterprise data integration and secure connectivity.
  [BTP-based event-driven architectures](https://architecture.learning.sap.com/docs/ref-arch/fbdc46aaae) can be used to trigger Embodied AI capabilities.

- ### Applications and Agents
  
  This can be one or multiple components depending on the use case.
  This includes **applications**, **assistants**, and **agents**.
  For example, the [asset inspection](https://architecture.learning.sap.com/docs/ref-arch/083f2d968e/3) use case is associated with [SAP Asset Performance Management (APM)](https://www.sap.com/products/scm/apm.html) and [SAP Field Service Management (FSM)](https://www.sap.com/products/scm/field-service-management.html).
  Agents across the supply chain, such as [those announced at Hannover Messe 2026](https://news.sap.com/2026/04/sap-at-hannover-messe-2026-agentic-ai-resilient-manufacturing/), can also benefit from autonomous execution by robots.

- ### SAP Joule, AI Agents, and Joule Studio

  [Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html) provides a conversational interface into [AI agents](https://www.sap.com/products/artificial-intelligence/ai-agents.html) and Embodied AI capabilities.
  Custom AI agents can be created via [Joule Studio](https://architecture.learning.sap.com/docs/ref-arch/06ff6062dc/3) and connected in multi-agent systems together with Embodied AI Agents.

- ### Partner Technologies

  SAP works with a [diverse ecosystem of partners](https://news.sap.com/2025/11/sap-physical-ai-partnerships-new-robotics-pilots/) including **hardware providers**, **system integrators**, specialized **software partners**, and **AI model providers** to deliver an end-to-end solution.
  Partners are responsible for aspects including physical movements, sensory functions, and hardware.
  In contrast, SAP's focus is on the business significance of observations and determining the appropriate business-driven response.

- ### Embodied AI on BTP

  This is a **reuse service** responsible for bridging the physical and digital world, based on BTP and [IAS](https://pages.community.sap.com/topics/cloud-identity-services/).
  It acts as a **vendor-agnostic** intelligent gateway between SAP business applications, business AI agents, and partner technologies — bringing together all of the above components.

  :::info Embodied AI Availability
  The Embodied AI on BTP service is currently only indirectly available within SAP-managed BTP accounts.
  Are you a customer or partner interested in trying it out? [Get in touch with SAP to discuss](https://url.sap/embodied-ai).
  :::


## Examples in an SAP Context

- [SAP Expands Physical AI Partnerships and Demonstrates Success of New Robotics Pilots](https://news.sap.com/2025/11/sap-physical-ai-partnerships-new-robotics-pilots/)
- [BITZER Helps SAP Pioneer Project Embodied AI](https://news.sap.com/2026/01/bitzer-sap-pioneer-project-embodied-ai/)
- [Martur Fompak wins Innovation Award](https://www.sap.com/discover/sap-innovation-awards/index.html?pdf-asset=b8f5f23c-437f-0010-bca6-c68f7e60039b&page=1)
- [How Swiss Robotics Company ANYbotics and SAP Are Turning Dirty, Dusty, and Dangerous Industrial Inspections into Business Insights](https://architecture.learning.sap.com/news/2026/03/30/anybotics-industrial-inspections-into-business-insights)
- [Accenture, Vodafone Procure & Connect and SAP Pilot Humanoid Robotics in Warehouse Operations](https://newsroom.accenture.com/news/2026/accenture-vodafone-procure-connect-and-sap-pilot-humanoid-robotics-in-warehouse-operations)
- [How SAP and NVIDIA Advance AI for Enterprise Transformation](https://news.sap.com/2026/03/how-sap-nvidia-advance-ai-enterprise-transformation/)
- [Live AI Use Cases Show How SAP Delivers Trusted Orchestration and Smarter Execution for Manufacturing and Supply Chain Management](https://news.sap.com/2026/04/hannover-messe-live-ai-use-cases-manufacturing-scm/)
- [From Digital Intelligence to Real-World Action: How SAP, NEURA Robotics, and NVIDIA Are Powering the Future of Physical AI](https://news.sap.com/2025/06/neura-robotics-sap-nvidia-future-of-physical-ai/)
- [Customer Spotlight: How Sartorius is Scaling Physical AI | SAP TechEd 2025](https://www.youtube.com/watch?v=OYBmVb0m4sU&feature=youtu.be)

## Resources

- [What is embedded AI?](https://www.sap.com/resources/embedded-ai-explained)
- [SAP Open Source Report 2025](https://d.dam.sap.com/a/CRdeMdL/SAP_Open_Source_Report_2025.pdf?rc=10&inline=true&doi=SAP1270985)
- [Demo: Physical AI | Business Processes & Robots | SAP TechEd 2025](https://www.youtube.com/watch?v=4ZzpFQZOh_I)
- :loudspeaker: Want to try out Embodied AI? [Contact SAP](https://url.sap/embodied-ai) for your options.


