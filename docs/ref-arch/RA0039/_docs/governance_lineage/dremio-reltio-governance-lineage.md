## Dremio vs. Reltio — Governance & Lineage Capabilities

---

### Dremio

Dremio positions governance and lineage as core to its **Lakehouse / Semantic Layer** platform, especially in Enterprise and Cloud editions.

#### Access Control & Governance
- **Role-Based Access Control (RBAC)** across the Semantic Layer and Data Catalog [Source](https://www.dremio.com/platform/unified-analytics/data-governance/)
- **Fine-Grained Access Controls (FGAC)**: row-level filtering and column-level masking on tables, views, and data sources [Source](https://docs.dremio.com/current/data-products/govern/)
- **Comprehensive audit logging** of SQL queries, data interactions, and view modifications
- Integration with external policy engines (e.g., **Privacera**, **Apache Ranger**) — Enterprise only [Source](https://docs.dremio.com/editions/)
- Governance policies enforced from client to source, including across federated data

#### Lineage
- **Native dataset-level lineage graphs**: shows source → parent → child relationships for any dataset in the lakehouse [Source](https://docs.dremio.com/dremio-cloud/manage-govern/lineage/)
- **Impact analysis & dependency tracking**: understand downstream consequences of changes
- **API access** to lineage metadata via the Catalog API
- Lineage extended to **Apache Polaris (Open Catalog)**, Unity Catalog, and all **Iceberg REST catalogs** (v26.x+)
- Lineage graphs auto-refresh in supported environments
- **Not available in Community edition** — requires Enterprise or Cloud

#### Metadata & Discoverability
- Wikis, tags, labels, and documentation enrichment on datasets
- **Semantic layer integration**: metrics, hierarchies, and relationships defined once and reused across BI, AI, and data science tools
- AI Semantic Layer knowledge graph for business context in agentic/AI workloads [Source](https://www.dremio.com/blog/semantic-layer-the-definitive-guide/)

---

### Reltio

Reltio's governance and lineage focus is on **Master Data** — ensuring entities (customers, organizations, products) are trusted, traceable, and governed across operational and analytical systems.

#### Access Control & Governance
- **Fine-grained RBAC** at user, role, and group level, including attribute/facet-level access in profiles [Source](https://www.reltio.com/master-data-management/)
- **Policy-driven stewardship workflows** to enforce governance across data domains
- **Reference data management** to anchor governance definitions enterprise-wide
- Consent management and support for **GDPR/CCPA** compliance
- Survivorship rules with full traceability [Source](https://docs.reltio.com/en/reltio/release-notes-at-a-glance/2025.2-release-notes/2025.2-major-release-notes)

#### Lineage
- **End-to-end data lineage** at both user and process levels — every change, access, and data modification is traceable [Source](https://staging.reltio.com/wp-content/uploads/2024/03/Building_a_Trusted_Data_Foundation_For_AI_ML_WP.pdf)
- **Reltio ID with native lineage** across systems for golden records (Entity Resolution)
- **Document lineage** (2025.2): deep-links source files within profiles for regulatory traceability
- **Granular audit trails** for operational compliance
- Lineage and access controls **travel with the data** into downstream applications, analytics, and AI agents [Source](https://www.sap.com/products/data-cloud/reltio.html)

#### External Governance Integrations (Zero-Copy)
- **Collibra** (2024.2): sync Reltio entity/relationship metadata into Collibra's data catalog [Source](https://docs.reltio.com/en/reltio/release-notes-at-a-glance/2024.2-release-notes/2024.2-major-release-notes)
- **Microsoft Purview** (2024.3): discovery and governance interoperability [Source](https://www.reltio.com/resources/press-releases/reltio-launches-new-release-with-unparalleled-ai-powered-features-to-enable-superior-customer-experiences-and-enhanced-security/)
- **Alation** (2025.1): automated metadata sync for lineage and discovery [Source](https://docs.reltio.com/en/reltio/release-notes-at-a-glance/2025.1-release-notes/2025.1-major-release-notes)
- **Databricks Unity Catalog**: metadata interoperability

#### Agentic Governance (2025)
- **AgentFlow** (MCP-based): AI agents built on Reltio inherit the platform's access controls, consent, and lineage — governance is not bypassed by automation [Source](https://docs.reltio.com/en/reltio/release-notes-at-a-glance/2025.2-release-notes/2025.2-major-release-notes)

---

### Positioning Summary

| Dimension | Dremio | Reltio |
|---|---|---|
| **Primary focus** | Lakehouse query engine / Semantic Layer | Master Data Management (MDM) |
| **Lineage type** | Dataset/table-level, SQL transform lineage | Entity/record-level, operational change lineage |
| **Access control** | RBAC + FGAC (row/column) at query time | RBAC + attribute-level + consent + stewardship workflows |
| **Audit** | SQL query & data interaction logs | User & process-level audit trails on every record change |
| **External catalog integrations** | Polaris, Unity, Iceberg REST | Collibra, Purview, Alation, Unity |
| **AI/agent governance** | AI Semantic Layer, engine-enforced FGAC for agents | AgentFlow — agents inherit MDM governance natively |
| **Best fit** | Governed analytics / BI / AI on lakehouses | Trusted master data for operations, CRM, and AI |

**In short:** Dremio governs *how data is accessed and analyzed* across a lakehouse; Reltio governs *what the data is and who changed it* across master data domains. In the context of **SAP Business Data Cloud**, both are increasingly complementary — Dremio for real-time analytics governance, Reltio for master data quality and end-to-end entity lineage. [Source](https://www.zacks.com/stock/news/2978100/can-sap-business-data-cloud-become-its-next-major-growth-engine)