# Dremio Cloud Governance & Lineage — Documentation Reference

Faithful transcription of the official Dremio Cloud documentation, captured 2026-10-05.
Each section is headed by its source URL. Content reflects what the documentation states.

---

## Governance overview

Source: https://docs.dremio.com/dremio-cloud/manage-govern/

Dremio provides the following capabilities to manage and govern data:

- **Role-Based Access Control (RBAC)** — Manage access to datasets through roles rather
  than individual user grants for easier administration.
- **Roles** — Containers for assigning privileges to control user access to data
  resources.
- **Privileges** — Assign privileges to roles, simplifying management and ensuring users
  only have access to what they need.
- **Row-Access and Column-Masking Policies** — Apply fine-grained access controls to
  protect sensitive data using row-access and column-masking policies.
- **Lineage** — Track and visualize how data flows through your lakehouse, from source to
  consumption.
- **Wikis** — Enrich data understanding by documenting datasets with wikis, using
  Generative AI automation.
- **Labels** — Enhance data discoverability and searchability by categorizing datasets
  with labels, via AI-assisted generation.

---

## Roles

Source: https://docs.dremio.com/dremio-cloud/security/roles/

### System roles

- **ADMIN** — Designed for administrative users who require superuser/global access.
  Users who are assigned this role are granted every privilege across all objects and
  resources in an organization.
- **PUBLIC** — Assigned by default to all new users added to the organization and cannot
  be revoked from any user. Carries USAGE privileges on engines and OAuth apps.

### Custom roles

User-defined roles created by administrators or users with the CREATE ROLE privilege.

### Role hierarchy

Child roles automatically inherit all privileges from their parent roles, creating a
cascading effect that simplifies privilege management. The limit is 10 nested roles in a
hierarchy.

### SQL syntax

- `GRANT ROLE role_name TO USER 'email@domain'` — assign role to users
- `GRANT ROLE child_role TO ROLE parent_role` — create role hierarchy
- `REVOKE ROLE` — remove role assignments
- `CREATE ROLE` and `DROP ROLE` — manage roles

SELECT and ALTER privileges are not granted for any sources and must be assigned by a
user with the ADMIN role.

---

## Privileges

Source: https://docs.dremio.com/dremio-cloud/security/privileges/

Dremio provides a range of privileges for each type of securable object. These privileges
work together to control access across your organization.

### Key concepts

**Grants.** Dremio privileges are granted to users and roles. Users possess all the
privileges granted to their user identity and their roles. See GRANT TO USER and
GRANT TO ROLE for example grants.

**Privilege inheritance.** Dremio uses a hierarchical privilege system where most
higher-level privileges apply to all objects within their scope:

```
Organization → Projects → Sources → Folders → Tables, Views, and Visualizations
```

When you grant a privilege at a higher level, it applies to all relevant objects at lower
levels. For example, granting SELECT at the project level gives SELECT access to all
datasets in that project across all sources.

**Ownership and object creation.** The OWNERSHIP privilege is unique — it applies only to
the specific object where it's assigned and is never inherited by nested objects. When you
create any object, you automatically become its owner. This design maintains clear
ownership boundaries, so a project owner doesn't automatically own every table in that
project. OWNERSHIP grants full control of the specific object. Ownership can be transferred
using the GRANT OWNERSHIP command.

**Sharing data through views.** When you create a view based on a table, you become the
owner of that view. Your privileges as the view owner determine whether the view can access
the underlying table — creating a privilege chain. You can then grant other users access to
your view, allowing them to see the table's data even though they don't have direct
permission to access that table themselves. However, if you (or whoever last modified the
view) lose access to the underlying table, the entire privilege chain breaks and the view
stops working for everyone.

### Organization privileges

Organization privileges are the highest level in the hierarchy and control
organization-wide operations and resources.

| Privilege Type | Description |
|---|---|
| ALL | Shorthand to grant all supported privileges except OWNERSHIP. |
| CALL MODEL | Use the AI models available across all model providers. The PUBLIC role has this privilege on the organization by default, but it can be revoked. |
| CONFIGURE BILLING | Create and manage billing accounts for usage invoices. |
| CONFIGURE SECURITY | Configure organization security features including identity providers, external token providers, and custom OAuth applications. |
| CREATE MODEL PROVIDER | Create model providers for the organization. |
| CREATE PROJECT | Create new projects, each including an Open Catalog. |
| CREATE ROLE | Create and edit roles. See Custom Roles for details. |
| CREATE USER | Create and edit users. See Add a User for details. |
| MANAGE GRANTS | Grant or revoke privileges on the organization and all objects it contains. |
| OWNERSHIP | Full control of the organization; not inherited by nested objects. |

