The Catalog as a Single Governed Plane

Standards & Mechanisms
• Apache Polaris: Implements the open Apache Iceberg REST Catalog specification, serving as the central control plane for metadata and security.
• UniForm (Universal Format): Materializes both Delta and Iceberg metadata asynchronously, ensuring cross-ecosystem compatibility without duplicating the underlying Parquet data files.
• Iceberg Table Spec: Governs snapshot isolation, schema evolution, and time-travel at the file level.
How it Works Mechanically
Polaris acts as the single entry point for any engine attempting to read a Primary Data Product. When an engine (whether Dremio, Snowflake, or an external platform) queries the BDC Lakehouse, it must authenticate against Polaris via the Iceberg REST API to request table metadata. Polaris evaluates the request and, upon authorization, vends temporary, short-lived storage credentials (e.g., AWS STS, Azure SAS) scoped strictly to the specific Parquet files and Iceberg manifest files required for that query. This ensures that control remains entirely at the catalog level; external engines cannot bypass the catalog to access the raw object storage, nor do they need their own internal governance mappings for these products.
Enterprise Architect Watch-Outs
• Metadata Sync Latency: Since UniForm generates dual metadata, ensure the write-path orchestration completely commits both the Iceberg manifest and Delta log before signaling the pipeline is complete. Inconsistencies here can cause different engines to read different table states.
• Storage Credential Vending Performance: High concurrency workloads from federated engines like Dremio rely heavily on the latency of Polaris vending cloud tokens. Rate limits on the underlying cloud IAM provider must be actively monitored.
Limitations & Confidence Flags
• Flag: While Polaris handles table-level and prefix-level governance beautifully via credential vending, the open-source Polaris project relies on underlying cloud-native IAM. You must ensure the SAP Enterprise Catalog wrapper handles the automated mapping between SAP identities and cloud IAM roles smoothly.
Lineage Traced Back to Source
Standards & Mechanisms
• Open Resource Discovery (ORD): The SAP standard for documenting APIs, events, and data products, serving as the semantic registry.
• Iceberg Snapshot Metadata (Table Properties): Key-value pairs embedded in the Iceberg table manifest that store run-IDs, source system IDs, and transformation job references.
• Reltio / Dremio Metadata: Transformation logic and key maps maintained within the processing layer.
How it Works Mechanically
Lineage in the BDC Lakehouse spans both physical and semantic layers. When data is extracted from an SAP source (e.g., S/4HANA OData or CDS views) into the Bronze layer, the orchestration engine injects the source transaction ID and system-of-record metadata into the Iceberg table properties via Polaris. As Reltio processes this data into Silver golden records, the resulting Iceberg snapshot includes metadata pointing back to the Bronze snapshot ID. Semantically, these data products are registered in ORD, which maps the physical Iceberg table to its business context, owners, and upstream S/4HANA APIs. Dremio’s logical views (Gold layer) retain dependency mappings to the physical Silver tables, allowing a complete trace from a Gold BI dashboard, through Dremio, to the Reltio golden record, and back to the S/4HANA origin.
Enterprise Architect Watch-Outs
• Physical vs. Semantic Disconnect: Iceberg natively versions tables, not lineage. The "traceability" relies on orchestration pipelines consistently writing lineage tags into Iceberg properties. If a pipeline breaks standard patterns, lineage is severed.
• Master Data Key Maps: When Reltio merges records across systems, the lineage graph becomes complex (many-to-one). Ensure the key mapping tables are exposed as queryable metadata products themselves.
Limitations & Confidence Flags
• Flag: Granular, column-level physical lineage tracking (e.g., "column X in Gold came from column Y in S/4HANA table Z") is not an intrinsic feature of Iceberg or Polaris. It typically requires an external metadata graph or relying entirely on Dremio's internal lineage capabilities. Make sure to specify where the visual lineage graph actually lives in this architecture.
Access Control and Policy Propagation
Standards & Mechanisms
• Polaris RBAC: Role-based access control managed centrally at the catalog REST API level.
• Dremio Semantic Layer: Enforces dynamic data masking and row-level security (RLS) policies at query time.
• Iceberg REST API Spec: Transmits user identity and role context during table metadata requests.
How it Works Mechanically
Policies are defined once at the SAP Enterprise Catalog. For coarse-grained access (table/file level), Polaris enforces this by denying the REST API request or refusing to vend cloud storage credentials. For fine-grained access (Column-Level Security/RLS), the mechanism splits depending on the consumption path. When Dremio is the primary compute and federation engine, Dremio inherits the semantic tags and policies from the catalog and applies dynamic masking or row-filtering rules before returning the result set to the user.
Enterprise Architect Watch-Outs
• Engine Bypass Risks: If an external engine (e.g., an external Databricks workspace) connects directly to Polaris and bypasses Dremio, it receives the raw Parquet files (if authorized at the table level). That external engine must respect and enforce the CLS/RLS policies locally.
• Identity Federation: Propagation requires the user’s identity to be understood seamlessly across SAP, Dremio, and any external engines. Standardizing on a single identity provider (IdP) mapping via OAuth2/OIDC is mandatory.
Limitations & Confidence Flags
• Confidence Level - Moderate: The prompt states "column-level security defined once... and propagated to every engine." Flag: In the open data ecosystem today, true central enforcement of RLS/CLS that forces disparate external engines (Snowflake, Databricks) to comply without an intermediary compute gateway (like Dremio) is highly experimental. Usually, policy sync engines (like Privacera or plain catalog sync scripts) push the rules into the external engine's local metastore. Verify if SAP's implementation of Polaris includes an active policy-sync agent for external engines, or if it relies on Dremio as the mandatory gateway for sensitive datasets.
Write-Back as Governed Products
Standards & Mechanisms
• Iceberg Write Path (Append/Overwrite): Standardized transactional guarantees for modifying or creating tables.
• Open Resource Discovery (ORD): Registration of the newly generated asset.
• Apache Polaris: Catalog commit phase for the new data product.
How it Works Mechanically
When an AI application or analytics team generates new insights (e.g., predictive maintenance scores, customer churn probabilities), this output is not dumped into an isolated bucket. The engine writes the results as open Parquet files and initiates a commit via the Polaris REST API. Polaris registers this as a new Gold or Silver data product (depending on maturity), and UniForm ensures Delta/Iceberg metadata is generated. The pipeline then hits the ORD API to register the semantic definition of the new product, attaching lineage tags that point back to the model version and the source data products used to generate it. Because it is registered in Polaris and ORD, it instantly becomes discoverable and governable by Dremio, Reltio, and other consumers.
Enterprise Architect Watch-Outs
• Schema Evolution: AI outputs can be fluid. Iceberg handles schema evolution (adding/dropping columns) gracefully at the format level, but downstream dashboards connected via Dremio might break. Implement strict schema contracts for write-back pipelines.
• Namespace Clutter: Treat the write-back zone as a governed space. Without strict ORD registration rules, the Gold layer can quickly become a "data swamp" of ad-hoc AI outputs. Require data owner and SLA definitions for every write-back commit.
Limitations & Confidence Flags
• Flag: If external platforms (like Databricks) are generating the AI insights, they must be configured to write back using the Iceberg REST catalog protocol pointing to Polaris, rather than writing to their native catalogs. This requires explicit compute-cluster configuration to treat Polaris as the authoritative metastore for these specific write-back namespaces.