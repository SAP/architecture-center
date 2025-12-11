---
id: id-ra0027
slug: /ref-arch/TWhCEaU_
sidebar_position: 27
title: 'e-separation'
description: 'This is a default description.'
keywords: 
  - integration
  - security
  - cap
  - build
  - buildworkzone
  - ref-arch
sidebar_label: 'e-separation'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - integration
  - security
  - cap
  - build
  - buildworkzone
  - ref-arch
contributors:
  - KATREDRA
last_update:
  date: 2025-12-11
  author: KATREDRA
---

The e-Separation architecture integrates SAP SuccessFactors Employee Central with SAP Business Technology Platform to support a multi-stage separation and clearance workflow for PPGAP and RIPL. SuccessFactors acts as the HR system of record and handles all workflow-driven employee actions using MDF objects, business rules, page layouts, and approver groups. SAP Build Process Automation (BPA) orchestrates separation and clearance steps and communicates with a CAP-based service running on BTP for email generation, PDF creation, audit logging, and technical validations. The CAP service leverages an HDI container for storing workflow logs, separation history, and reporting data, and interacts with SAP DMS/Object Store for saving generated PDFs. SFTP destinations and job schedulers in BTP support file exports and pending reports. The complete solution is exposed to end users through SAP Build Work Zone or Launchpad, enabling employees, managers, and HR teams to initiate, approve, and monitor the full separation lifecycle.

