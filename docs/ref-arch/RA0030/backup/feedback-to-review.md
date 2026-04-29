# Architecture Review: Agentic Engineering for SAP

====> REVIEW ON MONDAY - April 27


This session focused on refining a reference architecture for **Agentic Engineering**, specifically targeting SAP BTP extensions and maintaining a "Clean Core" strategy. The discussion moved from a tool-agnostic approach toward a strictly **SAP-native implementation** leveraging the 2026 technology stack.

---

## **Core Architectural Pillars**

The architecture is built on the premise that agentic speed must be balanced with enterprise-grade grounding and deterministic governance.

* **Context Engineering:** Managed via **SAP Build MCP Servers** (CAP, Fiori, UI5) and the **SAP Knowledge Graph** to ensure agents use authoritative, real-time metadata rather than stale training data.
* **The Agent Harness:** Implemented through **SAP Joule** and **Joule Studio**, acting as the central orchestrator for task decomposition and multi-agent coordination via the **Agent-to-Agent (A2A)** protocol.
* **Deterministic Quality Pipeline:** Utilization of **SAP BTP CI/CD** services to enforce linters, security scans, and runtime verification outside of the agent’s reasoning boundary.
* **Unified Model Access:** Centralizing model routing, PII masking, and audit logging through the **SAP Generative AI Hub**.

---

## **Critical Feedback & Refinements**

### **1. Shift to SAP-Native Orchestration**
To fulfill enterprise compliance and architectural consistency, third-party CLI agents (like Claude Code or Cline) are replaced by **SAP Joule Studio**. This transition ensures:
* Full traceability within the **SAP BTP Audit Log**.
* Native integration with **SAP Build Code** and design-time artifacts.
* Secure handling of credentials and "Clean Core" deployment patterns.

### **2. Observability & Telemetry**
A key addition to the architecture is the requirement for **Agent Reasoning Logs**. In multi-agent scenarios, tracking the "thought chain" and tool-calling frequency is essential for debugging logic loops and optimizing token costs.

### **3. Enhanced Human-in-the-Loop (HITL)**
The "Merge Gate" process requires **Explainability Artifacts**. Agents should be mandated to produce a "Change Rationale" that explicitly maps generated code back to the initial Markdown specifications to assist human reviewers in complex multi-agent PRs.

### **4. Skill Registry Governance**
The **Skill Registry** is refined into a federated model within Joule Studio. This allows teams to iterate on "Experimental" skills locally while providing a promotion path to "Enterprise Approved" status for organization-wide distribution.

---

## **Technology Mapping Summary**

| Component | Target Implementation |
| :--- | :--- |
| **Orchestration Harness** | SAP Joule / Joule Studio |
| **Grounding Mechanism** | SAP Build MCP Servers & Knowledge Graph |
| **Governance Layer** | Joule Skill Registry |
| **Validation Gate** | SAP BTP CI/CD (with UI5/CDS Linters) |
| **Model Routing** | SAP AI Core (Generative AI Hub) |
| **Data Context** | SAP Business Data Cloud (Datasphere) |

---

## **Next Steps**
The architecture is well-positioned for the **CodeScale Intel** project. The focus should now shift toward defining the specific **A2A State Handoff Schemas** to ensure seamless coordination between backend service agents and frontend UI agents.

How do you plan to handle the shared design-time state between these specialized agents—will you use a shared Git worktree or a dedicated workspace in SAP Build Code?