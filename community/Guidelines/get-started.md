---
sidebar_position: 2
slug: /get-started
title: Get Started
sidebar_label: Get Started
keywords:
 - sap
 - get started
image: img/logo.svg
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - navyakhurana
  - cernus76
  - jmsrpp
last_update:
  author: navyakhurana
  date: 2025-01-20
---

## Requirements

- **Node.js** version 16.14 or above is required (v18.20.6 or above recommended).

## Step-by-Step Guide

Follow these steps to contribute a reference architecture:

### 1. Fork and Clone the Repository

1. Create a fork of the repository [architecture-center](https://github.com/SAP/architecture-center/fork).
2. Clone your forked repository.

### 2. Install Dependencies

Run the following command to install all Docusaurus dependencies:

```bash
npm install
```

:::warning Note
Ensure you are using the correct version of Node.js as mentioned above.
:::

### 3. Choose an Option

You can either create a new reference architecture or add a sub-folder to an existing one. Follow the corresponding steps below:

#### Option 1: Creating a New Reference Architecture

1. Run the following command to set up the CLI:

    ```bash
    npm run setup
    ```

2. Generate a new reference architecture by running:

    ```bash
    genrefarch
    ```

:::warning Note
Ensure that you are at the root level of the repository.
:::

3. Choose the first option: **Create ref-arch**.
4. Fill in the prompts for **title**, **description**, **keywords**, and **tags**.
5. A folder structure will be created in the `docs/ref-arch` folder.

#### Option 2: Creating a Sub-Folder in an Existing Reference Architecture

1. Run the following command to update dependencies (this is a best practice to avoid dependency issues):

    ```bash
    npm update
    ```

2. Navigate to the folder where you want to create the sub-page, for example:

    ```bash
    cd '/<path_to_your_repository>/docs/ref-arch/RA9999'
    ```

3. Generate a new sub-page by running:

    ```bash
    npm run gen-ref-arch
    ```

4. Choose the second option: **Create sub-page in existing ref-arch**.
5. Fill in the prompts for **title**, **description**, **keywords**, and **tags**.
6. The folder structure will be created in the directory you navigated to earlier.

![cli-gif](images/cli.gif)

### 4. Update `readme.md`

1. Navigate inside the `readme.md` file within the newly created folder structure.
2. Update the front-matter at the top of the `readme.md`.

:::info Know more about Front Matter 
For more details on front-matter and the necessary changes, refer to the [front-matter guidelines](community/Guidelines/front-matter.md).
:::

### 5. Test Changes Locally

To test the changes locally, run the following command:

```bash
npm run start
```

Your project should now be running at [http://localhost:3000](http://localhost:3000).

### 6. Test Build Locally

- Run the below command to build the project. Once it finishes, the static files will be generated within the build directory.

```bash
npm run build
```

- To test the build locally, run the following command:

```bash
npm run serve
```

Your project should now be running at [http://localhost:3000](http://localhost:3000).