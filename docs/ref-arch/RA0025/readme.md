---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0025
slug: /ref-arch/5f84ec80cc
sidebar_position: 25
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Transition Architectures
description: A large SAP product base is on Netweaver. Netweaver based products are approaching end of standard maintenance in 2027. SAP has either made successor products available or have named the successor products for the Netweaver products. This section of Architecture Center is dedicated to outline the options for customers for various use cases.
sidebar_label: Transition Architectures
keywords: [transition]
image: img/logo.svg
tags: [integration]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - abklgithub
last_update:
    date: 2025-08-02
    author: abklgithub
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->
A large base of SAP customers is on Netweaver based products. These products are approaching end of standard maintenance in 2027 ([see note 1648480](https://me.sap.com/notes/1648480)). SAP has either made successor products available or have named the successor products that can be found in [PAM](https://userapps.support.sap.com/sap/support/pam). This section of Architecture Center is dedicated to outline the options for customers for various use cases.
## Background
Technlogy, like all good things, change. Adopting new technology to replacing the aging products on old technology has happened since time forever. It is not different for SAP products. However, as SAP products manage mission critical workloads, the risk of migration is too great. What makes it even more difficult is not knowing what is the right technology for the use case. This is applicable to both net-new adopters of technology as well users of older technology looking to replace it with new. Also, as investments in technology are note cheap, it important to adopt the right technology that addresses not just the current requirements but also caters to requirements of foreseeable future.

Below are a few scenarios in which existing Netweaver solutions fall short as they were developed in a different timeframe to serve different challenges.

## Key Aspects

1.  ### Integration
In past decade cloud based solutions have altered the IT landscape of the organizaiton. Large number of cloud based solutions have replaced the traditional on-premise solutions. SAP's intelligent enterprise reflects this by having the core funtionality in the S/4HANA - the intelligent core - while the supporting functionality is met through other solutions from SAP's vast and evergrowing portfolio. That said, organizations are also opting market standard solutions that may not come from SAP portfolio. This has increased the need of secure integrations, especially in cloud-only scenarios. 

2.  ### Innovation rate
The rate of innovation as well as the rate of change has become very rapid, leading to faster update cycles. Organizations are aspiring for solutions and architectures that provide seamless upgrades and switch overs, in case the current technology is deprecated and replaced by new one.

Another aspect of this is about preserving the investments in customization. Customizations are expensive not only because of the need to develop tailormade code, but more so to maintain it, test it and remediate it due to the upgrades. This means choosing for solutions and architectures that support upgrade stable cutomizations. Older SAP customers have non-trivial customizations in their landscapes and decision to retain them is obvious. What is not obvious is where to rehome them in a non-disruptive and cost effective way.

3.  ### Security
Till recently, securing a solution meant adding authentication and authorization, and to make it further secure, putting it behind a firewall. However, it gets harder and harder as more and more solutions are added in the landscape. Just from the perspective of administration, it is very difficult to reliably manage correct level of authorizations at all point in time for a given job role across numerous applications used in the organizations that are spread across on-premise and cloud. Existing solutions typicall cater to the on-premise solutions and cloud solutions need to be managed separately. This not only increases TCO and administrative overhead, but also puts the organization at risk of security exposure. 

Organizations may be looking for one or more of the above aspects while looking for a replacement solution. Luckily, the SAP portfolio has the solutions that not just meet the current needs but provide additional features that adds value to the overall use case. 
<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/template.drawio)

## Transition
While having a suitable technology, however, is not sufficient. It is important to ensure that **right technology is used for the right use case**. Using top of the line technology has the pitfall of increasing TCO due to costly technology, unavailability of suitable talent, harder to troubleshoot issues due to complexity, etc. On the other end, choosing an unsuitable technology just because of its versatility to meet a requirement or widespread usage - without exception - leads to technical debt. Lastly, choosing to stay on obsolete technology exposes the organization to risk of security vulenerabilities, dependence on third party support (which may be costly or unreliable, or both) and higher support costs. Worse part is that even after paying more, the licence to operate risks or the risk of unplanned unavailability doesn't disappear.

It is hence essential for organizationss to be on the top of their technolgy portfolio. Organizations must invest in identifying fit for purpose technologies for their business use cases and plan timely transitions.

## Use cases

1.  ### Managing on-premise only integrations
Using Edge Integration Celll for 'local' integration that connect solutions within the customer on-premise / private landscape

2.  ### Managing cross-domain integrations
Using SAP Integration Suite for integrations between customer on-premise solutions and customer / business partner / government cloud-based solutions

3.  ### Managing printing requirements
Using SAP BTP Adobe Forms Service for PDF printing requirements

4.  ### Managing Access Governance
Using SAP Cloud IAG or SAP GRC 2026

## Resources

1. [Note 1648480](https://me.sap.com/notes/1648480)
2. [SAP Product Availability Matrix](https://userapps.support.sap.com/sap/support/pam)