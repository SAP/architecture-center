**Research notes before the material**

**EKX status:** The SAP Enterprise Knowledge Graph was unreachable (health check returned `status: degraded`) at the time of this query. All material below draws exclusively from Knowledge@SAP searches (battlecards, semester plans, product standards, internal architecture docs, SAP Help, Stack@SAP). I'll mark claims sourced from my training knowledge explicitly so you can verify them against primary specs.

**Source confidence key used inline:**
- **[K@SAP]** — retrieved from Knowledge@SAP in this session (linked)
- **[TRAINING]** — from my training on open specifications / public docs; treat as "needs primary source verification"
- **[FLAG]** — something I'm uncertain about or that appears to be roadmap rather than GA

---

## Governance & Lineage — Supporting Technical Material

---

### 1. The Catalog as a Single Governed Plane

#### What makes it work (open standards and mechanisms)

The SAP Enterprise Catalog is built on **Apache Polaris**, which implements the **Iceberg REST Catalog API specification** [TRAINING — Apache Polaris open-source spec; verify against [https://polaris.apache.org](https://polaris.apache.org)]. Polaris is an incubating Apache Software Foundation project; SAP's adoption of it as the "SAP Enterprise Catalog" is stated in your brief but was not explicitly confirmed by name in the Knowledge@SAP results this session — **[FLAG] please verify the "SAP Enterprise Catalog powered by Apache Polaris" branding against internal product documentation before publishing.**

The Iceberg REST Catalog spec defines a uniform HTTP interface for namespace and table lifecycle management: `GET /v1/config`, `POST /v1/namespaces`, `GET/POST/DELETE /v1/namespaces/{namespace}/tables/{table}`, plus credential vending via `GET /v1/namespaces/{namespace}/tables/{table}/credentials` [TRAINING]. Any engine that implements the Iceberg REST client (Dremio, Spark, Trino, Flink, Snowflake external catalog, Databricks external catalog) can talk to the same catalog endpoint without engine-specific shims.

BDC's catalog is described internally as an "enterprise-wide data catalog, to make governance over multiple systems much easier… control the process of data connectivity through its management and monitoring systems, across the entire lifecycle" [K@SAP — [CMI Battlecard vs. Snowflake](https://cmicompeteone.wdf.sap.corp/asset/view/6177)].

Data products exposed via the catalog are described as having a **"Data Products Usage Agreement"** — defined as the "foundational object to keep and control access to Data Products" — with self-service access management so consumers can view and manage their own permissions [K@SAP — [BDC&I H2 2025 Semester Plan](https://sap.sharepoint.com/:b:/r/sites/126926/Shared%20Documents/Documents%20Storage/Strategy-tab/Semester%20Plans/Semester%20Plans%202025-H2/BDC%26I/BDC%26I_H2_2025.pdf)].

#### How it works mechanically

Polaris organizes tables in a **multi-level namespace hierarchy** (catalog → namespace(s) → table) [TRAINING — Polaris OSS docs]. When a consumer engine connects via the Iceberg REST endpoint, the catalog performs the access check and either vends short-lived credentials (for object-store access) or rejects the request. The governance decision is made at catalog resolution time, not at the engine. This means:

1. A data product owner defines access policy once on the catalog entry.
2. Any compliant engine (Dremio, Snowflake, Databricks connected as external catalog, a hyperscaler query engine) inherits that policy via the credential-vending handshake.
3. Policy changes propagate immediately to all engines on next catalog resolution — no per-engine reconfiguration.

The BDC Catalog also maintains a **data product taxonomy** (LoB, process, industry, region) enabling discovery across the Business Accelerator Hub and BDC Catalog [K@SAP — BDC&I H2 2025].

For UniForm-written products specifically: a single Parquet data file has both Delta Log metadata and Iceberg metadata materialized on top of it [TRAINING — Delta Lake 3.x UniForm docs; verify against [https://docs.delta.io/latest/delta-uniform.html](https://docs.delta.io/latest/delta-uniform.html)]. The Iceberg catalog records the Iceberg metadata path; the same physical files are never duplicated. External Iceberg-native engines read the Iceberg metadata; internal Delta-native pipelines read the Delta log.

#### What an architect should watch for

- **Catalog as a single point of governance also means a single point of failure.** Catalog availability is in the critical path for every engine. Polaris's design explicitly targets stateless catalog replicas [TRAINING], but SLA guarantees in the SAP-managed deployment should be verified.
- **Namespace grant inheritance.** Polaris RBAC propagates grants down the namespace tree [TRAINING — Apache Polaris privilege model]. A broad grant at the namespace level covers all tables underneath, which can be unintentionally permissive. Define the narrowest namespace scope appropriate to the product boundary.
- **External engine compatibility.** Snowflake and Databricks connect to Polaris as external catalogs via the Iceberg REST spec. The spec version (Iceberg REST Catalog v1) must align between the server and the client SDK versions embedded in those engines. Version drift can silently fall back to lower-capability modes. [FLAG: confirm version-pinning strategy in the BDC managed deployment.]
- **Schema evolution under governance.** Iceberg supports schema evolution (add/drop/rename columns, promote types) without rewriting data [TRAINING — Iceberg spec §3]. SAP-managed data products are updated when underlying source tables add fields [K@SAP — [SAP BDC Strategy](https://pages.github.tools.sap/CPA/data-product-howto-guide/01-introduction/strategy)], but any breaking change must be handled via Iceberg's schema evolution primitives to avoid breaking downstream consumers.

#### Realistic limitations

- Column-level security in Iceberg is delegated to the compute engine, not the catalog format itself [TRAINING]. Polaris supports table-level and namespace-level grants; column masking requires engine-side enforcement (e.g., Dremio column policies). This means policy consistency at the column level depends on each engine honoring the masking rules — a heterogeneous engine environment increases audit complexity. **[FLAG: the Knowledge@SAP results did not explicitly confirm a BDC-level column-masking mechanism. The BDC&I H2 2025 plan mentions "Fine Grained Access Control" as a 'Data Window' (row subset), not column masking — verify scope before claiming column-level policy.]**
- The catalog does not enforce data-quality or schema contracts at write time — that is left to pipeline logic. Policy enforcement is access-oriented, not content-oriented.

---

### 2. Lineage Traced Back to Source

#### What makes it work

SAP Datasphere's Catalog provides the lineage visualization layer at the SAP-product level. Internally it is described as: "With the data lineage capability… users can understand relationships between assets and visualize where the data is coming from and where it is landing. Lineage offers a structured overview of objects and spaces so users can quickly understand object and data dependencies and directly navigate to the relevant business objects." [K@SAP — [Stack@SAP #33712](https://sap.stackenterprise.co/questions/33712)].

The same Stack@SAP answer notes that SAP BW, SAP ECC, and SAP S/4HANA are on the **roadmap** for catalog inclusion: "Soon, the catalog will expand to include other SAP applications and sources, including SAP BW, SAP ECC, and SAP S/4HANA." [K@SAP — Stack@SAP #33712] — **[FLAG: "soon" was the answer at time of writing; verify current GA status. If this is not GA, the architecture page should say "planned" not "active".]**

Separately, an internal discussion on end-to-end data lineage for SAP Business Suite / S/4HANA confirms: "end-to-end data lineage for SAP ABAP applications is definitely something we intend to build, and is a key focus for us. This will likely be addressed in the 'one catalog' project." [K@SAP — [Stack@SAP #15015](https://sap.stackenterprise.co/questions/15015)] — **[FLAG: this may be an older discussion (references "data suite" internal codename); confirm whether the BDC Catalog / Datasphere Catalog is the realized "one catalog."]**

At the open-standard layer, **OpenLineage** (CNCF, [https://openlineage.io](https://openlineage.io)) is the emerging standard for lineage event emission from pipelines [TRAINING]. OpenLineage defines a `RunEvent` JSON schema with `inputs` (dataset + facets) and `outputs`, enabling a pipeline executing on Spark or Airflow to emit lineage that any OpenLineage-compatible backend can ingest. **[FLAG: the Knowledge@SAP results did not surface any explicit BDC commitment to OpenLineage as the emission standard. Verify whether BDC Lakehouse pipelines emit OpenLineage events or use a proprietary lineage record.]**

#### How it works mechanically

For SAP-managed data products, lineage is embedded at two levels:

1. **Metadata level (ORD):** Each data product registered in ORD carries a `dataProduct` descriptor that can reference source system, originating table, and transformation logic [K@SAP — [INTG-03R3 ORD Product Standard](https://pages.github.tools.sap/product-standards/portal/docs/requirements/Integration/INTG-03R3)]. The ORD document is machine-readable JSON, enabling automated lineage ingestion by the Unified Metadata Service (UMS) and Business Knowledge Graph (BKG).

2. **Physical level (Iceberg table metadata):** Iceberg snapshot history in `metadata.json` records schema-at-write and which data files belong to each snapshot. This is format-level provenance (who wrote which snapshot, when), not semantic lineage to the upstream source system [TRAINING — Iceberg spec §4.3]. Connecting snapshot history to the S/4HANA originating CDS view requires that the pipeline annotates the Iceberg table's `properties` map (a freeform key-value bag) or emits an OpenLineage event at write time.

For the medallion flow: Bronze tables are written from SAP source system extractors (e.g., S/4HANA CDS views via ABAP SLT or data lake integration jobs). The BDC integration jobs for source systems like SAP IBP use scheduled application job templates [K@SAP — [Predefined Application Job Templates](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/21918e56087ad95fe10000000a441470.html)]. Silver promoted data products are described in ORD with explicit source data product relationships.

#### What an architect should watch for

- **Lineage gap at the Authorization boundary.** When data is delivered to Datasphere through BDC, "any authorizations that are applied to the data in the source system are not imported." [K@SAP — [Applying Row-Level Security to Data Delivered through Intelligent Content](https://help.sap.com/docs/SAP_DATASPHERE/be5967d099974c69b77f4549425ca4c0/c83225fd195446f28c960671559c4a16.html)]. This is an access control implication that intersects with lineage: lineage metadata may correctly point back to S/4HANA, but source-system authorization context (e.g., S/4HANA authorization objects, profit-center restrictions) does not travel with the data. Governance teams need to explicitly re-assert equivalent controls at the BDC layer.
- **BW semantic onboarding.** The H2 2025 plan explicitly targets "metadata harvesting from SAP BW/4HANA and BW 7.5" into the Datasphere Catalog [K@SAP — BDC&I H2 2025]. Until this is GA, lineage from BW-sourced products to their originating InfoProviders may be incomplete or manual.
- **Reltio key maps.** Reltio's golden record production creates cross-system key maps (e.g., mapping an S/4HANA Business Partner GUID to a Salesforce Account ID). For lineage to be complete at the Silver layer, these key maps must be recorded as part of the data product's lineage graph, not just in Reltio's internal model. [FLAG: this is an architectural inference; confirm how Reltio key maps are surfaced in BDC lineage metadata.]

#### Realistic limitations

- Current Datasphere Catalog lineage is scoped to objects within Datasphere spaces and SAP Analytics Cloud. Extension to raw S/4HANA table / CDS view level is stated as an active roadmap item, not confirmed GA.
- Iceberg's built-in snapshot metadata does not constitute semantic lineage. Semantic lineage requires either ORD-level annotation or an OpenLineage integration on every pipeline that writes to the lakehouse.
- Lineage accuracy degrades with untracked ad-hoc transformations written directly to the object store.

---

### 3. Access Control and Policy Propagation

#### What makes it work

There are three distinct layers where policy is enforced in the BDC Lakehouse:

| Layer | Mechanism | Granularity |
|---|---|---|
| Catalog (Apache Polaris) | Iceberg REST RBAC — principal roles, namespace grants, table grants, credential vending | Table / namespace |
| Compute engine (Dremio, Datasphere) | Row-level security / column masking configured in the engine | Row / column |
| Data product API (ORD / BDC Catalog) | Data Product Usage Agreement, Data Window (row subset) | Defined subset |

The Polaris principal role model [TRAINING — Apache Polaris docs]: a catalog admin defines `CatalogRole` objects with privilege lists (e.g., `TABLE_READ_DATA`, `TABLE_WRITE_DATA`, `NAMESPACE_CREATE`). A `Principal` (service account / human user) is granted a `CatalogRole`. When the engine calls the catalog REST endpoint, the catalog validates the bearer token, resolves the principal's roles, and either returns short-lived storage credentials or rejects. The storage credentials are scoped to exactly the table's object-store path — the engine cannot read other paths even if it has direct object-store access tokens.

At the Datasphere layer, **Data Access Controls (DAC)** enforce row-level filtering. SAP's own documentation describes applying DAC as early as possible at ingest: "Secure data as soon as possible once it is ingested into SAP Datasphere" — encapsulating source tables in views with DAC applied, so fewer records flow forward in the pipeline [K@SAP — [Securing Data with Data Access Controls](https://help.sap.com/docs/SAP_DATASPHERE/be5967d099974c69b77f4549425ca4c0/a032e51c730147c7a1fcac125b4cfe14.html)].

At the HDL Files (HANA Data Lake) level, SAP's internal architecture documentation describes a `/policies` API that enables fine-grained authorization at catalog entity level — schemas and tables within the catalog — using namespace-qualified resource identifiers (e.g., `catalog:schema:bobschema:table:*`) [K@SAP — [HDL Files Policies](https://github.wdf.sap.corp/pages/DBaaS/Docs/designs/hanadatalake/hdlf/hdl-files-policies)].

HANA Cloud's Delta/Spark architecture doc confirms the design intent: access control should "integrate into existing RBAC and enterprise single sign-on (SSO) systems" [K@SAP — [Apache Spark, Delta and Delta Sharing in HANA Cloud](https://github.wdf.sap.corp/pages/DBaaS/Docs/architecture/hanacloud/hanadatalake/apache-spark-delta/apache-spark-delta-acd)].

#### How it works mechanically

For a Dremio or Snowflake consumer:
1. Consumer authenticates to the Iceberg REST catalog (SAP Enterprise Catalog / Polaris) using OAuth2 bearer token.
2. Catalog resolves principal → CatalogRole → table privileges.
3. If authorized, catalog returns time-limited, path-scoped object-store credentials (AWS STS, Azure SAS, GCP SA tokens — depending on the storage backend).
4. Engine uses those credentials to read Parquet files directly from object store.
5. Engine-side column masking / row filtering is applied on top per the engine's own policy configuration.

For Datasphere:
1. Row-level DAC is applied to the view that wraps the data product. Only the DAC-filtered view is shared to consumers.
2. Note: "The row-level security provided by the data access control can be circumvented while the view remains in its space. It is enforced only when the view is: Shared to another space, or Consumed outside the space in SAP Analytics Cloud." [K@SAP — Datasphere DAC docs]

#### What an architect should watch for

- **The two-layer gap.** Polaris grants access at the table level; column masking is engine-side. If two engines have the same table grant but different column masking rules, the same user can see different columns depending on which engine they use. There is no catalog-native column masking in the Iceberg REST spec as of today [TRAINING]. An enterprise architect must treat column-level policy as an engine contract, not a catalog contract.
- **DAC circumvention risk.** Datasphere's own docs call out that DAC is only enforced at space-sharing or external consumption boundaries — not within the space itself. Someone with direct space access can query the unmasked base view. This should be mitigated by role-separation (no direct space access for data consumers) and audit logging.
- **Source-system auth does not carry over.** Stated explicitly in SAP documentation: "when data is delivered to SAP Datasphere through SAP Business Data Cloud, any authorizations that are applied to the data in the source system are not imported." [K@SAP] Data governance teams must re-map S/4HANA authorization objects to BDC/Polaris equivalents as part of onboarding.
- **Credential vending scope.** Short-lived credentials from Polaris are scoped to the table's prefix in object storage [TRAINING]. If the object-store prefix overlaps with another table's prefix (poorly organized storage layout), the scope is effectively wider. Enforce strict `one data product = one unique object-store prefix` convention.

#### Realistic limitations

- Column-level encryption in Iceberg (a v2/v3 spec optional feature [TRAINING]) is not widely implemented in managed storage backends and is distinct from column masking at the query layer. Do not conflate the two.
- Polaris's open-source RBAC model does not (as of current releases [TRAINING]) include attribute-based access control (ABAC) — e.g., "user can see this column only if their department attribute = Finance." Engine-side ABAC implementations (Dremio, Ranger) fill this gap but are not catalog-native.
- Dynamic, tenant-aware policy propagation depends on the catalog connection being live. Cached credentials from a previous vend may persist until TTL expiry even if catalog-level access has been revoked.

---

### 4. Write-Back as Governed Products

#### What makes it work

The registration mechanism for any resource — including AI/analytics output — as a governed data product is **Open Resource Discovery (ORD)**. ORD is a mandatory SAP product standard (INTG-03R3): "Applications MUST implement Open Resource Discovery (ORD) to provide machine-readable metadata for integration, side-by-side extensions, AI-driven scenarios, and data/analytics use cases." [K@SAP — [INTG-03R3](https://pages.github.tools.sap/product-standards/portal/docs/requirements/Integration/INTG-03R3)].

ORD distinguishes two publishing perspectives:
- **Static**: API definitions, Data Product definitions, Agent Card definitions published to the Unified Customer Landscape (UCL) / Unified Metadata Service (UMS). Mandatory baseline as of December 1, 2026. [K@SAP — [INTG-03R3 BTP CloudFoundry doc](https://github.tools.sap/cloudfoundry/documentation/blob/main/docs/architecture/06_Security%20and%20Compliance/Product%20Standards/SERVICE-131+518/Assesments/INTG-03R3.mdx)]
- **Dynamic / tenant-aware**: Recommended for all providers, mandatory for LoBs with significant customer customization. Covers runtime-generated metadata (e.g., a specific AI model's output product registered per tenant).

An AI inference result published as an Iceberg table can be registered in ORD with:
- A `dataProduct` descriptor pointing to the output table in the catalog
- `inputPorts` referencing the Silver/Gold products that fed the model
- `version` following semver, enabling consumers to pin to a stable version
- `lineageGraph` describing the transformation chain from source to AI output

ORD metadata flows automatically to the Unified Metadata Service and Business Knowledge Graph [K@SAP — INTG-03R3], making the AI output discoverable alongside all other governed data products.

The BDC Strategy doc defines a data product as: "a data set exposed for consumption outside the boundaries of the producing application via APIs and described by high quality metadata that can be accessed through the Data Product Directory." [K@SAP — [SAP BDC Strategy](https://pages.github.tools.sap/CPA/data-product-howto-guide/01-introduction/strategy)]. This definition is explicitly format-agnostic — an AI output Iceberg table satisfies it as readily as an S/4HANA extraction.

#### How it works mechanically

1. An AI pipeline or analytics job writes its output as Iceberg-format Parquet to the Bronze/Gold prefix in object storage.
2. The pipeline registers the table with the SAP Enterprise Catalog (Polaris) via the Iceberg REST `POST /v1/namespaces/{namespace}/tables` endpoint, supplying the metadata file location.
3. A BDC data product registration step creates an ORD document describing the new product: source data products (inputs), transformation description, version, and access policy.
4. ORD publishes the document to UCL/UMS; the Business Knowledge Graph picks it up, making the AI output discoverable alongside the Silver and Gold products that fed it.
5. Consumers access the AI output product through the same catalog endpoint, under the same credential-vending flow, with policy defined at registration — no special handling versus any other product.

The BDC Semester Plan confirms "Data Product Relationships — Provide Data Product relationships that show the semantical interconnectedness and allow users to find related data products for a given use case" [K@SAP — BDC&I H2 2025]. This is the mechanism that would surface "AI product derived from Silver product X and Golden record Y."

#### What an architect should watch for

- **Lineage completeness depends on pipeline discipline.** ORD's `lineageGraph` field is a declaration — not auto-generated. If the AI pipeline does not explicitly populate it at registration time, the lineage is absent. This requires a write-back pattern where: (a) the pipeline knows its input product ORD IDs, (b) the pipeline passes those IDs to the registration step. Auto-generation from OpenLineage events is an option if the pipeline emits them, but this integration path should be confirmed.
- **Versioning and breaking changes.** If an AI model is retrained and its output schema changes, the ORD version must be bumped following semver. Existing consumers pinned to the prior version must be notified. This requires the same schema evolution discipline (Iceberg schema evolution + ORD version increment) as for any other governed product.
- **AI output trust and data quality.** Registering AI output as a first-class governed product confers discoverability but says nothing about statistical reliability. Architects should require a `dataQuality` descriptor (if supported by the ORD schema version in use) or a companion metadata field indicating model version, training data cut, and known accuracy metrics. Without this, a consumer can't distinguish a high-quality production model output from an experimental one.
- **Separation of AI inference context from governed data.** Some AI outputs (e.g., explanations, intermediate chain-of-thought) should not be governed data products — they lack the stability, versioning, and semantics required. Establish a clear policy for which AI outputs qualify for ORD registration and which remain operational artifacts.

#### Realistic limitations

- Dynamic, tenant-aware ORD publishing (the mode required for per-run AI outputs) is RECOMMENDED but not yet universally mandatory (binding date: December 1, 2026). Until then, not all pipeline implementations will self-register outputs. [K@SAP — INTG-03R3 v2.0]
- ORD's `dataProduct` entity type supports lineage descriptors, but the richness of what can be expressed (e.g., column-level lineage, transformation SQL, model parameters) is governed by the ORD spec version in use [FLAG — verify current spec version's `dataProduct` shape against [https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/)].
- Write-back through Dremio (the federation engine) to the lakehouse object store requires Dremio to have write privileges on the target namespace in Polaris. In read-heavy deployments, Dremio may be configured read-only; confirm write-path authorization before assuming write-back is available from any Dremio compute context.

---

## Cross-Cutting Notes for the Architect

**Confidence summary by theme:**

| Theme | Confidence in SAP-specific claims | Primary risk |
|---|---|---|
| Single governed catalog | Medium — SAP's "one catalog" intent is well-documented; "powered by Polaris" branding needs internal verification | Polaris vs. SAP Enterprise Catalog naming not confirmed in search results |
| Lineage to S/4HANA | Low–Medium — roadmap intent is clear, GA status of S/4HANA lineage is not | Publishing as GA before the feature is fully landed |
| Access control propagation | Medium — Polaris table-level + Datasphere row-level is sound; column-level is engine-specific | Overstating column-level enforcement as catalog-native |
| Write-back as governed products | Medium — ORD mechanism is solid and mandatory; AI-specific write-back automation is not confirmed as GA | Implying auto-registration; it requires explicit pipeline instrumentation |

**Open specifications to cite:**
- Iceberg Table Format spec: [https://iceberg.apache.org/spec/](https://iceberg.apache.org/spec/)
- Apache Polaris: [https://polaris.apache.org](https://polaris.apache.org)
- Iceberg REST Catalog OpenAPI: [https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml)
- Open Resource Discovery spec: [https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/) (SAP internal) / public mirror at [https://open-resource-discovery.github.io/](https://open-resource-discovery.github.io/)
- OpenLineage: [https://openlineage.io/spec](https://openlineage.io/spec)
- UniForm: [https://docs.delta.io/latest/delta-uniform.html](https://docs.delta.io/latest/delta-uniform.html) [TRAINING — verify current Delta Lake release docs]

</RESPONSE>