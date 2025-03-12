---
# id: 
sidebar_position: 1
sidebar_custom_props: {}
title: Specify Your Integration Dos and Don’ts
description: SAP's integration strategy focuses on creating a seamless, intelligent suite of business applications by integrating end-to-end processes across SAP, partner, and third-party solutions, aiming to accelerate innovation and deliver significant business value. A key component of this strategy is the SAP Integration Solution Advisory Methodology, which provides a comprehensive framework for defining, documenting, and executing enterprise integration strategies, covering both technical and organizational aspects, and can be adapted to various integration technologies and organizational needs.
# slug: 
keywords:
  - sap
  - btp
  - business suite
  - integration
  - solution
  - advisory
  - methodology
image: img/logo.svg
sidebar_label: Specify Your Integration Dos and Don’ts
tags:
  - sapintsoladvmetho
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: PO
  date: 2025-02-24
---

<!-- loio5478c29f29b74c159d13a55eb835bc57 -->

Define “golden rules” for integration development to standardize integration scenarios at higher quality.

***

## Context

Integration dos and don’ts are easy-to-apply principles about aspects to consider or to avoid when designing and implementing integration scenarios. When defining such integration dos and don’ts, you should focus on the most important rules. Otherwise, there’s a high risk that integration developers will not follow all of them. The SAP Integration Solution Advisory Methodology attempts to define integration dos and don’ts for integration styles. If needed, you can deliver detailed guidance \(for instance for integration technologies\) as part of integration development guidelines.

The list below shows an example of dos and don’ts applicable for the process integration style, including the reasons why.

|Integration dos and don’ts|Reason|
|--------------------------|------|
|Leverage integration packages \(content\) wherever possible|Reduces integration development effort|
|Decouple business applications via asynchronous messaging and events|Better scaling runtime behavior and resilience|
|Use synchronous calls only in selected use cases|Risk of slow, unreliable or no responses|
|Avoid a tight coupling of applications|Negative impact on resilience, availability, maintenance of the integration scenario|
|Prefer \(near\) real-time distribution of data over batch-oriented processes|Ensures that data is up to date in connected business applications|
|Avoid chaining of too many integration runtime components|Makes it more difficult to monitor and operate such integration scenarios|

When defining integration dos and don’ts, you need also to consider customer context factors, which may lead to deviations from generic best practices.

Integration dos and don’ts are typically defined by an integration architect.

***

## Procedure

For specifying integration dos and don’ts you use the templates-based approach. Integration Assessment doesn't support the SAP Integration Solution Advisory Methodology: Integration dos and don’ts are related to the design and implementation of integration scenarios, which is not addressed by Integration Assessment.

1.  Templates-based approach

      
      
    **Integration Dos and Don’ts Template**

    ![](images/loiocaaf15feea15447f9c3a97217b843635_LowRes.png "Integration Dos and Don’ts Template")

    Download the "Integration Dos and Don'ts Template" and fill it out as follows:

    1.  In the header row, specify an integration style you want to define integration dos and don’ts for
    2.  In the first column, you enter the integration dos
    3.  In the second column you enter the integration don’ts

    As a rule of thumb: Make sure that you don’t define more than ten integration dos or don’ts in total.

2.  Tool-based approach

    Not supported by the Integration Assessment capability with SAP Integration Suite. Please choose the templates-based approach instead \(see above\).


**Related Information**  


[Download the Integration Dos and Don’ts Template](https://d.dam.sap.com/a/QXH6JPF?rc=10)