### Project privileges

Project privileges control access to projects and apply to different categories of objects
within the project. These privileges provide broad control across all sources, catalogs,
and engines in the project.

| Privilege Type | Applies To | Description |
|---|---|---|
| OWNERSHIP | Project | Full control of the project. |
| UPLOAD FILE | Project | Upload files to the project, including adding local files to AI agent chats. |
| USAGE | Project | Access the project and its engines. Required for any other project operations. |
| VIEW JOB HISTORY | Project | View the job history page for all users across the entire project. |
| CREATE SOURCE | Sources | Create new data sources and modify source configurations throughout the project. |
| EXTERNAL QUERY | Sources | Run external queries on compatible sources. |
| ALTER | Datasets | Edit definitions, settings, wikis, and manage metadata. Create or remove folders and datasets where supported. |
| CREATE TABLE | Datasets | Create tables using CREATE TABLE and CREATE TABLE AS on sources that support table creation. |
| DELETE, INSERT, TRUNCATE, UPDATE | Datasets | Execute DML operations on Apache Iceberg tables in compatible object storage. |
| DROP | Datasets | Remove tables and folders from all sources that support deletion operations. |
| SELECT | Datasets | Query contained datasets and view schema definitions, lineages, wikis, and labels. |
| ALTER REFLECTION | Reflections | Create, edit, and view all Reflections across the project. Includes access to Reflection pages, API endpoints, and job history. |
| VIEW REFLECTION | Reflections | View all Reflections across the project, including pages, API endpoints, and job history. |
| MODIFY | Engines | Complete engine management including workload settings, routing, and queues. Includes MONITOR and OPERATE. |
| MONITOR | Engines | View all engine settings including replicas, auto-stop settings, time limits, and tags across all engines. |
| OPERATE | Engines | Start, stop, enable, and disable all engines in the project. |
| MANAGE GRANTS | All Objects | Grant and revoke privileges on the project and all objects it contains. |

### Open Catalog privileges

Open Catalog is a specialized source whose privileges control access to folders and
datasets within the catalog. You can grant each of these privileges at the indicated
scopes:

- **Catalog scope:** Privileges are granted on the catalog and apply to all the catalog
  folders and datasets.
- **Folder scope:** Privileges are granted to a specific folder and apply to all contained
  folders and datasets.
- **Dataset scope:** Privileges are granted to a single table or view and apply only to
  that dataset.

| Privilege Type | Catalog Scope | Folder Scope | Dataset Scope | Description |
|---|---|---|---|---|
| ALL | ✔ | ✔ | ✔ | Shorthand to grant all supported privileges except OWNERSHIP. |
| ALTER | ✔ | ✔ | ✔ | Edit contained table definitions, settings, wikis, and manage metadata operations. Add folders. |
| ALTER REFLECTION | ✔ | ✔ | ✔ | Create, edit, and view Reflections on contained datasets, including pages, APIs, and job history. |
| DROP | ✔ | ✔ | | Remove contained datasets and folders. |
| MANAGE GRANTS | ✔ | ✔ | ✔ | Grant and revoke privileges on contained objects. |
| OWNERSHIP | ✔ | ✔ | ✔ | Full control; not inherited by nested objects. |
| READ METADATA | ✔ | ✔ | ✔ | View metadata including column information and job history, limited to jobs you have permission to see. |
| SELECT | ✔ | ✔ | ✔ | Query contained datasets and view schema definitions, lineages, wikis, and labels. |
| USAGE | ✔ | ✔ | | Use the immediate space or folder. Must be granted on every folder in the hierarchy path. |
| VIEW REFLECTION | ✔ | ✔ | ✔ | View Reflections on contained datasets, including pages, APIs, and job history. |
| WRITE | ✔ | ✔ | ✔ | Execute write operations INSERT, UPDATE, TRUNCATE, DELETE, and OPTIMIZE on contained Apache Iceberg tables. |

### Source privileges

Source privileges control access to external data sources and datasets. All sources and
other catalogs utilize these privileges in Dremio. You can grant each of these privileges
at the indicated scopes:

- **Source scope:** Privileges are granted on the source and apply to all the source
  folders and datasets.
- **Folder scope:** Privileges are granted to a specific folder and apply to all contained
  folders and datasets.
- **Dataset scope:** Privileges are granted to a specific table or view and apply only to
  that dataset.

