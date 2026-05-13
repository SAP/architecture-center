---
id: id-ra0030-1
slug: /ref-arch/Iiv_4QxS/1
sidebar_position: 1
title: 'SAP CAP Framework for Events to Business Actions Integration'
description: 'SAP CAP'
keywords: 
  - genai
sidebar_label: 'SAP CAP Framework for Events to Business Actions Integration'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - genai
contributors: 
  - abhissharma21
  - anbazhagan-uma
last_update:
  date: 2026-05-13
  author: abhissharma21
---

# Introduction

AWS IoT SiteWise is a managed service with which you can collect, store, organize and monitor data from industrial equipment at scale to help you make better, data-driven decisions. You can use AWS IoT SiteWise to monitor operations across facilities, quickly compute common industrial performance metrics, and create applications that analyze industrial equipment data to prevent costly equipment issues and reduce gaps in production.



In this reference architecture, events from AWS IoT SiteWise are published to SAP Integration Suite, advanced event mesh. The Node.js extension application deployed in SAP BTP subscribes to the advanced event mesh queue and executes the action that is required to be taken based on the event details. SAP Event Mesh capability in SAP Integration Suite can also be leveraged for integration. The choice of the eventing service can be based on the scenario and volume of events to be handled.

# Architecture

![drawio](drawio/diagram-JLqeXr_tNG.drawio)

This architecture can be leveraged to build event-based integration scenarios from different systems/applications (providers) into the SAP ecosystem (consumers) using SAP BTP. This uses asynchronous communication via message broker. This features a CAP-based application framework (Events-To-Business Actions Framework) which allows you to configure set of actions for a particular business scenario. Based on the events category and type, respective actions are triggered in SAP Line of Business (LoB) applications. It also uses SAP Integration Suite, advanced event mesh / Event Mesh capability in SAP Integration Suite, SAP Build Process Automation, SAP HANA Cloud, SAP Destination Service, SAP Connectivity service with cloud connector.



An alternative architecture can be considered with SAP Private Link service for integrating SAP BTP and SAP S/4HANA in scenarios where both SAP BTP and SAP S/4HANA run on the same Hyperscaler environment (Microsoft Azure or AWS). The reference applications with Microsoft Azure and AWS demonstrates and helps to build end-to-end event-based integration scenario.

```java
public static void main(String[] args) {

System.out.println("Hello, World!");

}
}
```









