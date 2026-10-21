# A perspective from BARC Consultants

Last edited: May 4, 2026
What happened?
SAP intends to acquire Prior Labs, a research lab and provider of tabular foundation models for predictive AI on structured data, and Dremio, an open data lakehouse platform enabling high-performance federated queries across SAP and non-SAP sources without data movement.

Acquisition 1: Prior Labs: Betting on Tabular AI
Prior Labs will strengthen SAP’s predictive AI capabilities on structured/tabular enterprise data. Combining their SAP data with TabPFN, Prior Labs’ AI model, users can cover use cases like predictive maintenance, demand forecasting, customer churn, and cash flow analysis. SAP will back this innovation with an investment of more than €1 billion over the coming years. SAP aims to make classical AI, particularly for prediction tasks, more accessible for a wider range of organizations, following the examples of LLMs that made generative AI accessible for every organization and even consumers. ⁠⁠⁠⁠⁠⁠⁠⁠The co-founders and scientific advisors of Prior Labs (including renowned AI experts like Yann LeCun and Bernhard Schölkopf) will remain in place.

What Prior Labs Is
Prior Labs is a German AI research company founded by Frank Hutter, Noah Hollmann, and Sauraj Gambhir, headquartered in Freiburg with offices in Berlin and New York. Its core product is TabPFN, a Tabular Foundation Model (TFM): a class of machine learning model purpose-built for structured, tabular data, as opposed to unstructured text or images.

Unlike general-purpose large language models, TFMs are trained to reason statistically over tables, numbers, and structured data records. The model supports in-context learning: users supply data records at inference time and receive predictions immediately, without retraining. A conversational interface allows non-technical business users to interact with the model via natural language. Prior Labs’ research has been published in Nature, and TabPFN has accumulated over three million open-source downloads, indicating meaningful adoption in the data science community.

From a technical standpoint, TabPFN (Tabular Prior-data Fitted Network) is a Transformer-based foundation model that, unlike many classical data science approaches requires no manual training or tuning. It relies on in-context learning: training data is passed as context at inference time, and the model generates predictions in seconds, in a single forward pass. This fact and the natural language interface make it much more accessible for subject matter experts without deep data science knowledge on the aspect of methods and technical skills.

Its key limitations are inference latency (training and test data are processed together on each call) and memory constraints at scale, making other models architectures the better choice for high-volume workloads.

Why it is important
Tabular foundation models like TabPFN lower the barrier to predictive AI significantly: they remove the need for data science expertise in model training, tuning, and preprocessing, making it feasible for business users in finance, operations, or sales to run predictive analyses directly on their own data. The implication is a broader reach, not just more organizations using predictive AI, but more people within those organizations applying it to a wider range of business problems. The prerequisite shifts from data science skills to domain knowledge: understanding the business problem well enough to frame it becomes the critical capability.

BARC Assessment
Opportunities:
A new category of enterprise AI: Existing data science methods work well on structured, tabular data but they require data preparation and expert skills. Large Language Models on the other hand are more accessible for everyone, but (without workaround like creating Python scripts) they are performing poor on data analysis or prediction tasks. This is exactly the gap that TabPFN closes: Predictive AI on tabular data, driven by subject matter experts. That way, more predictive AI projects can be realized, especially small-scale projects.
Differentiation in the agentic AI race: Combining tabular models with LLMs enables Joule/BDC agents to deliver both predictions and human-readable explanations, which is hard for LLM-only stacks to match.
Top talent + €1B+ investment signal: Keeping key scientific leadership and backing it with a investment commitment positions SAP in the race, which platform will lead the race when it comes to agentic AI on business processes.
Defensible end-to-end stack: Tabular AI on top of federated data access (Dremio, BDC itself, BDC partnerships) and master-data governance (Reltio) makes SAP AI aspirations much more credible.
Risk and open questions
Early-stage technology maturity: Tabular foundation models are still new; real-world robustness, accuracy across diverse enterprise datasets, and scaling behavior are less proven than established AutoML/classical ML.
LLMs narrow the gap via code generation: LLMs can write the data science code for classical ML pipelines, making them cheaper and more accessible. This innovation may partially erode the accessibility advantage TabPFN claims over traditional approaches
Agentic AI may crowd out adoption: For many SAP customers, agentic AI is the more immediate priority. Tabular prediction projects may struggle to compete for budget and attention in the short term, however compelling the technology.
Roadmap overlap with SAP-RPT-1: SAP already developed its own tabular foundation model, SAP-RPT-1. How TabPFN and RPT-1 will coexist, converge, or differentiate going forward remains an open question.
Statements
“We continue as an independent entity — same brand, same team, same mission, same open-source commitments — now with the resource envelope, data environment and deployment reach to attack research problems that previously sat outside what was feasible.” – Frank Hutter, Founder and CEO of PriorLabs
“TabPFN’s appeal in the SAP context raises a fair question: how much of the bottleneck is the complexity of predictive AI, and how much is SAP’s historically restricted data access? Where data flows freely, LLM-assisted scripting already makes custom predictive models fast and cheap to build. And those model are on average more cost-efficient than transformer models.” – Florian Bigelmaier, Analyst, BARC
Implications for the Market
For SAP Customers
Predictive AI for structured enterprise data becomes mainstream: Expert data science knowledge becomes less of a bottleneck to create predictions from semantically rich tabular data.
Smarter, more capable Joule agents: Tabular models complement (rather than replace) LLMs. This way, they can make Agentic AI and AI chatbots built for and within the SAP platforms more accurate and actionable on enterprise data.
Long-term roadmap confidence: SAP’s commitment of more than €1 billion over the coming years, paired with leading AI talent, signals serious, sustained investment and that SAP is willing to invest to be a strong partner in the AI race.
For Prior Labs Customers
Massive scale-up in resources: SAP’s €1B+ multi-year investment gives Prior Labs far more funding, compute, and enterprise data access to accelerate development beyond typical startup constraints.
Continued open-source availability: In a press and media session, Irfan Khan and Philipp Herzig underlined that the committment of both firms (Prior Labs, Dremio) to open source will be continued.
Acquisition 2: Dremio – Modern Lakehouse Architecture for SAP
Dremio will strengthen SAP Business Data Cloud with federated, query-in-place lakehouse capabilities built on Apache Iceberg, Apache Arrow, and the Polaris catalog. SAP aims to enable customers to run high-performance queries across SAP and non-SAP data without physical consolidation.