| Privilege Type | Source Scope | Folder Scope | Dataset Scope | Description |
|---|---|---|---|---|
| ALL | ✔ | ✔ | ✔ | Shorthand to grant all supported privileges except OWNERSHIP. |
| ALTER | ✔ | ✔ | ✔ | Edit contained dataset definitions, settings, wikis, and manage metadata. Add or remove folders, promote or demote tables. |
| ALTER REFLECTION | ✔ | ✔ | ✔ | Create, edit, and view all Reflections on contained datasets, including pages, APIs, and job history. |
| CREATE TABLE | ✔ | ✔ | | Create new tables using CREATE TABLE and CREATE TABLE AS (requires source to support table creation). |
| DELETE, INSERT, TRUNCATE, UPDATE | ✔ | ✔ | ✔ | Execute associated DML operations DELETE, INSERT, TRUNCATE, UPDATE on all contained Apache Iceberg tables (requires compatible object storage). |
| DROP | ✔ | ✔ | | Remove contained datasets and folders (requires source deletion support). |
| EXTERNAL QUERY | ✔ | | | Run external queries on compatible sources. |
| MANAGE GRANTS | ✔ | ✔ | ✔ | Grant and revoke privileges on contained objects. |
| MODIFY | ✔ | | | Access and modify configuration settings, connection parameters, and source-level properties. |
| OWNERSHIP | ✔ | ✔ | ✔ | Full control; not inherited by nested objects. |
| READ METADATA | ✔ | ✔ | ✔ | View metadata including column information and job history, limited to jobs you have permission to see. |
| SELECT | ✔ | ✔ | ✔ | Query contained datasets and view schema definitions, lineages, wikis, and labels. |
| VIEW REFLECTION | ✔ | ✔ | ✔ | View Reflections on contained datasets, including pages, APIs, and job history. |

### User-Defined Function privileges

User-defined functions (UDFs) allow you to create reusable custom functions using SQL
expressions.

| Privilege Type | Description |
|---|---|
| ALL | Shorthand to grant all supported privileges except OWNERSHIP. |
| ALTER | Edit the function's wiki, definitions, and settings. |
| EXECUTE | Ability to run the UDF. Use the function as row-access and column-masking policies for tables and views. |
| MANAGE GRANTS | Grant and revoke privileges on the UDF. |
| OWNERSHIP | Full control of the UDF; not inherited by nested objects. |

### Engine privileges

Engine privileges control access to specific named engines. Use engine privileges at the
project level to manage all engines collectively.

| Privilege Type | Description |
|---|---|
| ALL | Shorthand to grant all supported privileges except OWNERSHIP. |
| MANAGE GRANTS | Grant and revoke privileges on the specific engine. |
| MODIFY | Access and modify all engine settings including replicas, auto-stop configuration, time limits, and tags. |
| MONITOR | View all engine settings and configuration details without modification rights. |
| OPERATE | Start, stop, enable, and disable the engine. |
| OWNERSHIP | Full control of the engine; not inherited by nested objects. |
| USAGE | Execute queries using the engine. The PUBLIC role has this privilege on all engines by default, but it can be revoked. |

### Model Provider privileges

Model provider privileges control access to AI model providers configured at the
organization level. These privileges determine who can use, manage, and configure model
providers for your organization.

| Privilege Type | Description |
|---|---|
| CALL MODEL | Use the AI models available. |
| MODIFY | Access and modify all model provider settings. |
| MANAGE GRANTS | Grant and revoke privileges on the model provider. |
| OWNERSHIP | Full control of the model provider. |

### Visualization privileges

Visualization privileges control access to saved visualizations in the catalog.
Privileges granted at the folder level are inherited by visualizations within that folder.

| Privilege Type | Description |
|---|---|
| ALTER | Edit the visualization's name, description, style, and underlying query. |
| MANAGE GRANTS | Grant and revoke privileges on the visualization. |
| OWNERSHIP | Full control of the visualization. |
| SELECT | View the visualization and its underlying data. |

### Script privileges

Script privileges enable sharing of individual saved scripts with other users and roles.

| Privilege Type | Description |
|---|---|
| ALL | Shorthand to grant all supported privileges except OWNERSHIP. |
| DELETE | Remove the script permanently. |
| MANAGE GRANTS | Grant and revoke privileges on the script. |
| MODIFY | Edit the script content and settings. |
| OWNERSHIP | Full control of the script; not inherited by nested objects. |
| VIEW | Access, view, and execute the script. |

