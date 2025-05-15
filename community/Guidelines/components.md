---
sidebar_position: 5
slug: /components
title: Components
description: It includes latest components developed and tested by the team. 
sidebar_label: Components
keywords:
  - community
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
  date: 2025-05-01
  author: cernus76
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

## Calling the draw.io component in the page body of the `readme.md` file

```yaml
![drawio](drawio/demo.drawio)
```
Note: Use the markdown image syntax for drawio files.
