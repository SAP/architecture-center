---
# id: 
sidebar_position: 3
sidebar_custom_props: {}
title: Assess Your Interfaces
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
sidebar_label: Assess Your Interfaces
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

<!-- loio57a7941b790b46e399e66553a4c25463 -->

Integration developers determine the right integration technology by assessing interfaces of business applications to integrate with.

***

## Context

A typical task of integration developers in implementation projects is to blueprint integration scenarios between two business applications \(see ? in the image below\). Typically, a business scenario is broken down into technical interfaces. Next, an integration developer needs to classify/assess the technical interface whether it belongs to a process-, data-, analytics-, user-, or thing-centric integration style \(see 1 in the image below\) followed by the applicable integration use case pattern \(see 2 in the image below\). An integration developer can select the appropriate integration technology with the help of the defined integration policies \(see number 3 in the image below\).

![](images/loiof3e4b440988f449c8c3a17eafa81a9f3_LowRes.png)

For identifying the integration style and use case pattern, the first phase of the SAP Integration Solution Advisory Methodology provides a set of characteristics.

In addition to that, it also offers detailed guidance for integration developers on selected topics where more than one implementation option exists. The following example compares the API management and the integration layer with the help of sample characteristics. Depending on the required characteristics, an integration developer can make a sound decision about which implementation option to choose.

![](images/loio2ef58779e5bc438f926461ad5d952ff7_LowRes.png)

Typically integration developers conduct such interface assessments.

***

## Procedure

You should use the Integration Assessment capability within SAP Integration Suite for interface assessments: It offers a questionnaire-based approach which helps integration developers to determine the best fitting integration technology \(or a combination of several integration technologies\) for a specific integration requirement. Integration Assessment includes recommendations for SAP integration technologies that you can also adapt to reflect customer context factors. These recommendations are updated by SAP on a regular basis. It also documents the technology decisions made. You can also define your own questionnaires for enabling more tailored and/or detailed recommendations for your integration developers.

1.  Templates-based approach

    Not available. Leverage the Integration Assessment capability within SAP Integration Suite instead \(see below\).

2.  Tool-based approach

    Perform this step using Integration Assessment. For more information, see: [Determine an Integration Technology](https://help.sap.com/docs/SAP_INTEGRATION_SUITE/51ab953548be4459bfe8539ecaeee98d/69b6daede23544c5bf90bac10a7c76aa.html?locale=en-US).


