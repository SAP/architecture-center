---
sidebar_position: 6
slug: /diagrams
title: Diagram Best Practices
description: Enhance your diagramming expertise with this guide for the SAP Architecture Center. Learn best practices for creating Draw.io diagrams tailored to SAP solution architectures and Mermaid diagrams for process flows and visualizations. Ensure consistency and readability for your reference architecture content. Access official resources, templates, and examples to deliver visually compelling and technically accurate diagrams that elevate your SAP Architecture Center contributions.
sidebar_label: Diagramming
keywords:
    - sap
    - diagram
    - drawio
    - mermaid
image: img/ac-soc-med.png
tags:
    - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: jmsrpp
  date: 2025-05-01
---

# Diagram Best Practices

This guide provides best practices for creating and contributing diagrams to the SAP Architecture Center. It covers **Draw.io diagrams** for SAP solution architectures and **Mermaid diagrams** for flow-based visualizations. Follow these guidelines to ensure your diagrams are consistent, visually appealing, and easy to understand.

## Draw.io Diagrams for SAP BTP Solution Architectures

### When to Use Draw.io

Use **Draw.io diagrams** when:

-   Representing **SAP BTP services**, **cloud products**, or **technical landscapes**.
-   Creating **high-level solution architectures** that include SAP services, environments, and their interdependencies.
-   Following the **SAP BTP Solution Diagram Guidelines** to ensure consistency and adherence to SAP design principles.

### Best Practices for Draw.io Diagrams

