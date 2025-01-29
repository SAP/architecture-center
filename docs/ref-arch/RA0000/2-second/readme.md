---
############################################################
#                Beginning of Front Matter                 #
############################################################

# ID: [DO NOT MODIFY] - id is automatically assigned.
id: id-ra0000-2

# SLUG: [DO NOT MODIFY] - It will be generated (e.g. short UUID for the URL).
slug: /ref-arch/components

# SIDEBAR_POSITION: [DO NOT MODIFY] - Position is automatically assigned.
sidebar_position: 0

# SIDEBAR_CUSTOM_PROPS: [DO NOT MODIFY] - In which additional sidebar this page should be displayed? Check its presence on the 'SAP ViewPoints'.
sidebar_custom_props: 
  category_index: 
    - demo

############################################################
#     You can modify the front matter properties below     #
############################################################

# TITLE: 50 characters max (best practice). Keep it short & concise. 
title: Components demo

# DESCRIPTION: A maximum of 300 characters will be displayed in the cards. For social medias, the best practice is 110 characters max Keep it short & concise. 
description: This page is used for demo purpose. It includes latest components developed and tested by the team. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.

# SIDEBAR_LABEL: 50 characters max (best practice). Keep it short & concise. 
sidebar_label: Components demo

 # KEYWORDS: Choose few keywords for this page.
keywords:
  - sap
  - cloud
  - demo

# IMAGE: Default is SAP logo.
image: img/logo.svg

# TAGS: Tags are displayed at the bottom of the page.
tags:
  - demo
  - azure
  - aws
  - gcp

# HIDE_TABLE_OF_CONTENTS:Do you want to hide the table of content? Default: false. You can reclaim the space on the right hand side if it is not relevant for your page.
hide_table_of_contents: true

# HIDE_TITLE: Do you want to hide the title of the page? Default: true.
hide_title: false

# TOC_MIN_HEADING_LEVEL: Minimum level for the TOC. Default: 2.
toc_min_heading_level: 2 

# TOC_MAX_HEADING_LEVEL: Maximum level for the TOC. Default: 4.
toc_max_heading_level: 4 

# DRAFT: If you set this to True, the page will not be part of the build and will not be deployed.
draft: true 

# UNLISTED: If you set this to True, the page will be part of the build, will be deployed, but will not be visible. You need to access it directly via the defined slug.
unlisted: false

# CONTRIBUTORS: GitHub username(s) of the main contributor(s)
contributors:


# LAST_UPDATE: Choose the author & the date of the last important update. Please use the international format YYYY-MM-DD for the date to avoid problems. It will appear at the bottom of the page.
last_update:
  date: 2025-01-15
  author: PO

############################################################
#                   End of Front Matter                    #
############################################################
---

2 components have been developed for the Architecture Center:

- **The Contributors component**: This section displays a list of contributors in an admonition at the bottom of the main page of the reference architecture, acknowledging their efforts and input.

- **The draw.io component**: This section features an admonition for a Draw.io file located in the architecture section of the page. Users can either download the file for offline use or create an online copy to edit directly.

## Contributors declaration in the header of the `readme.md` file (front matter)

```yaml
# CONTRIBUTORS: GitHub username(s) of the main contributor(s)
contributors:
  - cernus76
  - jmsrpp
  - navyakhurana
```

## Calling the components in the page body of the `readme.md` file

```yaml
<!-- The Solution Diagram in SVG format should appear before the drawio "image" -->
![image](images/demo.svg)
```
Note: In a future version of the Architecture Center, the SVG picture will be integrated in the drawio component.

```yaml
<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
![drawio](drawio/demo.drawio)
```
Note: Use the markdown image syntax for drawio files.