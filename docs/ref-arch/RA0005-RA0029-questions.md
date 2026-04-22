# 20 Questions & Answers: RA0005 (Generative AI on SAP BTP) & RA0029 (Agentic AI & AI Agents)

## RA0005 – Generative AI on SAP BTP (Questions 1–10)

### Q1: What is the role of the SAP Cloud Application Programming Model (CAP) in the Generative AI reference architecture on SAP BTP?

**A:** CAP serves as the central hub for application and domain logic. It interacts with SAP solutions (Cloud or On-Premise), third-party applications, and manages data sources such as SAP HANA Cloud. Within CAP, various plugins (e.g., CAP LLM Plugin) and SDKs (SAP Cloud SDK for AI, LangChain) can be utilized to support the development of Generative AI solutions.

---

### Q2: What is the Generative AI Hub and what key capability does its Orchestration feature provide?

**A:** The Generative AI Hub is the central access point to Foundation Models and LLMs within SAP AI Core. Its Orchestration feature combines content generation via a Harmonized API with essential business AI functions including Grounding (integrating external domain-specific data), Templating (composing prompts with placeholders), Translation, Data Masking (anonymization/pseudonymization), and Content Filtering—all executable in a single API call pipeline.

---

### Q3: What is the Vector Engine in SAP HANA Cloud and what are its key benefits?

**A:** The Vector Engine manages unstructured data (text, images) in high-dimensional embeddings, enabling Retrieval Augmented Generation (RAG) by combining LLMs with private business data. Key benefits include: multi-model support (unifying relational, graph, spatial, JSON, and vector data in a single database), enhanced semantic/similarity search, personalized recommendations, and optimized LLM output with contextual data.

---

### Q4: How does basic prompting work in the Generative AI reference architecture?

**A:** In the basic prompting architecture, CAP serves as the central point for managing application logic and sending prompts—either through integrated prompt templates or via a UI like SAPUI5. CAP connects to the Generative AI Hub via SAP AI Core's AI API. SDKs such as SAP Cloud SDK for AI, LangChain, and CAP LLM Plugin streamline interactions. The Orchestration Service provides a harmonized API for content generation with features like prompt templating and content filtering.

---

### Q5: What are embeddings and how do they enable semantic search on SAP BTP?

**A:** Embeddings are dense numeric representations of data that capture the underlying meaning of words or concepts. Using Embedding Models, textual data is transformed into vector representations stored in SAP HANA Cloud's Vector Engine. This enables fast similarity searches using methods like cosine similarity, providing semantic search functionality where results are based on meaning rather than exact keyword matches.

---

### Q6: What is Retrieval Augmented Generation (RAG) and what are its main steps?

**A:** RAG is a neural architecture that extends LLMs by integrating retrieval mechanisms to access external data. The three main steps are: (1) **Question Encoding** – the user's query is transformed into an embedding, (2) **Document Retrieval** – the embedding is used to search pre-embedded documents via the Vector Engine using similarity search, and (3) **Response Generation** – the retrieved documents and original question are fed into the LLM to generate a grounded response.

---

### Q7: How does Multi-modal RAG differ from standard RAG?

**A:** Multi-modal RAG handles documents containing both text and images. During the design phase, images are extracted from documents, described by an LLM, and replaced with their descriptions plus image references. At runtime, relevant chunks are retrieved via similarity search, and both original text and base64-encoded images are provided to the LLM. When images exceed model limits, image descriptions are substituted for actual image data.

---

### Q8: What is the Knowledge Graph Engine in SAP HANA Cloud and how does it complement the Vector Engine?

**A:** The Knowledge Graph Engine provides advanced capabilities for managing semantically connected relationships using RDF (Resource Description Framework) and triplestore with SPARQL execution. It supports SQL and SPARQL interoperability for complex queries. It complements the Vector Engine by connecting corporate knowledge for powering LLMs and generative AI, improving decision-making through logical inference, and enabling deeper data understanding through structured, connected data.

---

### Q9: What are the five core components of an AI Agent in the SAP context?

**A:** The five core components are: (1) **LLM (Reasoning Engine)** – processes inputs, plans steps, and generates outputs; (2) **Knowledge** – contextual information from structured/unstructured sources; (3) **Memory (State)** – retains intermediate results and past interactions for continuity; (4) **Tools** – enable the agent to perform actions based on context and goals; (5) **Recipe (Orchestration Logic)** – guides the workflow defining how all components interact.

---

### Q10: What is SAP AI Core's Grounding Service and what two options does it provide for RAG data?

**A:** The Grounding Service is a module within SAP's Orchestration Workflow that provides specialized data retrieval for RAG. It offers two options: (1) **Upload documents to a supported repository and run the Data Pipeline** – documents are automatically fetched, chunked, embedded, and stored in the Vector Engine; (2) **Provide chunks directly via the Vector API** – users upload pre-chunked documents to the Vector Engine directly. Users then use the Retrieval API to search and retrieve relevant chunks.

---

## RA0029 – Agentic AI & AI Agents (Questions 11–20)

### Q11: What is the central role of Joule in the Agentic AI architecture?

