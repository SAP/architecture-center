High-level requirements for governance and lineage in a lakehouse like BDC:

## 1. Single Governance Plane Across All Engines

**Requirement:** Policy must be defined once, at the catalog, and enforced for every engine that reads data — not duplicated per engine.

**Why it's hard:** Each query engine (Dremio, Spark, Trino, Snowflake, Databricks) has its own native security layer. Without a shared enforcement point, you end up with policy drift — the same table has different effective access rules depending on which engine reads it.

**What to watch:** Today, table- and namespace-level RBAC through Polaris is genuinely consistent across engines. Row-level and column-level security is not — engine-native implementations (Dremio UDF masking, Spark Ranger plugin) enforce only for their own engine. The emerging `read-restrictions` spec in the Iceberg REST Catalog is the architectural path to true cross-engine FGAC, but engine adoption is not yet complete.

---

## 2. Data Products Are Versioned and Have a Declared Lifecycle

**Requirement:** Consumers must be able to depend on a stable version of a data product, and the producing team must be able to evolve or deprecate it without silent breakage.

**What this means practically:**
- Every data product has a SemVer version and a lifecycle state (`development → beta → active → deprecated → sunset`).
- Breaking changes require a major version bump. Consumers wire to `v1`; a `v2` can coexist without forcing immediate migration.
- Deprecation carries a `sunsetDate` and a `successors` reference so consumers know where to move.

**Mechanism:** ORD provides this lifecycle contract. Iceberg's snapshot model provides the underlying immutable versioned history at the table level. These are complementary — ORD governs the *product contract*, Iceberg governs the *data history*.

---

## 3. End-to-End Lineage — Source to Consumer

**Requirement:** Every downstream insight must be traceable back to a trusted source system (e.g., S/4HANA), through every transformation layer.

**Three levels to satisfy:**
| Level | What it covers | Mechanism |
|---|---|---|
| **Table-level** | Which tables were read/written by which pipeline | OpenLineage (Spark/Flink agents) |
| **Column-level** | Which input columns drove which output columns | OpenLineage `ColumnLineageDatasetFacet` (opt-in, SQL transformations) |
| **Product-level (declared)** | Which upstream products a data product depends on | ORD `inputPorts` |

**What to watch:** These three levels are produced by different systems and need to be correlated in a lineage store (DataHub, OpenMetadata, etc.). Column-level lineage is incomplete for non-SQL pipelines (Python, ML scoring). Iceberg's snapshot IDs are the binding key between the OpenLineage graph and the immutable table history.

---

## 4. Access Control Defined at the Product, Not the Consumer

**Requirement:** Data policies must be attached to the data product itself and propagated to consumers — not configured separately in each consuming tool.

**What this means:**
- Table ownership, grants, and masking policies are set once on the product in the catalog.
- Any new engine or consumer that connects inherits those policies — it does not get an unguarded view of the raw data.
- Credential vending (short-lived, path-scoped storage tokens) ensures that even the storage layer reflects catalog-level access decisions.

**Current gap to acknowledge:** Column masking and row filtering are not yet fully portable across heterogeneous engines through Polaris alone. Today's practical pattern is: Polaris for table-level RBAC and credential scoping; Dremio engine-level masking for column/row FGAC. The `read-restrictions` spec is the path to closing that gap.

---

## 5. AI and Analytics Output Is a Governed Asset, Not a Dead-End Export

**Requirement:** Results written back by AI pipelines or analytics jobs must be registered as governed data products with full lineage — not exported to a file share or an unmanaged table.

**What "governed" requires:**
- The output table is registered in the catalog (Polaris) with the same RBAC as upstream products.
- The pipeline that produced it emitted OpenLineage events linking the output snapshot to its input tables and model version.
- The data product is registered in ORD with `inputPorts` pointing back to the source features or model artifact.
- Versioning and lifecycle state are set — so the output can be deprecated when the model is retrained.

**Key principle:** The same governance contract that applies to a Silver master-data product must apply to a Gold AI inference output. If it does not, "AI-powered insights" cannot be trusted or audited.

---

## Summary Table

| Requirement | Core mechanism | Main risk if skipped |
|---|---|---|
| Single governance plane | Apache Polaris (Iceberg REST Catalog RBAC) | Policy drift across engines |
| Product versioning and lifecycle | ORD `version` + `releaseStatus` + Iceberg snapshots | Silent breaking changes for consumers |
| End-to-end lineage | OpenLineage + Iceberg snapshot IDs + ORD `inputPorts` | No audit trail from insight back to source |
| Policy at the product, not the consumer | Polaris credential vending + `read-restrictions` | Access re-configured per tool; gaps inevitable |
| Governed write-back | Iceberg + OpenLineage + ORD registration | AI outputs are ungoverned and unauditable |