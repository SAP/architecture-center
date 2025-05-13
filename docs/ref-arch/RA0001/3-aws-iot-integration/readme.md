---
id: id-ra0001-3
slug: /ref-arch/fbdc46aaae/3
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Build Events-to-Business Actions Scenarios with SAP BTP and AWS IoT SiteWise
description: >-
  Sample application for building event-driven architecture application with AWS
  IoT SiteWise as event source. Assess the critical events and publish to SAP BTP for
  validation and processing the business processes operations in SAP S/4HANA.
keywords:
  - sap
  - btp
  - integration
  - event-driven architecture
  - aws
  - genai
  - cloud application programming model
  - cap
  - eda
sidebar_label: Integration with Amazon Web Services
image: img/logo.svg
tags:
  - cap
  - aws
  - appdev
  - integration
  - eda
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - anbazhagan-uma
  - pra1veenk
  - AjitKP91
  - swatimaste00
discussion: 
last_update:
  author: anbazhagan-uma
  date: 2025-01-01
---

## Introduction

AWS IoT SiteWise is a managed service with which you can collect, store, organize and monitor data from industrial equipment at scale to help you make better, data-driven decisions. You can use AWS IoT SiteWise to monitor operations across facilities, quickly compute common industrial performance metrics, and create applications that analyze industrial equipment data to prevent costly equipment issues and reduce gaps in production.

In this reference architecture, events from AWS IoT SiteWise are published to SAP Integration Suite, advanced event mesh. The Node.js extension application deployed in SAP BTP subscribes to the advanced event mesh queue and executes the action that is required to be taken based on the event details. SAP Event Mesh capability in SAP Integration Suite can also be leveraged for integration. The choice of the eventing service can be based on the scenario and volume of events to be handled.

## Solution Architecture

![drawio](drawio/e2b-awsiotsitewise-pl.drawio)

The following steps depicts the information flow across systems:

(1) Event is triggered from AWS IoT SiteWise.

(2) and (3) The sensor data from AWS IoT SiteWise is dumped into the Amazon S3 bucket.

(4a) AWS Lambda is a serverless function, which will orchestrate the process of detecting a stream contains any alerts related to failure or warnings, and then the inference result is passed to SAP Integration Suite, advanced event mesh.

(4b) AWS secrets manager is used to store credentials, these are used by the lambda function to provide payload to SAP Integration Suite, advanced event mesh.

(5), (6) Event-to-Business-Action framework(extension app) processor module's endpoint is subscribed to SAP Integration Suite,advanced event mesh, hence receives this event.

(7) Event-to-Business-Action framework(extension app) processor module leverages the Business Rules capability of SAP Build Process Automation to derive business action (for example, In this scenario, Plant Maintenance Notification creation in SAP S/4HANA system) based on certain characteristics of incoming event.

(8a), (8b) Event-to-Business-Action framework(extension app) calls Amazon Bedrock LLM model using Gen AI hub to generate summary of the event.

(9), (10), (11) Event-to-Business-Action framework (extension app) processor module triggers the defined action in the SAP S/4HANA system by using the SAP Destination Service and SAP Private Link Service.

## List of Services and Components

These are the technical prerequisites for integration between AWS IoT SiteWise, SAP BTP and SAP S/4HANA. 

### SAP BTP Services
- **SAP Cloud Foundry Runtime**
    - Foundation for running the CAP extension application for translating events to business actions.
- **Authorization and Trust Management Service**
    - Required for securing the extension application in SAP BTP
- **SAP Integration Suite,advanced event mesh**
    - Required to receive events from Amazon AWS IoT
- **SAP HANA Cloud**
    - Required to store action configuration and logs for the CAP application
- **SAP Build Process Automation**
    - Decision service to configure business decisions that needs to be taken based on the type of event received from AWS IoT SiteWise.
- **SAP Connectivity Service**
    - To establish connections between cloud applications and on-premise systems
- **SAP Destination Service**
    - To find the destination information required to access a remote service or system from your extension application.
- **SAP Private Link Service**
    - To establishe a private connection between selected SAP BTP services and selected services in your own IaaS provider accounts.
- **SAP AI Core**
    - SAP AI Core supports full lifecycle management of AI scenarios and also provides access to generative AI capabilities of LLM Models like Amazon Bedrock via the generative AI hub.
- **SAP AI Launchpad**
    - SAP AI Launchpad is a multi-tenant software as a service (SaaS) application in SAP Business Technology Platform that provides generative AI capabilities via the Generative AI Hub. Customers and partners can use SAP AI Launchpad to manage AI use cases (scenarios) across multiple instances of AI runtimes (such as SAP AI Core).

### AWS Cloud Products
- **A valid Amazon AWS subscription**
- **AWS IoT SiteWise**
    - Required for receiving and sending the events whenever an abnormality is detected in the equipment.
- **Amazon S3**
    - Required to store the received streaming event data.
- **AWS Secret Manager**
    - Required to store the SAP Integration,advanced event mesh credentials that are accessed by the Amazon Lambda Function.
- **Amazon Lambda Function**
     - Required to orchestrate the process of detecting a stream contains any alerts related to failure or warnings, and then the inference result is passed to SAP Integration Suite Advanced Event Mesh.

For detailed step by step information and to try out the integration, go to [GitHub Samples](https://github.com/SAP-samples/btp-events-to-business-actions-framework)