**A:** Joule serves as the central AI copilot providing a unified user interface and orchestration. It routes requests to agents and skills, manages conversations, and enables bidirectional A2A (Agent-to-Agent) communication—through the Agent Gateway for inbound integration and Joule Capabilities for outbound integration.

---

### Q12: What are the two development approaches SAP supports for building AI agents, and when should each be used?

**A:** SAP supports **Low-Code** (via Joule Studio) and **Pro-Code** (via SAP Cloud SDK for AI) approaches. Low-code agents should be the default for most scenarios—they're ideal for rapid development of well-defined business processes using configuration rather than coding. Pro-code agents are for complex scenarios requiring fine-grained control, advanced customization, bespoke integrations, or use of specific frameworks like LangGraph, AG2, CrewAI, or Smolagents.

---

### Q13: What are the Agent2Agent (A2A) and Model Context Protocol (MCP), and how do they differ?

**A:** **A2A** is an open standard for communication and collaboration between autonomous AI agents—enabling task delegation, capability discovery, and multi-agent workflows. **MCP** is an open standard defining how AI models and agents discover and interact with external tools and their context, acting as a universal adapter. A2A is for agent-to-agent interoperability (external), while MCP is used internally for semantic tool connectivity between agents and tools/APIs.

---

### Q14: How does the Agent Gateway enable external consumption of Joule Agents?

**A:** The Agent Gateway is a secure, publicly accessible endpoint that exposes Joule Agents via the A2A 0.3.0 protocol with HTTP+JSON transport. External clients authenticate using SAP Cloud Identity Services (IAS) App2App tokens with named user context, invoke a specific Joule Scenario by providing capability and scenario identifiers, and receive responses either synchronously or asynchronously via callback URLs for long-running tasks.

---

### Q15: How do pro-code agents integrate with Joule (Bring Your Own Agent)?

**A:** Pro-code agents integrate via the A2A protocol: (1) the agent exposes an A2A server endpoint, (2) a Joule Scenario is manually created, (3) a Dialog Function with an `agent-request` action type is configured to call the A2A endpoint. At runtime, Joule acts as an A2A client, supporting synchronous communication (60-second timeout), asynchronous communication via push notifications/webhooks, and multi-turn conversations using context and task IDs.

---

### Q16: What is Embodied AI in the SAP context and what role do Embodied AI Agents play?

**A:** Embodied AI combines artificial intelligence with physical forms (robots, drones, autonomous vehicles) that perceive and act in the real world. SAP Embodied AI Agents extend digital workflows into physical operations by making robots cognitive—they sense and interpret physical environments in real-time, adapt dynamically to changes, and act autonomously in accordance with business priorities. SAP handles the business intelligence (determining business significance and responses) while physical device providers handle movement and sensory functions.

---

### Q17: What agent frameworks does the SAP Cloud SDK for AI support for pro-code agents?

**A:** The SAP Cloud SDK for AI supports: **LangGraph** (Python, JS/TS – graph-based control flow for complex stateful workflows), **AG2/AutoGen** (Python – multi-agent cooperation), **CrewAI** (Python – role-based collaborative task execution), **Smolagents** (Python – lightweight with tool-use optimization), **Google ADK** (Python, Go, Java – Google Cloud ecosystem with A2A/MCP support), **Pydantic AI** (Python – type-safe with automatic self-correction), and **AI SDK from Vercel** (JS/TS – AI-powered web applications).

---

### Q18: How does the integration of low-code agents with Joule differ from pro-code agent integration?

**A:** Low-code agent integration is automated: when deployed from Joule Studio, the platform automatically creates Joule artifacts (Scenario and Dialog Function), registers them in Joule's Scenario Catalog, and handles all API/protocol configuration. Pro-code integration is manual: developers must expose an A2A endpoint, create a Joule Scenario, configure a Dialog Function pointing to the A2A endpoint, and set up IAS App2App trust. Low-code is seamless and tightly integrated; pro-code is decoupled, open-standard based, and maximally flexible.

---

### Q19: What use cases do Agents for Structured Data address, and what is the role of SAP Datasphere?

**A:** Agents for Structured Data address two analytics types: **Descriptive** (deriving insights and trends, e.g., Finance KPI exploration, procurement spend classification) and **Prescriptive** (proactive recommendations, e.g., replenishment recommendation engines). SAP Datasphere plays a pivotal role by federating data from SAP Cloud Solutions, third-party apps, and on-premise systems—allowing agents to query large, distributed datasets without data replication while maintaining agility and efficiency.

---

### Q20: What is SAP's strategic approach to open standards for AI agent interoperability?

**A:** SAP fully embraces **A2A as the preferred standard** for multi-agent collaboration and vendor-to-vendor interoperability, enabling Joule Agents to communicate with both SAP-native and third-party agents across platforms (Google Vertex AI, Microsoft Copilot Studio, AWS Bedrock AgentCore). **MCP is used internally** to provide Joule Agents with semantically enriched access to SAP business capabilities and domain knowledge. For external interoperability, SAP prioritizes A2A over direct MCP server exposure to ensure enterprise-grade security, governance, and controlled access while maintaining open standard flexibility.