1. **Use the SAP BTP Starter Kit**:

    - Download the [SAP BTP Solution Diagram Starter Kit](https://sap.github.io/btp-solution-diagrams/docs/solution_diagr_intro/big_picture/) for official icons, templates, and design elements.
    - The starter kit includes pre-configured libraries, reusable templates, and examples to help you get started quickly.

2. **Leverage Shape Libraries and Editable Presets**:
   - Access the [Draw.io Shape Libraries](https://github.com/SAP/btp-solution-diagrams/tree/main/assets/shape-libraries-and-editable-presets/draw.io) for foundational icons, integration suite icons, and more.
   - Use the [Editable Diagram Examples](https://github.com/SAP/btp-solution-diagrams/tree/main/assets/editable-diagram-examples) to explore reusable templates for common SAP BTP scenarios, such as:
     - SAP Build Work Zone (L2)
     - SAP Private Link Service (L2)
     - SAP Cloud Identity Services - Authentication (L2)

2. **Maintain Consistency**:

    - **Level 1 (L1)** diagrams: Provide a high-level overview of solution architectures, focusing on key components and their relationships.
    - **Level 2 (L2)** diagrams: Offer detailed technical representations, including service interactions, data flows, and integration points.
    - Use the same icon sizes, line styles, and text formatting across all diagrams.
    - Avoid creating custom arrows; use the ones provided in the starter kit.

3. **Optimize for Readability**:

    - Use **Level 1 or Level 2 diagrams** for detailed technical representations.

4. **Follow Repository Structure**:
    - Place `.drawio` files in the `drawio/` folder and refer to them in your markdown as in the [Components](components.md#calling-the-drawio-component-in-the-page-body-of-the-readmemd-file) reference.
    - Example structure:
        ```bash
        ref-arch/
        ├─ RAXXXX/
        │  ├─ drawio/
        │  │  ├─ solution-diagram-1.drawio
        ```

### Helpful Links

-   [SAP BTP Solution Diagram Guidelines](https://sap.github.io/btp-solution-diagrams/docs/solution_diagr_intro/big_picture/)
-   [YouTube: Mastering Solution Diagrams](https://www.youtube.com/watch?v=Nc0ceaWcynA)
-   [SAP Solution Diagrams on Lucid Marketplace](https://lucid.app/marketplace#/newlisting/8e327624-ad9a-4ccf-b74c-325bb907a0ef)

## Mermaid Diagrams for Flow-Based Visualizations

### When to Use Mermaid

Use **Mermaid diagrams** when:

-   Representing **process flows**, **decision trees**, or **data workflows**.
-   Visualizing **non-product-specific flows** or **abstract concepts**.
-   Creating lightweight diagrams directly in markdown files.

:::info Note
Mermaid-generated svg is automatically optimized for static websites. It is typically 10x-100x smaller than Drawio-generated svg. If you're trying to represent a simple flow, use Mermaid.
:::

### Best Practices for Mermaid Diagrams

Check the code behind these examples by reviewing the underlying markdown, using the edit button at the top of this page. The rendered versions are displayed below for illustrative purposes.

1. **Choose the Right Diagram Type**:

    - Use **flowcharts** for processes and workflows.
    - Use **sequence diagrams** for interactions between components.

2. **Use Styling for Consistency**:

    - Apply `classDef` to define consistent styles for nodes and edges.
    - Example:
        ```mermaid
        flowchart TD
         classDef largeNode stroke-width:4px,font-size:14px;
         A[Start]:::largeNode --> B[Process]:::largeNode
        ```

3. **Keep Layouts Intuitive**:

    - Use `subgraph` to group related nodes and reduce clutter.
    - Example:
      ```mermaid
      graph TD
        subgraph Group1
        A[Start] --> B[Process]
        B --> C[End]
      end
      ```

4. **Optimize for the Architecture Center**:

    - Use smaller fonts and reduced stroke widths to ensure diagrams render well in the deployed site.
    - Example:
      ```mermaid
      %% Add custom styles for smaller font and reduced component size
      graph TD
      classDef reduceSize stroke-width:2px,font-size:12px;
      A[Start]:::reduceSize --> B[Process]:::reduceSize
      B:::reduceSize --> C[End]:::reduceSize
      ```

5. **Annotate Reverse Flows**:
    - Use dashed lines (`-.->`) for reverse flows and add labels for clarity.
    - Example:
      ```mermaid
      graph TD
      A[Start] --> B[Process]
      B -.->|Reverse Flow| A
      ```

### Helpful Links

-   [Mermaid Flowchart Syntax](https://mermaid.js.org/syntax/flowchart.html)
-   [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/)

## Examples from the Repository

### Drawio diagram examples

1. SAP Business Data Cloud and SAP Databricks

-   **File**: `docs/ref-arch/RA0013/4-sap-databricks-in-business-data-cloud/drawio/bdc-databricks.drawio`
-   **Description**: A diagram illustrating the capabilities of SAP Databricks within SAP Business Data Cloud.

2. Edge Integration Cell on AWS

-   **File**: `docs/ref-arch/RA0008/1-edge-integration-cell-on-aws/drawio/sap-edge-integration-cell-aws.drawio`
-   **Description**: A diagram showing the deployment of SAP Integration Suite - Edge Integration Cell on AWS.

3. Azure Data Integration

-   **File**: `docs/ref-arch/RA0004/2-azure-data-integration/drawio/azure-data-integration.drawio`
-   **Description**: A diagram illustrating data integration between SAP and Azure services.

### Mermaid diagram examples

Check the code behind these examples by reviewing the underlying markdown, using the edit button at the top of this page. The rendered versions are displayed below for illustrative purposes.

1. Contribution Workflow

    - **File**: `community/intro.md`
    - **Description**: A flowchart showing the contribution process for the SAP Architecture Center. This diagram represents the decision-making process for contributing new or modified content. It illustrates how to reduce the size of nodes and edges in a long top to bottom flowchart by defining and applying a custom class.
    - **Code**:
        ```mermaid
        graph TD
        classDef reduceSize stroke-width:2px,font-size:14px;
        A[Check for existing content]:::reduceSize -->|Already Exists?| B[Create PR with Modifications]:::reduceSize
        A:::reduceSize -->|Create New| D[Fork Repository]:::reduceSize
        D:::reduceSize --> C{Decide on Scenario}:::reduceSize
        C:::reduceSize -->|New Architecture| E[genrefarch]:::reduceSize
        C:::reduceSize -->|New Partner Implementation| H[cd 'docs/ref-arch/RA9999']:::reduceSize
        ```

2. Intelligent Applications Data Flow

    - **File**: `docs/ref-arch/RA0013/3-intelligent-applications-by-sap/readme.md`
    - **Description**: A flowchart showing how raw source data is enriched through SAP Business Data Cloud components and surfaced in Intelligent Applications. It demonstrates how to use subgraphs for logical grouping of components.
    - **Code**:
        ```mermaid
        graph TD
        A[Source A] -->|Data Flow| B
        C[Source B] -->|Data Flow| B
        D[Source C] -->|Data Flow| B
        subgraph SAP_Business_Data_Cloud[SAP Business Data Cloud]
            B(Data Products) --> E(Space)
            E --> F(Base Model)
            F --> G(Analytic Model)
        end
        G --> H(Intelligent Application)
        ```

3. Contributor Lifecycle
    - **File**: `community/Guidelines/contribution.md`
    - **Description**: A Git graph showing the lifecycle of contributor changes in the SAP Architecture Center repository.
    - **Code**:
        ```mermaid
        gitGraph
            commit id: "Release" type: HIGHLIGHT tag: "v1.0"
            branch dev
            commit id: "tool update"
            commit id: "content update"
            branch contributor_fork
            commit id: "commit markdown"
            commit id: "commit diagrams"
            checkout dev
            merge contributor_fork id: "Merge with PR"
            checkout main
            merge dev id: "Release 2" type: HIGHLIGHT tag: "v1.1"
        ```
