---
id: 2ecb7e
slug: /ref-arch/2ecb7e
sidebar_position: 150
title: HANA AI Toolkit - Local MCP Server
description: Local MCP Server for Generative AI Toolkit for SAP HANA Cloud
keywords:
  - sap
  - hana
  - hana-ai
  - hana-ml
  - mcp
  - model context protocol
  - ai agents
  - generative ai
sidebar_label: HANA AI Toolkit - Local MCP Server
image: img/ac-soc-med.png
tags:
  - agents
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - raymondyao
discussion: 
last_update:
  author: raymondyao
  date: 2026-06-15
---

The **HANAMLToolkit local MCP server** is a Model Context Protocol (MCP) endpoint that turns the [hana-ml](https://pypi.org/project/hana-ml/) Python library into a set of governed tools that AI agents — Joule, Claude Desktop, IDE-side copilots, custom LangChain/LangGraph agents — can invoke against an SAP HANA Cloud instance. The server is shipped as part of the [hana-ai](https://pypi.org/project/hana-ai/) toolkit, runs in-process next to the agent or as a sidecar, and exposes the same tool catalog over three interchangeable transports: **stdio**, **SSE**, and **streamable HTTP**.

The architecture is opinionated about one thing in particular: every tool invocation must be attributable end-to-end. An audit module projects MCP-side identity (agent, model, session, tool, redacted arguments) into the HANA connection that the tool is about to use, so DBAs and auditors can correlate MCP-side events with HANA-side audit and `M_SESSION_CONTEXT` records.

## Top-level Component View

![drawio](drawio/diagram-UerktXkmCe.drawio)

Key properties:

- **One toolkit, three transports.** stdio and SSE share one MCP server library; HTTP uses a different one with first-class HTTP middleware. The same toolkit dispatches by transport, so tools, schemas, and audit behavior are identical from a client's perspective.
- **Background-thread server.** The MCP server runs in a daemon thread; multiple servers can coexist in the same process and be stopped individually.
- **Hot-swappable HANA connection.** Built-in admin tools replace the underlying `ConnectionContext` without restarting the server; every registered tool picks up the new connection on its next call.
- **Audit is mandatory, not optional.** Before any tool's SQL or PAL runs, the audit module writes identity onto the same HANA connection the tool is about to use. If that pre-execution write fails, the tool call is failed deliberately — there is no untraced path.

The HTTP transport is the recommended choice for any deployment where the agent runs out of process or in a different container; stdio remains the default for desktop IDE integrations and unit tests.

## Tool Invocation Flow

![drawio](drawio/diagram-T3gm4bQtUx.drawio)

Each tool call follows the same three-phase shape regardless of transport. A best-effort **bootstrap** write attaches session-level identity to the HANA connection when the client first connects. A strict **pre-tool** write attaches per-call identity (session, invocation, tool, redacted arguments) immediately before the tool issues SQL or PAL — its failure aborts the call. A best-effort **post-tool** write closes the lifecycle with status, duration, and output metadata once the tool returns.

Because the SET statements ride on the exact connection the tool then uses, any HANA audit policy or query against `M_SESSION_CONTEXT` joins cleanly back to the MCP-side event stream — no out-of-band correlation table required.

## Operational Considerations

- **Process model.** The MCP server runs in a daemon thread inside the agent process. Lifetime is bounded by the host process; for long-running deployments, prefer the HTTP transport inside a supervised container (systemd, Kubernetes, etc.).
- **Hot connection swap.** Built-in admin tools replace the underlying HANA connection without bouncing the server.
- **Trusted-proxy chain.** When deployed behind a reverse proxy or load balancer, configure the trusted-proxy settings so the recorded client IP is resolved correctly from `Forwarded` / `X-Forwarded-For`.
- **Stop semantics.** A graceful stop is attempted first; a forced stop falls back to event-based termination flags and always cleans up the registry, because the HTTP transport may spawn a worker that outlives the calling thread.

## About hana-ai

The local MCP server documented here ships inside [hana-ai](https://pypi.org/project/hana-ai/), the **Generative AI Toolkit for SAP HANA Cloud**. hana-ai is the agent-facing companion to [hana-ml](https://pypi.org/project/hana-ml/): where hana-ml gives Python developers programmatic access to HANA's in-database machine learning (PAL, APL) and vector engine, hana-ai wraps those capabilities into tool catalogs, smart dataframe agents, and LangChain/LangGraph-compatible building blocks that LLM-driven agents can drive directly.

The package is published on PyPI and installable with `pip install hana-ai`. Its surface area includes:

- **Tool catalogs** over hana-ml — data fetching, statistical exploration, time-series and classification workflows, model storage management — exposed both as plain Python callables and as MCP tools.
- **Smart dataframe agents** that let a model reason over a HANA table using natural language without leaving the database.
- **Vector-engine helpers** that integrate HANA Cloud's native vector store into retrieval-augmented generation flows.
- **The local MCP server** described in this architecture, which is the recommended way to expose hana-ai tools to external agents (Joule, Claude Desktop, IDE copilots, custom LangChain/LangGraph agents) with end-to-end attribution into HANA.

## Related Readings

- [Agent & Tool Interoperability](../RA0029/1-a2a-and-mcp/readme.md) — MCP / A2A protocol context
- [Third-Party MCP Access to SAP Solutions](../RA0029/10-third-party-mcp-access/readme.md) — governed third-party MCP access
- [hana-ai on PyPI](https://pypi.org/project/hana-ai/) — the package that ships this server
- [hana-ml on PyPI](https://pypi.org/project/hana-ml/) — the underlying Python client for SAP HANA Cloud
- [Model Context Protocol specification](https://modelcontextprotocol.io/) — upstream protocol
