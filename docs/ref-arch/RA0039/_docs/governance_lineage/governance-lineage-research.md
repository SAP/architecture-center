## Governance & Lineage — Supporting Technical Material

**Note on sourcing:** All claims below are grounded in current external research (Apache Polaris docs, Apache Iceberg spec, OpenLineage spec, ORD spec). Confidence flags are inline. SAP-internal mechanics (how BDC wires these together) are not independently verifiable from public sources and are flagged accordingly.

## 1. The Catalog as a Single Governed Plane

### What Makes It Work

**Apache Polaris** (Apache TLP since February 2026, latest stable 1.8.0) implements the [Apache Iceberg REST Catalog spec](https://iceberg.apache.org/docs/nightly/rest-protocol/). The governance model is a **four-level RBAC chain**:

```
Privilege → Catalog Role → Principal Role → Principal
```

Privileges are never granted directly to a principal. The chain is always traversed. Polaris enforces this **at the catalog API boundary** — authorization is checked before metadata or credentials are returned to any engine.

Two key privilege types gate data access:
- `TABLE_READ_DATA` — required before Polaris issues read credentials.
- `TABLE_WRITE_DATA` — required before write credentials are issued.

Metadata-only privileges (`TABLE_LIST`, `TABLE_READ_PROPERTIES`, etc.) do not produce storage tokens.

**Credential vending** is how Polaris converts logical access control into storage-level enforcement. When an authorized engine calls `loadTable` (with header `X-Iceberg-Access-Delegation: vended-credentials`), Polaris:
1. Verifies the RBAC chain.
2. Calls the cloud IAM service (AWS STS `AssumeRole`, Azure User Delegation SAS, GCS Credential Access Boundary downscoped token).
3. Returns **short-lived, prefix-scoped credentials** covering only that table's storage path.

Credentials are path-scoped: an engine authorized for `table_A` cannot read `table_B`'s files even if both are in the same bucket. 
[Sources: [polaris.apache.org/in-dev/unreleased/access-control](https://polaris.apache.org/in-dev/unreleased/access-control/), [polaris.apache.org — vended credentials](https://polaris.apache.org/in-dev/unreleased/vended-credentials/), [Dremio access control blog](https://www.dremio.com/blog/access-control-in-apache-polaris-rbac-and-credential-vending/)]

**Versioning** in Polaris is snapshot-based, inherited from the Iceberg table format. Polaris stores and atomically swaps the current metadata pointer for each table. Iceberg's `metadata.json` retains the full snapshot chain (`snapshot-id`, `parent-snapshot-id`, `timestamp-ms`, `sequence-number`), schema history (all prior schemas with stable field IDs), partition spec history, and a `metadata-log` of every prior metadata file version. Time travel is available against any prior snapshot.
[Source: [iceberg.apache.org/spec](https://iceberg.apache.org/spec/)]

**ORD (Open Resource Discovery)** — v1.16.4, maintained by Linux Foundation Europe / NeoNephos under Apache 2.0 — provides the discovery and registration layer above the catalog. Each data product is described with an `ordId`, a SemVer `version`, and a `releaseStatus` field (`development → beta → active → deprecated → sunset`). The ORD major-version fragment in the ID provides a stable reference boundary for consumers: a consumer wiring to `v1` is shielded from breaking changes until it explicitly migrates. Polaris governs the physical table; ORD governs the product's declared lifecycle and discoverability.
[Sources: [sap.github.io/open-resource-discovery](https://sap.github.io/open-resource-discovery/), [open-resource-discovery.github.io/specification/spec-v1](https://open-resource-discovery.github.io/specification/spec-v1)]

### How It Works Mechanically

1. A data product is registered in the SAP Enterprise Catalog (Polaris) with namespace/table privileges assigned to principal roles that correspond to consumer groups.
2. The product's ORD document is published (via pull by the ORD Aggregator), recording `releaseStatus`, `version`, `visibility`, `outputPorts`, and `inputPorts`.
3. Any engine — Dremio, Spark, Flink, Trino, and external platforms reading via the Iceberg REST endpoint — must authenticate to Polaris (OAuth2 client credentials → bearer token) and have `TABLE_READ_DATA` to receive vended credentials.
4. Iceberg's snapshot model means every read against the catalog is reproducible and auditable: querying a specific snapshot ID returns exactly the same result set.

### Architect Watch Points

- **No self-service UI in Polaris.** Polaris is an API/CLI control plane only. Business users need a separate catalog UI layer on top.
- **Snapshot lifecycle management is not handled by Polaris.** `expireSnapshots` must be run via a compute engine (Spark, Trino). Expired snapshots cannot be time-traveled. Set `write.metadata.previous-versions-max` deliberately; the default is 100 metadata file versions.
- **ORD `inputPorts` are BETA** in the current spec; treat them as declared intent, not enforced lineage contracts.
- **CVE-2026-42811** (GCS vended credentials): a crafted table name could expand the credential scope to the whole bucket. Verify Polaris is on a patched release before production deployment. [Source: [cve.org — CVE-2026-42811](https://www.cve.org/CVERecord?id=CVE-2026-42811)]

### Realistic Limitations

- Polaris enforces at the **object (table/namespace) level**, not the data (row/column) level. A principal authorized for `TABLE_READ_DATA` receives prefix-scoped storage credentials covering all rows and columns in that table's Parquet files.
- There is no native multi-engine snapshot lifecycle coordination in Polaris. Compaction, `expireSnapshots`, and orphan file cleanup must be orchestrated externally.

---

## 2. Lineage Traced Back to Source

### What Makes It Work

Iceberg natively provides **intra-table version lineage** through its metadata structure. Every snapshot records:

| Field | Where | Value |
|---|---|---|
| `snapshot-id` | `metadata.json` | Unique ID for this table version |
| `parent-snapshot-id` | Same | Linked-list chain through all prior versions |
| `sequence-number` (v2+) | Same | Monotonic total order across all commits |
| `timestamp-ms` | Same | Wall-clock commit time |
| `operation` (in `summary`) | Same | `append`, `overwrite`, `delete`, `replace` |
| `added-records`, `deleted-records` | Same | Row delta per commit |

Manifest files extend this to file-level provenance: each data file entry records the snapshot that added it, its storage path, partition, and column-level statistics (min/max/null counts). This makes any snapshot **exactly reproducible** — enumerate the manifest list, enumerate manifests, enumerate files.

**Schema evolution history** is also retained in `metadata.json` as an array of all prior schemas with stable column `field-id` integers. This means column identity is preserved through renames and reorders, enabling lineage tools to track columns across schema changes.

**Iceberg v3 row lineage** (`_row_id` and `_last_updated_sequence_number`) is now mandatory for v3 tables. `_row_id` is a globally unique, compaction-stable row identifier assigned at first insert, enabling row-level CDC and fine-grained auditability. ⚠️ Upgrading v2 tables to v3 is **irreversible** and requires all engines in the stack to support v3 before proceeding.
[Sources: [iceberg.apache.org/spec](https://iceberg.apache.org/spec/), [AWS blog — Iceberg v3 row lineage](https://aws.amazon.com/blogs/big-data/accelerate-data-lake-operations-with-apache-iceberg-v3-deletion-vectors-and-row-lineage/)]

**Cross-table and cross-system lineage** is not native to Iceberg and requires external tooling. The de-facto open standard is **[OpenLineage](https://openlineage.io/)** (CNCF / LF AI & Data). The Spark and Flink OpenLineage agents emit structured `RunEvent` JSON payloads when writing Iceberg tables, including:
- `IcebergScanReportInputDatasetFacet` — which snapshot ID was read, schema ID, files/manifests scanned, projected columns.
- `IcebergCommitReportInputDatasetFacet` — snapshot ID created, added/removed file counts, record counts.
- `ColumnLineageDatasetFacet` — output column → input column mapping (requires Spark 3+ with agent opt-in).

The snapshot ID in the OpenLineage event is the bridge between the lineage graph (which job wrote what) and the Iceberg metadata (the immutable record of what was written).

For the SAP BDC Lakehouse context, the source system reference is carried at two levels:
- **ORD `inputPorts`** — the ORD data product descriptor explicitly encodes upstream integration dependencies (declared lineage). ORD carries extraction system, data provider, and system instance metadata fields.
- **Iceberg table properties** — `source-system`, `source-table`, `extraction-pipeline-version` etc. can be set as custom table properties. These are advisory (the spec notes `properties` is not intended for arbitrary metadata), but durable: stored in `metadata.json` and readable by any Iceberg-aware tool.

[Sources: [openlineage.io/docs/integrations/spark/dataset_metrics](https://openlineage.io/docs/integrations/spark/dataset_metrics/), [openlineage.io/docs/integrations/flink](https://openlineage.io/docs/integrations/flink/), [sap.github.io/open-resource-discovery/details/articles/data-product](https://sap.github.io/open-resource-discovery/details/articles/data-product)]

### How It Works Mechanically

1. The Bronze layer table for an S/4HANA extraction carries Iceberg table properties encoding the source system, source table name, and extraction timestamp.
2. Every pipeline that reads from Bronze and writes Silver emits OpenLineage events carrying the Iceberg snapshot IDs of both input and output tables, binding the lineage graph to the immutable table history.
3. The ORD `inputPorts` on the Silver data product declare the ORD integration dependencies back to the Bronze source, making the dependency graph discoverable via the ORD Aggregator.
4. A lineage consumer (DataHub, OpenMetadata, or a custom lineage store receiving OpenLineage events) can traverse: S/4HANA table → Bronze snapshot → Silver snapshot → Gold snapshot → BI report.

### Architect Watch Points

- **OpenLineage column-level lineage requires explicit agent configuration** and is disabled by default in the Spark integration. It requires opt-in and adds query planning overhead.
- **Snapshot expiry destroys time-travel lineage.** If `expireSnapshots` removes a snapshot that a lineage graph references, the reproducibility guarantee for that version is lost. Use tagged snapshots with explicit retention (`max-ref-age-ms`) for compliance-relevant versions.
- **ORD `inputPorts` are BETA** (as of ORD v1.16.x); field semantics may evolve.
- ⚠️ **Confidence note:** How the BDC SAP-managed extraction pipeline (Bronze ingest from S/4HANA) exposes OpenLineage events or ORD input port metadata is not independently verifiable from public sources. The mechanisms above are technically sound but their specific wiring in BDC is an internal implementation detail.

### Realistic Limitations

- **Iceberg provides no native cross-table lineage.** The table format records what happened inside a table, not where data came from.
- **Column-level lineage from Spark is opt-in, not guaranteed.** For complex transformations (UDFs, ML feature pipelines), the AST-based column lineage extraction may be incomplete or absent.
- **ORD input ports are declared by the producer.** There is no enforcement that the declared dependency matches the actual pipeline. Accuracy depends on producer discipline.

---

## 3. Access Control and Policy Propagation

### What Makes It Work

Policy propagation operates at three distinct enforcement layers, each with different scope and guarantees:

**Layer 1 — Catalog RBAC (Polaris, strongest and most consistent):**  
Table- and namespace-level access is enforced uniformly for every engine that speaks the Iceberg REST Catalog spec. Polaris blocks `loadTable` for any principal without `TABLE_READ_DATA` and issues prefix-scoped vended credentials. This layer is **engine-agnostic and consistent** — Dremio, Spark, Trino, Snowflake, and external engines all pass through the same RBAC check.

**Layer 2 — Iceberg REST `read-restrictions` (emerging, new in 2026):**  
The Apache Iceberg REST Catalog spec now includes a `read-restrictions` field in the `loadTable` response. A catalog can embed:
- `required-row-filter`: an Iceberg predicate; rows failing this filter must not appear in results.
- `required-column-projections`: nine defined masking actions applied per column by field ID.

Row filter is evaluated on **original, unmasked values** before column projections are applied (order matters for policy composability). This is now in the open Iceberg REST spec, not a vendor extension.

⚠️ **Confidence note: HIGH that the spec was merged; MEDIUM on production engine adoption breadth.** This is very recently merged (2026). Engine implementations are in flight. Enforcement depends on the engine being a **trusted, compliant reader** — there is no cryptographic guarantee that a non-compliant engine cannot read the raw Parquet bytes. The spec framing is a trusted-compute-layer model, not zero-trust.
[Sources: [Google Open Source Blog — Iceberg read-restrictions](https://opensource.googleblog.com/2026/10/standardizing-fine-grained-access-control-in-apache-icebergs-rest-catalog.html), [Snowflake engineering blog](https://www.snowflake.com/en/blog/engineering/apache-iceberg-read-restrictions-governance0/), [iceberg.apache.org/docs/nightly/rest-protocol](https://iceberg.apache.org/docs/nightly/rest-protocol/)]

**Layer 3 — Engine-level enforcement (Dremio, today's primary mechanism for column-level):**  
Dremio implements column masking via **UDF-based masking policies** and row-level security via predicate UDFs, attached to Iceberg tables with `ALTER TABLE ... ALTER COLUMN ... SET MASKING POLICY`. Masking evaluates `query_user()` and `is_member()` at query time. Authorized users see original values; others see masked results.

⚠️ **Critical limitation:** Dremio's masking policies are Dremio-engine-enforced. A Spark or Trino job reading the same underlying Parquet files directly bypasses Dremio's masking entirely. Engine-level FGAC is consistent only within that engine.
[Source: [Dremio docs — ALTER TABLE masking](https://docs.dremio.com/25.x/reference/sql/commands/alter-table/), [Dremio blog — row/column access controls](https://www.dremio.com/blog/new-row-level-and-column-level-access-controls/)]

**Policy authorization extension (OPA, Ranger):**  
Polaris 1.5+ exposes an **Authorizer SPI** that routes authorization decisions to an external policy engine (OPA, Ranger). `polaris-extensions-auth-ranger` was announced in the Polaris 1.5.0 release (May 2026), enabling Apache Ranger tag-based and attribute-based policies to govern Polaris catalog access. OPA integration allows Rego-based ABAC.

⚠️ **Confidence: MEDIUM.** Ranger + Polaris integration was announced; limited production documentation available as of research date.
[Sources: [polaris.apache.org/in-dev/unreleased/managing-security/external-pdp/opa](https://polaris.apache.org/in-dev/unreleased/managing-security/external-pdp/opa/), [Apache Polaris 1.5.0 release announcement](https://lists.apache.org/thread/wcokv8nt5jcktd5203d1t2bx2wmxsrdp)]

### How It Works Mechanically

1. A data governance team defines RBAC policy in Polaris: principal roles map to catalog roles, catalog roles hold `TABLE_READ_DATA` on specific namespaces.
2. Optionally, `read-restrictions` (row filter + column projections) are set on the Polaris catalog entry for sensitive tables.
3. A consumer engine authenticates via OAuth2, calls `loadTable` — Polaris checks RBAC, returns vended credentials (prefix-scoped to that table), and includes `read-restrictions` if set.
4. A compliant engine (once `read-restrictions` is widely implemented) applies the row filter and column masking before returning results. Non-compliant engines today must enforce through views or engine-native policy.
5. For Dremio as the primary query engine, column masking UDFs provide the practical FGAC layer today.

### Architect Watch Points

- **Cross-engine policy consistency is an open problem today.** Table-level RBAC through Polaris is consistent across all engines. Row/column policies are not: Dremio masks, Spark by default does not.
- **Vended credentials are file-scoped, not row-scoped.** An engine with a valid vended credential can read the full Parquet files if it chooses to ignore `read-restrictions`. Storage-level enforcement stops at the prefix.
- **Service principal impersonation gap.** If a Spark cluster uses a shared service account to connect to Polaris, `read-restrictions` evaluates against the service account identity — not the individual human user making the query. Per-user row filters require user impersonation to be threaded through to the catalog call.
- **If a column masking UDF referenced in Dremio is dropped**, the table becomes unreachable in Dremio until the policy is dropped or recreated. Operational risk.
- **No tag-based ABAC is native to Polaris today** (as of 1.8.x). It requires external authorizer (OPA/Ranger) and is a roadmap item for native support.

### Realistic Limitations

The current practical state (summarized bluntly):

| Capability | Status |
|---|---|
| Table/namespace RBAC across all engines | Consistent — Polaris handles it |
| Vended credential storage scoping | Consistent — cloud IAM handles it |
| Row-level filtering across all engines | Inconsistent — engine-specific today; `read-restrictions` spec offers a path but engine adoption is incomplete |
| Column masking across all engines | Inconsistent — same situation |
| Tag-based ABAC | Not native to Polaris; requires OPA/Ranger authorizer extension |
| Cross-catalog policy portability | Gap — Snowflake explicitly acknowledges policies don't auto-carry across catalog boundaries |

---

## 4. Write-Back as Governed Products

### What Makes It Work

The governed write-back pattern treats AI inference outputs and analytics results as first-class Iceberg tables registered in the same catalog, carrying the same lineage and access control as upstream data products. It requires assembling four layers:

**1. Iceberg as the output format:**  
Write-back chooses the Iceberg operation type based on AI output semantics:
- `INSERT INTO` (append-only): prediction audit log, inference history — immutable, full snapshot chain.
- `MERGE INTO`: entity-level latest score (customer credit risk, device health) — ACID upsert, no duplicates.
- `INSERT OVERWRITE`: full batch recomputation replacing a partition — atomic swap, readers never see partial results.
- Flink Iceberg sink (exactly-once): streaming inference — real-time data product with snapshot isolation.

Iceberg's Write-Audit-Publish (WAP) pattern (`write.wap.enabled = 'true'`) enables **pre-publish validation gates**: the pipeline writes to a staging branch, quality/compliance checks run, and only a passing commit is promoted to `main`. This is a native Iceberg governance primitive.
[Source: [iceberg.apache.org/docs/latest/branching](https://iceberg.apache.org/docs/latest/branching/)]

**2. Lineage attached at write time:**  
Three mechanisms should be layered:
- **OpenLineage runtime events** — the Spark/Flink job emits a `COMPLETE` RunEvent with the output Iceberg table as an output dataset, the training table as an input dataset, and the Iceberg snapshot ID binding the event to the immutable table version. `ColumnLineageDatasetFacet` records which input features drove which output columns. MLflow `log_input()` records the training dataset URI and digest against the model run.
- **Iceberg table properties** — durable in `metadata.json`: `owner`, `data-product.name`, `data-product.version`, `lineage.pipeline`, `lineage.mlflow-run-id`, `lineage.training-table`, `lineage.model-uri`.
- **Iceberg snapshot summary** — custom key-value pairs injected into the snapshot's `summary` map at commit time (Spark: `spark.datasource.iceberg.snapshot-property.*`), storing pipeline version, run ID, and environment.

⚠️ **Confidence note:** Iceberg table properties and snapshot summary annotations are conventions — there is no spec-enforced schema for them. They are durable and readable by any Iceberg tool, but their interpretation is tooling-dependent.

**3. Catalog registration and access control:**  
The output table is registered in Polaris under the appropriate medallion namespace (Gold for consumer-facing derived products). `GRANT` statements assign it to consumer principal roles. ORD registration publishes the product with `releaseStatus: active`, `outputPorts` pointing to the Gold Iceberg table, and `inputPorts` declaring the Silver/model dependencies for declared lineage.

**4. Model registry linkage (where applicable):**  
MLflow 2.1+ with Unity Catalog: registering the model as a Unity Catalog object creates a **table-to-model lineage edge** visible in the UC lineage graph. The model, its training data, and its inference output table are all linked catalog objects with grants, lineage, and audit trail.
[Source: [openlineage.io/docs/spec/facets](https://openlineage.io/docs/spec/facets/), [AWS blog — EMR + SageMaker lineage](https://aws.amazon.com/blogs/big-data/capture-data-lineage-of-amazon-emr-spark-jobs-into-amazon-sagemaker-unified-studio/)]

### How It Works Mechanically

1. The inference pipeline writes to an Iceberg Gold table via `INSERT INTO` or `MERGE INTO`.
2. The OpenLineage Spark agent emits a lineage event referencing the Silver feature table (input snapshot ID) and the Gold inference table (output snapshot ID).
3. Iceberg table properties are set at table creation declaring ownership, data product version, and pipeline references.
4. The table is registered in Polaris; access grants are applied; ORD registration is published.
5. The lineage backend (DataHub, OpenMetadata, or equivalent) ingests the OpenLineage event and builds the end-to-end graph: S/4HANA → Bronze → Silver features → Gold inference results.
6. Downstream BI tools or agents query the Gold table through Dremio (or directly through Polaris), seeing the same governance controls as any other product in the catalog.

### Architect Watch Points

- **MLflow run ID and model version are not enforced in Iceberg table properties.** If the pipeline doesn't set them, the lineage gap is invisible — there is no schema validation on table properties.
- **WAP staging branches must be explicitly managed.** Orphaned staging branches accumulate storage; integrate branch cleanup into the pipeline lifecycle.
- **OpenLineage column-level lineage from ML pipelines is frequently incomplete** for non-SQL transformations (e.g., Python-based feature engineering, model scoring). The `ColumnLineageDatasetFacet` requires explicit instrumentation beyond the standard Spark agent.
- **ORD registration of AI output products as `DataProduct` resources** is architecturally the right contract — it makes the product discoverable to the ORD Aggregator and downstream tooling. The `inputPorts` should reference the model artifact (or its training data product) to close the lineage loop at the product level. ⚠️ The precise mechanics of how ORD `inputPorts` reference a non-data-table artifact (an ML model) are not defined in the current published ORD spec; this may require custom `dataProductLinks` until the spec matures.

### Realistic Limitations

- **End-to-end governed write-back is an assembly problem, not a turnkey feature.** The components (Iceberg, OpenLineage, Polaris, ORD, MLflow) are all open and available, but their integration requires explicit pipeline instrumentation. There is no single orchestration layer that does it automatically.
- **Lineage completeness degrades with Python-based inference pipelines.** SQL transformations are well-covered by OpenLineage; custom Python scoring code requires explicit `log_input()` and manual table property setting.
- **AI output products are only as governed as the pipeline that produces them.** If a team writes directly to the Gold namespace bypassing OpenLineage or ORD registration, the output table is in the catalog but lacks lineage. Enforcement requires pipeline templates or CI/CD gates, not just format-level guarantees.

---

## Cross-Cutting Notes for the Author

1. **UniForm in this architecture:** UniForm (Delta + Iceberg simultaneous materialization) resolves the engine-access problem — external platforms (Databricks, Snowflake, hyperscalers) read the same Iceberg metadata without copies. The Polaris catalog governs the Iceberg view of the table. UniForm has material limitations: no Iceberg writes (Delta is always the write path), deletion vectors are incompatible with UniForm, async metadata generation can leave stale Iceberg metadata on short-lived clusters. These are relevant to the governance section because Iceberg governance features (WAP branches, `read-restrictions`) apply to the Iceberg reader view, not to the underlying Delta write path.

2. **`read-restrictions` is the most significant near-term governance development.** The spec was merged in 2026 and represents the ecosystem's first standardized mechanism for cross-engine column masking and row filtering at the catalog level. Engine adoption is the current bottleneck. Worth calling out as a trajectory item.

3. **ORD maturity nuance:** ORD is GA and production-deployed across the SAP product portfolio. The `DataProduct` resource type is in production use in BDC but some fields (`inputPorts`) remain BETA. Adoption outside the SAP ecosystem is limited; the spec is governed by Linux Foundation Europe under ApeiroRA / NeoNephos as of 2025.

</RESPONSE>