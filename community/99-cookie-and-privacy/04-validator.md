---
sidebar_position: 4
slug: /validator
title: SAP Architecture Center - Architecture Validator Statement
description: The SAP Architecture Center - Architecture Validator Statement.
sidebar_label: SAP AC Architecture Validator Statement
keywords:
 - sap
 - cookie
 - privacy
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
  author: cernus76
  date: 2025-11-04
---

The **Architecture Validator** uses SAP OAuth for user authentication. This means that users are redirected to SAP Identify Service to log in and authorize the application to use SAP BTP resources. No passwords or direct authentication data are handled or stored by the **Architecture Validator**.

Personal Data Processed:
- SAP User ID
- Public Profile Information (e.g., name, profile picture, email if made public)

This data is used solely to perform the validation of the architectures (solution diagrams - drawio files) on behalf of the user.
No personal data is shared with third parties or used for marketing, analytics, or advertising purposes.
The **Architecture Validator** itself does not set or store any cookies.
However, SAP may set cookies during the OAuth login process (which is outside The **Architecture Validator**’s control).