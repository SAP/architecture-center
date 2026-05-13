---
id: id-ra0030-3
slug: /ref-arch/Iiv_4QxS/3
sidebar_position: 3
title: 'Build Events-to-Business Actions Scenarios with SAP BTP and AWS IoT SiteWise'
description: 'IOT'
keywords: 
  - data
sidebar_label: 'Build Events-to-Business Actions Scenarios with SAP BTP and AWS IoT SiteWise'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - data
contributors: 
  - abhissharma21
last_update:
  date: 2026-05-13
  author: abhissharma21
---

# Introduction

AWS IoT SiteWise is a managed service with which you can collect, store, organize and monitor data from industrial equipment at scale to help you make better, data-driven decisions. You can use AWS IoT SiteWise to monitor operations across facilities, quickly compute common industrial performance metrics, and create applications that analyze industrial equipment data to prevent costly equipment issues and reduce gaps in production.



In this reference  *architecture*, events from AWS IoT SiteWise are published to SAP Integration Suite, advanced event mesh. The Node.js extension application deployed in SAP BTP subscribes to the advanced event mesh queue and executes the action that is required to be taken based on the event details. SAP Event Mesh capability in SAP Integration Suite can also be leveraged for integration. The choice of the eventing service can be based on the scenario and volume of events to be handled.



