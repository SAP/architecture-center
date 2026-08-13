---
id: id-ra0032
slug: /ref-arch/N30_Hfa3
sidebar_position: 32
title: 'EWM/TM Queue Error log'
description: 'This is a default description.'
keywords: 
  - genai
  - build
sidebar_label: 'EWM/TM Queue Error log'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - genai
  - build
contributors: 
  - innovationteam3227-hue
last_update:
  date: 2026-08-13
  author: innovationteam3227-hue
---

COMPONENTS:

1. End User - Interacts via SAP Build Process Automation (Joule agent chat interface)
2. 2. SAP Build Process Automation / Joule Agent - Hosted on BTP - Communicates with the MCP server via a BTP Destination (Basic Auth, Internet) - Destination name: qrfc-mcp-server-prod
3. 3. MCP Server (CF App: qrfc-mcp-server-prod) - Python application deployed on SAP BTP Cloud Foundry - Exposes MCP tools: get_ewm_tm_integration_errors, categorize_errors, get_error_recommendations, analyze_historical_patterns - Has two outbound connections:
4. 3a. SAP AI Core (Document Grounding + Orchestration) - Connects via BTP Destination Service (OAuth2, Internet) - Destination name: aicore - Uses orchestration deployment with GPT-4o-mini - Retrieves grounding context from a vector document collection - Returns error categorization and resolution guidance
5. 3b. SAP S/4HANA Backend - Connects via BTP Destination Service + Cloud Connector (OnPremise) - Destination name: S4_JOULE_LOG - Calls OData service: ZAPI_EWM_TM_INTEGRATION_ERROR_SRV / FREIGHT_ORDER entity set - Returns EWM/TM LDAP integration errors (freight order failures)
6. SUPPORTING BTP SERVICES: - BTP Destination Service (manages all three destinations) - BTP Connectivity Service (proxies on-premise calls through Cloud Connector) - Cloud Connector (bridges BTP to on-premise S/4HANA)
7. FLOW: End User → Joule Agent → MCP Server → (S/4HANA for error data) + (AI Core for categorization/recommendations) → Response back to End User
8. STYLE: Clean, professional, left-to-right flow. Use SAP-style iconography for every sap component. Use the sap annotations and interfaces from draw io. Group BTP components inside a BTP boundary box. Show Cloud Connector as a bridge between BTP and on-premise.