What Dremio Is
Dremio is a US-based data platform vendor specializing in open lakehouse architecture. Its platform is built natively on Apache Iceberg, the open table format that has become the de facto standard for large-scale analytical data storage, and Apache Arrow, a columnar in-memory data format optimized for fast query execution.

The platform’s key functional areas are: a serverless, elastic query engine capable of running analytical workloads across heterogeneous data sources without data movement or format conversion; and Apache Polaris, an open catalog based on the Apache Iceberg REST Catalog API, which provides a unified metadata and governance layer across multiple environments.

Dremio positions itself on low total cost of ownership and openness: customers are not required to consolidate data into a proprietary store. The platform scales automatically with query demand, which avoids fixed-capacity provisioning costs. Dremio has been a significant open-source contributor, maintaining stewardship roles across Iceberg, Polaris, and Arrow.

Why SAP Is Buying It
Irfan Khan (President and Chief Product Officer, SAP Data & Analytics) framed the Dremio acquisition around three functional pillars for a modern lakehouse architecture inside SAP Business Data Cloud:

Open Table Format foundation: SAP already supports Iceberg and Delta Lake formats for HANA Data Lake files. Dremio adds a proven, high-performance query engine on top of that storage layer: a meaningful step from format support to full query-in-place capability.
High-performance, low-TCO query engine: A serverless, in-memory columnar engine that queries data where it resides. SAP customers have repeatedly asked for cost-effective ways to combine data from SAP and non-SAP sources and Dremio could be a cornerstone here to resolve the need for physical data movement further.
Polaris Catalog: A universal catalog enabling governed access to data across the full customer landscape, from hyperscaler object stores to legacy on-premise databases.
A less openly discussed topic: SAP’s own product sprawl creates data friction long before non-SAP sources enter the picture. Customers combining SuccessFactors, Ariba, S/4HANA, Concur, IBP, BW, BDC,… regularly hit integration walls; especially between products that have been natively developed by SAP and others that have been acquired. Dremio’s federation layer could address that internal SAP-to-SAP gap, which may prove as valuable as any cross-vendor use case.

