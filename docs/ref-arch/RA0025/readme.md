---
id: id-ra0025
slug: /ref-arch/9a5f7b59dc
sidebar_position: 25
sidebar_custom_props:
  category_index:
    - integration
title: Transitioning Architectures from SAP NetWeaver
description: >-
  Discover how SAP customers can transition from NetWeaver-based products
  approaching end-of-maintenance in 2027. Explore successor solutions,
  integration strategies, innovation needs, and security considerations for
  seamless migration and future-proofing your SAP landscape.
keywords:
  - SAP NetWeaver transition
  - security
  - governance
  - integration strategies
sidebar_label: Transitioning Architectures from SAP NetWeaver
image: img/logo.svg
tags:
  - integration
  - transition
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - abklgithub
discussion: 
last_update:
  author: abklgithub
  date: 2025-08-02
---

A large base of SAP customers is on NetWeaver-based products. These products are approaching the end of standard maintenance in 2027 ([see note 1648480](https://me.sap.com/notes/1648480)). SAP has either made successor products available or named the successor products, which can be found in [PAM](https://userapps.support.sap.com/sap/support/pam). This section of the Architecture Center is dedicated to outlining the options for customers for various use cases.

## Background

Technology, like all good things, changes. Adopting new technology to replace aging products has been happening since time immemorial. It is no different for SAP products. However, as SAP products manage mission-critical workloads, the risk of migration is significant. What makes it even more difficult is not knowing what the right technology is for the use case. This applies to both net-new adopters of technology as well as users of older technology looking to replace it with new solutions. Additionally, as investments in technology are not cheap, it is important to adopt the right technology that addresses not just current requirements but also caters to foreseeable future needs.

Below are a few scenarios in which existing NetWeaver solutions fall short, as they were developed in a different timeframe to serve different challenges.

## Key Aspects

1.  **Integration** - In the past decade, cloud-based solutions have altered the IT landscape of organizations. A large number of cloud-based solutions have replaced traditional on-premise solutions. SAP's Intelligent Enterprise reflects this by having the core functionality in the S/4HANA—the intelligent core—while the supporting functionality is met through other solutions from SAP's vast and ever-growing portfolio. That said, organizations are also opting for market-standard solutions that may not come from the SAP portfolio. This has increased the need for secure integrations, especially in cloud-only scenarios.

2.  **Innovation Rate** - The rate of innovation, as well as the rate of change, has become very rapid, leading to faster update cycles. Organizations aspire to solutions and architectures that provide seamless upgrades and switchovers in case the current technology is deprecated and replaced by a new one.

    Another aspect of this is preserving investments in customization. Customizations are expensive not only because of the need to develop tailor-made code but also due to the need to maintain, test, and remediate it during upgrades. This means choosing solutions and architectures that support upgrade-stable customizations. Older SAP customers have non-trivial customizations in their landscapes, and the decision to retain them is obvious. What is not obvious is where to rehome them in a non-disruptive and cost-effective way.

3.  **Security** - Until recently, securing a solution meant adding authentication and authorization and, to make it further secure, putting it behind a firewall. However, it becomes increasingly difficult as more solutions are added to the landscape. From an administrative perspective, it is very challenging to reliably manage the correct level of authorizations at all times for a given job role across numerous applications used in organizations that are spread across on-premise and cloud. Existing solutions typically cater to on-premise solutions, while cloud solutions need to be managed separately. This not only increases TCO and administrative overhead but also puts the organization at risk of security exposure.

    Organizations may be looking for one or more of the above aspects while seeking a replacement solution. Luckily, the SAP portfolio has solutions that not only meet current needs but also provide additional features that add value to the overall use case.

## Transition

Having suitable technology, however, is not sufficient. It is important to ensure that **the right technology is used for the right use case**. Using top-of-the-line technology has the pitfall of increasing TCO due to costly technology, unavailability of suitable talent, and harder troubleshooting due to complexity. On the other hand, choosing unsuitable technology simply because of its versatility or widespread usage—without exception—leads to technical debt. Lastly, choosing to stay on obsolete technology exposes the organization to risks such as security vulnerabilities, dependence on third-party support (which may be costly or unreliable, or both), and higher support costs. Worse still, even after paying more, the license-to-operate risks or the risk of unplanned unavailability doesn't disappear.

It is hence essential for organizations to stay on top of their technology portfolio. Organizations must invest in identifying fit-for-purpose technologies for their business use cases and plan timely transitions.

## Use Cases

1. Managing On-Premise-Only Integrations - Using Edge Integration Cell for 'local' integrations that connect solutions within the customer's on-premise/private landscape.
2. Managing Cross-Domain Integrations - Using SAP Integration Suite for integrations between customer on-premise solutions and customer/business partner/government cloud-based solutions.
3. Managing Printing Requirements - Using SAP BTP Adobe Forms Service for PDF printing requirements.
4. Managing Access Governance - Using SAP Cloud Identity Access Governance (IAG) or SAP Governance, Risk, and Compliance (GRC) RC 2026.

## Resources

1. [Note 1648480](https://me.sap.com/notes/1648480)
2. [SAP Product Availability Matrix](https://userapps.support.sap.com/sap/support/pam)