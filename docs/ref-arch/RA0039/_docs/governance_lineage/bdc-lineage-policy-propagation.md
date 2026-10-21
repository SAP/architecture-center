Here's what the EKX graph and internal SAP knowledge sources reveal about how BDC actually does lineage and policy propagation:

---

## How BDC Does Data Lineage

### The Mechanism: Datasphere Catalog as the Lineage Engine

BDC's lineage capability lives in the **SAP Datasphere Catalog**, which is embedded in BDC as the [Business Data Catalog](https://ekg.cloud.sap/SAP/LX/TM/TRM/BusinessDataCatalog498188E08B6961A5E10000000A421947). The catalog tracks:

- **Asset-to-asset relationships** — where data comes from and where it lands, end-to-end
- **Object and space dependencies** — a structured view of how Datasphere objects relate across spaces
- **Metadata enrichment** — [enriching data products with catalog metadata](https://ekg.cloud.sap/SAP/MXP/CM/RMI/EnrichingDataProductsWithCatalogMetadata) is explicitly modeled as an innovation capability in the graph

Lineage is **metadata-driven, not pipeline-driven** — it works by tracking semantic relationships between objects in the catalog rather than instrumenting each ETL step. According to internal Stack@SAP documentation, the catalog supports business and technical lineage: users can visualize source-to-target flows and directly navigate to dependent business objects. ([source](https://sap.stackenterprise.co/questions/33712))

**Scope today:** SAP Datasphere instances and SAP Analytics Cloud. **Roadmap:** expanding to SAP BW, SAP ECC, S/4HANA, and non-SAP sources via Collibra integration.

> For BCBS239-style end-to-end lineage across ABAP-based SAP systems, this is explicitly on the roadmap under the "one catalog" project — currently there's no automated technical code-scanning lineage (like Manta) — it's being built. ([source](https://sap.stackenterprise.co/questions/15015))

---

## How BDC Does Policy Propagation

### The Core Pattern: Policy Attached to Data Products, Not Pipelines

BDC's governance model is **product-centric**. The [Data Product](https://ekg.cloud.sap/SAP/BDC/DP) subsystem is the primary unit of governance in the EKX graph — policies are attached at the data product level and propagate **downstream automatically** to all consumers of that product.

Three mechanisms drive propagation:

**1. BDC Catalog lifecycle management**
The [One Data Catalog](https://ekg.cloud.sap/SAP/MXP/RME/PBC/OneDataCatalogForYourCompanyDataE09117b7Af504eeaB9faEd5fef70eb24) capability controls data connectivity management and monitoring **across the entire lifecycle** of a data product — from publication to consumption. Access policies defined in the catalog propagate to all downstream spaces and consumers automatically. ([source](https://cmicompeteone.wdf.sap.corp/asset/view/6177))

**2. Zero-copy semantic preservation**
BDC uses a **zero-copy** approach where data stays at the source system and semantic relationships (including the access controls and business context) are retained in-place. This means governance policy doesn't need to be re-applied after movement — it travels with the semantic metadata. ([source](https://cmicompeteone.wdf.sap.corp/asset/view/6175))

**3. Governed data-product gateway across runtimes**
Internally, BDC is positioned as the **governed data-product gateway** — governance policies defined in BDC are preserved when data products are consumed by AI runtimes, hyperscaler services (BigQuery BDC Connect, planned AWS Athena), or third-party tools. The CMI State of the Market document (Aug 2026) explicitly states: *"Define cloud-specific placement guidance and preserve governance policy across AI runtimes."* ([source](https://cmicompeteone.wdf.sap.corp/asset/view/7031))

---

## Architectural Summary

```
Source Systems (S/4HANA, Ariba, non-SAP)
        │
        ▼
  Data Products (BDC/DP) ← policies attached here
        │
        ▼
  Business Data Catalog ← lineage tracked here, policies propagated
        │
     ┌──┴──┐
     ▼     ▼
   SAC   AI Runtimes / Hyperscalers / Third-party
         (governance policy preserved across boundaries)
```

---

**Key gaps to be aware of (Guilherme):**
- Field-level / code-scan lineage for ABAP sources is not yet production-ready — roadmap item
- Non-SAP lineage depends on Collibra integration which is "forthcoming" per the battlecard materials
- Policy propagation to non-SAP consumers relies on the **Delta Sharing protocol** — the enforcement boundary is the BDC data product API, not a push to the consumer system