BARC Assessment
Opportunities
Unified, federated data foundation for AI: Joule/BDC agents can query SAP and non‑SAP sources in place, reducing/avoiding data movement and speeding time-to-value for AI.
Faster, lower‑TCO BW/BW-HANA modernization: Dremio’s federation can act as a transition layer into Business Data Cloud by being able to query BW data that has not yet fully migrated to BDC.
Sovereign + regulated-industry expansion for Dremio: SAP has a proven track record of being able to deliver on strict residency/compliance requirements (as required by customers in finance, public sector, healthcare), e.g., via sovereign/SAP Cloud deployment options.
Bridge to legacy landscapes: Federation into SQL Server, Oracle, and other on‑prem systems enables AI use cases without rip-and-replace or full consolidation first.
Complementary to Reltio (MDM): Combining federation/query access with MDM + data quality strengthens SAP’s end-to-end “data fabric” narrative for BDC across complex multi-landscape environments.
Risk / Open Questions
Customer confusion over BDC strategy With BDC, HANA, Dremio, plus partnerships with Databricks, Snowflake, and Fabric, customers face an increasingly complex menu of options.
Dremio is a query layer, not SAP data liberation SAP data access has historically been restricted, and this acquisition is unlikely to change that by default. SAP will need to demonstrate that Dremio operates as a genuinely bidirectional capability. The risk: it becomes primarily an inbound layer, pulling non-SAP data into SAP, rather than an open gateway through which external systems can query SAP data in return.
Integration execution risk Embedding Dremio alongside HANA as an additional engine, with SQL decomposition and pushdown, is technically demanding. Delivery delays could undermine the BW migration value proposition.
Organizational and cultural integration No clarity yet on future organizational setup, leadership, or how Dremio will operate within SAP, while the corporate cultures differ significantly. Talent retention and product focus are at risk during the transition.
Channel conflict with strategic partners Databricks, Snowflake, Microsoft Fabric, AWS, and BigQuery may perceive Dremio as a competitive threat inside SAP accounts, straining co-sell motions despite SAP’s “complementary” framing.
Semantics SAP now distributes semantic capabilities across multiple layers: BDC’s harmonized data products, the SAP Knowledge Graph, Datasphere, BW, SAC, and now Polaris via Dremio. Each carries a form of business context. Customers will need clear guidance on which semantic layer is authoritative, and for which purpose.
Statements
“Dremio enables SAP customers to access non-SAP data without the headache of a migration.” – Kevin Petrie, VP Research, BARC US
Implications for the Market
For SAP Customers
Federated, query-in-place architecture: Dremio removes the need to physically consolidate data before deriving AI value, bridging SAP BDC, modern lakehouses and legacy on-premise systems.
Open standards reduce lock-in: Especially the reinforcement of the support of Apache Iceberg will ensure that SAP customers invest in industry-standard rather than proprietary technologies.
Accelerated BW/HANA migration and sovereign deployment: Dremio supports the path to Business Data Cloud, potentially lowering TCO, and enables sovereign cloud setups for regulated industries.
Open roadmap questions: Customers building agents need clearer guidance on which data option to choose; SAP is expected to provide details at Sapphire in Orlando next week.
For Dremio Customers
Continued open-source commitment: SAP has explicitly stated it will maintain Dremio’s open source engagement, so existing investments in Iceberg, Arrow, and Polaris remain safe.⁠⁠
Stronger enterprise backing and investment: Becoming part of SAP brings scale, financial stability, and access to a large enterprise customer base. But it also introduces dependency on SAP’s strategic priorities.⁠⁠
Uncertainty until closing: Organizational setup and detailed integration plans are still pending regulatory approval and post-close announcements.
For Competing Vendors (Databricks, Snowflake, etc.)
Predictive AI / AutoML vendors face a new heavyweight: With €1B+ committed and top tabular AI talent (Hutter, Erickson, LeCun, Schölkopf), SAP raises the bar for DataRobot, H2O, and similar players in structured-data AI.⁠⁠⁠⁠
Open table format becomes table stakes: Iceberg’s positioning as the “USB-C of data exchange” pressures Delta-centric and proprietary-format vendors to double down on interoperability.⁠⁠⁠⁠
Federation/virtualization specialists (Denodo, Starburst, Trino) lose differentiation: SAP-native federation reduces the need for third-party query engines in SAP-heavy landscapes.⁠⁠⁠⁠
Pressure on standalone lakehouse players (Databricks, Snowflake, Fabric): SAP now offers a credible, SAP-aligned lakehouse alternative. Partnerships continue, but customers gain a “default” option that may erode net-new wins inside SAP accounts.⁠⁠⁠⁠⁠⁠
Sovereign cloud and regulated-industry providers gain a stronger SAP-aligned competitor: Dremio’s deployment in SAP Cloud and sovereign properties challenges niche EU/regulated-data vendors.⁠
BARC’s view on SAP’s Data + AI Platform Strategy
Taken together, the Prior Labs and Dremio deals reinforce a coherent move by SAP to evolve from a business application vendor into a vertically integrated data-plus-AI platform, closing important gaps that SAP has left open so far.

Vertical integration of the data + AI stack: SAP is assembling an end-to-end platform: Open lakehouse (Dremio), tabular foundation models (Prior Labs), MDM and data quality (Reltio), and Joule agents on top of Business Data Cloud.
Doubling down on open standards: Apache Iceberg, Arrow, Polaris, and open-source TabPFN signal a deliberate shift away from a “walled garden” toward interoperability with Databricks, Snowflake, Microsoft Fabric, and the hyperscalers.
AI focused on structured enterprise data: Both acquisitions target SAP’s core territory (transactional, tabular business data) rather than chasing generic GenAI use cases already dominated by hyperscalers and LLM vendors.
Federation over consolidation: A consistent “query data where it lives” philosophy lowers migration friction, accelerates BW/HANA modernization, and may even support sovereign and regulated-industry deployments.
Talent and capital at scale: Multi-year, billion-euro commitments combined with the retention of leading scientific talent underline SAP’s intent to compete credibly with pure-play data and AI platform vendors.
