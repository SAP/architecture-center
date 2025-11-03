---
sidebar_position: 2
slug: /get-started-quickstart
title: Get Started with Quick Start
description: Get started contributing to the SAP Architecture Center with this step-by-step guide. Learn how to contribute using the no-code Quick Start approach.
sidebar_label: Quick Start
keywords:
 - sap
 - get started
 - quick start
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
  - navyakhurana
  - abhissharma21
last_update:
  author: navyakhurana
  date: 2025-11-03
---

## About Quick Start

**Quick Start** is a no-code architecture editor designed to help users quickly publish reference architectures without using command-line tools.  
It enables contributors to:

- Log in using their **GitHub account**  
- Upload **Word files** that are automatically converted to Markdown  
- Directly add **text, images, and diagrams** in an intuitive editor  

:::info Note
Behind the scenes, Quick Start automates repository forking, front-matter generation, and pull request creation—significantly reducing manual effort and accelerating the publishing process.
:::

## How to Contribute

### Step 1: Log in with GitHub
1. Click on the **user icon** in the top-right corner of the taskbar.
2. Select **Login with GitHub**.  
3. During login, you will be prompted to **authorize the SAP Architecture Center by SAP** to access your GitHub account.

:::info Note
This authorization is required to enable Quick Start to:
   - Fork the repository  
   - Create pull requests  
   - Automatically pre-fill author details  
:::

Once authorized, the **Quick Start** tile will be enabled.

### Step 2: Create a New Architecture
1. Navigate to the **Quick Start** section.  
2. A dialog box will appear prompting you to enter:
   - `Title` – The name of your architecture  
   - `Description` – A short overview of your architecture  
   - `Author` – Automatically filled with your GitHub username  
   - `Contributors` – By default includes you; you can add other GitHub usernames  
   - `Tags` – Choose relevant tags from the provided dropdown list  

:::info Note
These details can be edited later in the editor as well.
:::

3. Click **Create** to proceed.

### Step 3: Using the Editor Interface

Once created, the **architecture editor** will open.  
Here are the main features and tips to get started:

- **Type `/` to access the toolbar options** — quickly insert components like text blocks, images, and diagrams.  
- You can **upload Draw.io diagrams or images** either from the toolbar or using the `/` command.  
- To add content, simply type in the editor or click **Insert File** to upload your architecture document.  
    :::info Note
    Supported file type: `.docx` (Word files).  
    Uploaded files are **automatically converted to Markdown** during submission.  
    :::
- To edit your architecture [front-matter](community/Guidelines/front-matter.md):
  - Click the **edit (pencil) icon** on the top-right corner to modify the **front matter** (title, description, tags, etc.).
- To edit **contributors**, scroll to the end of your architecture page and click the **edit (pencil)** icon in the contributors section.  
- To add **subpages**, click the **“+”** button in the left sidebar and follow the same creation steps.

### Step 4: Submit for Review

Once your architecture is ready:

1. Click **Submit** (top-right corner).  
2. Quick Start will automatically:
   - Convert all uploaded images, Draw.io files, and documents to Markdown  
   - Maintain the correct folder structure  
   - Manage your front matter metadata  
   - Create a **Pull Request** for review  

Your contribution will then go through the standard review and approval process.