### Identity Provider privileges

Identity provider privileges control access to organization-level authentication and
identity management settings.

| Privilege Type | Description |
|---|---|
| ALL | Shorthand to grant all supported privileges except OWNERSHIP. |
| MODIFY | Access and modify identity provider settings, including configuration changes and updates. |
| MONITOR | View all identity provider settings and configuration details without modification rights. |
| OWNERSHIP | Full control of the identity provider; not inherited by nested objects. |

---

## Row-Access and Column-Masking Policies

Source: https://docs.dremio.com/dremio-cloud/manage-govern/row-column-policies/

Row-access and column-masking policies may be applied to tables, views, and columns via
user-defined functions (UDFs). These are independent callable routines that accept
parameters and return values.

### Column-masking policies

Column-masking uses UDFs with scalar return types matching the column's data type.

```sql
CREATE FUNCTION protect_ssn (ssn VARCHAR(11))
  RETURNS VARCHAR(11)
  RETURN SELECT CASE
    WHEN query_user() = 'user@example.com' OR is_member('Accounting')
      THEN ssn
      ELSE CONCAT('XXX-XX-', SUBSTR(ssn, 8, 4))
  END;
```

Attached via `ALTER VIEW ... MODIFY COLUMN ... SET MASKING POLICY` or
`CREATE VIEW ... MASKING POLICY`.

### Row-access policies

Row-access uses boolean UDFs.

```sql
CREATE FUNCTION country_filter (country VARCHAR)
  RETURNS BOOLEAN
  RETURN SELECT query_user() = 'user@example.com'
    OR (is_member('Accounting') AND country = 'CA');
```

Attached via `ALTER TABLE ... ADD ROW ACCESS POLICY` or
`CREATE TABLE ... ROW ACCESS POLICY`.

### User context

Policies leverage querying user context through built-in functions like `query_user()`
and `is_member()`, which evaluate the current user's identity and role membership to
determine data visibility.

### Enforcement timing

Enforcement occurs during query planning, before execution. The system automatically
applies policies based on accessed tables/columns and their assigned UDFs.

---

## Lineage

Source: https://docs.dremio.com/dremio-cloud/manage-govern/lineage/

Lineage provides a graph of a dataset's relationships (its source, parent datasets, and
child datasets) to illustrate how datasets are connected.

- **Visual representation.** Dremio provides a visual lineage graph that displays datasets
  as nodes with their names and paths. The graph shows relationships between datasets in a
  connected format.
- **Navigation and focus.** The lineage view supports refocusing on different dataset
  nodes. Users can click a focus icon or select "Focus on this dataset" to reorient the
  graph around a different dataset.
- **Metadata layers.** The interface includes "Show/hide layers" options to view
  additional metadata beyond the core lineage relationships.
- **Impact analysis.** Supports both forward (child datasets) and reverse (parent datasets
  and data sources) dependency tracking.
- **Access method.** UI-based, accessed through the Dremio Cloud user interface under the
  Manage and Govern Your Data section, with interactive graph navigation capabilities.
- **Privilege requirements.** Access depends on user permissions (SELECT or READ METADATA
  privileges on related datasets).

---

## Lineage (Catalog API)

Source: https://docs.dremio.com/dremio-cloud/api/catalog/lineage/

The Lineage endpoint retrieves data lineage information for datasets, showing their
relationships within the data pipeline.

- **Method:** GET
- **Path:** `/v0/projects/{project_id}/catalog/{id}/graph`
- **Parameters:** `project_id` and `id` (dataset UUID)

The endpoint returns three types of relationships:

1. **Sources** — Information about sources the dataset uses. Each object in the `sources`
   array represents one source.
2. **Parents** — Information about parent objects of the dataset. Each object in the
   `parents` array represents one parent object.
3. **Children** — Information about other catalog objects that reference the dataset. Each
   object in the `children` array represents one child object.

Each returned object includes: `id`, `path`, `tag` (version UUID), `type`, `datasetType`
(PROMOTED for tables, VIRTUAL for views), and `createdAt` timestamp.

Returns 200 OK on success, with error codes for 400, 401, 403, and 404 scenarios.

---

## Wikis and Labels

Source: https://docs.dremio.com/dremio-cloud/manage-govern/wikis-labels/

- **Wikis** — Enrich data understanding by documenting datasets with wikis, using
  Generative AI automation.
- **Labels** — Enhance data discoverability and searchability by categorizing datasets
  with labels, via AI-assisted generation.
