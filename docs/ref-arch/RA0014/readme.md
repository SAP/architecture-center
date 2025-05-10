---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0014
slug: /ref-arch/97da66ca6c
sidebar_position: 14
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Testing and Understanding Network Performance Implications in a Multi-Regional Solution Setup
description: Designing and operating cloud based solutions in a multi-regional setup are technically advanced tasks. The solution and application design, usage of different network providers and last but not least the geographical placement of services have an impact on the overall performance.
sidebar_label: Testing and Understanding Network Performance Implications in a Multi Regional Solution Setup
keywords: [sap, BTP, rise, grow, hyperscaler, S/4 HANA, aws, azure, gcp, odata, privatelink, wan, internet]
image: img/logo.svg
tags: [aws, azure, gcp, appdev, integration]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - contributor1
    - contributor2
last_update:
    date: 2025-05-07
    author: user-97da66ca6c
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->

Cloud infrastructures are distributes systems by default, caused by the fact that multiple systems are connected to execute a desired tasks. A distributed system design is massively increasing the complexity in building and operating these solutions. In the introduction of the famous Distributed Systems Course (MIT 6.824) there is already this kind of ironic warning "...if you can possibly solve it on a single computer ... without building a distrinbuted system you should do it that way". Having an honest assessment of our situation this warning is definitely a bit late. Looking at typical enterprise solutions consisting of different SAP SaaS Cloud products of the SAP Business Suite like S/4 HANA, SuccessFactors, Ariba, SAP Sales Cloud,... SAP Legacy Solutions on-premise or operated on Infrastructure-as-a-Service, 3rd party solutions and last but not least the Business Technology Platform you automatically end up in a massively distributed system. To make things even harder, these systems be spread out to very different locations, spanning even different continents. 
In the context of hyperscalers (Infrastructure and platform providers like Amazon Web Service, Google Cloud Platform or Microsft Azure), these are referred to as "regions".
However, the distribution of these services to different locations is not just an obstacle to deal with, often there are valid business reasons behind using a certain datacenter location like regulatory requirements, security and cost considerations and, you might guess it, performance requirements. Many SAP customers operate in a vast majority of countries, running services and solutions in different becomes becomes a business requirement and imperative.
Designing such a global network of services for a certain customer specific solution and fitting it into an overarching enterprise architecture and is complex. This document will have a look at the performance impact of wide area network connections, the impact of using different services for the connections. Instead of guessing the performance we will use a distributed measurement system to understand the impact of different architectural decisions. In the final section we will discuss the findings and results from former tests that have been executed using the distributed measurements and will derive some best practices and rules of thumb that can helps architects in designing their distributed system landscape for SAP solutions.

# 

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/template.drawio)

## Flow

<!-- Add your flow content here -->

## Characteristics

<!-- Add your characteristics content here -->

## Examples in an SAP context

<!-- Add your SAP context examples here -->

## Services and Components

<!-- Add your services and components here -->

## Resources

<!-- Add your resources here -->

## Related Missions

<!-- Add related missions here -->
