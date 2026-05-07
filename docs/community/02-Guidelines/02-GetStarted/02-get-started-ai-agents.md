---
sidebar_position: 3
slug: /community/get-started-ai-agents
title: Contributing with AI Agents
description: Work with AI (coding) agents to start contributing to SAP Architecture Center.
sidebar_label: AI Agents
keywords:
    - sap
    - ai agents
    - coding agents
    - context file
    - contribution
image: img/ac-soc-med.png
tags:
    - community
    - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
    author: julian-schambeck
    date: 2026-05-05
---

AI (coding) agents have become an integral part of how the community works with the SAP Architecture Center, from writing code that changes the look and feel of the site to putting the final touches on reference architecture content.

The repository comes with an `AGENTS.md` file that provides agents with project context, conventions, and predefined skills located under `.agents/skills`. You can also invoke skills manually as slash commands. With this context loaded, agents respond faster and stay aligned with the project because the answer is either already in the context or the agent knows where to look.

:::info Note
We do not endorse generating reference architecture content from scratch. The topic, main ideas, tradeoffs, and structure are expected to come from you, the contributing expert.
:::

## Setup

Think of `AGENTS.md` as a project README tailored for agents. Many AI agents look for this file by default and load its content into the starting context on every new session.

Other context files in the repository such as `CLAUDE.md` symlink to `AGENTS.md`, and `.claude/skills` symlinks to `.agents/skills`. This makes `AGENTS.md` and `.agents/skills` the single source of truth. If you want to propose changes to the project context, edit `AGENTS.md`. For skills, work in the `.agents/skills` folder.

If you are working with **Claude Code** and want to override the project instructions with your own custom instructions, create a `CLAUDE.local.md` file in the repository root. Claude Code reads it automatically but it is git-ignored, so your personal overrides stay local.

### What to Ask

Here are some things you can do today with the existing agent skills to get started. Ask the agent basic questions to familiarize yourself with the project:

- *I just cloned the repository. What can I do with it?*
- *I saw something about reference architectures. Explain their purpose and the value they add.*
- *What are the concrete steps to make a contribution?*

Once you are ready to contribute, let the agent handle the formalities:

- *I have new content on X in mind. Help me create the files for the new reference architecture.*
- *I want to see what the site looks like with my changes. Show me the rendered version.*
- *My contribution is ready for review. Go through the contribution process and create the PR.*

:::tip Best practice
For creating new reference architectures, [Quick Start](01-get-started-quickstart.md) remains the recommended path since it is purpose-built for that workflow.
:::
