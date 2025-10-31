---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0027
slug: /ref-arch/4173e60b83
sidebar_position: 27
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Implementing and Extending SAP Joule
description: Explore key topics for implementing and extending SAP Joule, from enterprise integration with systems like SAP S/4HANA and SAP SuccessFactors to building custom skills and agents with Joule Studio and SAP BTP
sidebar_label: Implementing and Extending SAP Joule
keywords: 
  - sap
image: img/logo.svg
tags: 
  - sap
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
    date: 2025-10-29
    author: user-4173e60b83
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->
Joule is an AI-powered co-pilot designed to enhance productivity and decision-making within enterprise environments. 
It revolutionizes how you interact with SAP applications, making every touchpoint count and every task simpler. Joule is embedded across SAP Enterprise Solutions portfolio accessible to all users, providing contextual assistance, automating routine tasks, and delivering insights that drive better business outcomes.

Joule interactions are achieved using advanced algorithms and large language models (LLM) for user queries and user intents. If a user posts a question to Joule, the copilot understands the intent and with the help of the integration with your SAP Business Applications, it gives the appropriate response.

This reference architecture outlines the key components and best practices for implementing and extending SAP Joule, enabling organizations to leverage its capabilities effectively. This architecture is designed to provide a comprehensive understanding of how to integrate Joule with existing enterprise systems, build custom skills and agents, and optimize its performance for specific business needs.

## Joule Key Capabilities

Joule Capabilities are categorized into different patterns.

**Transactional Pattern:** - Provides our users a direct entry point to SAP the backend system. Triggering and influencing business processes with the power of natural language and generative AI. E.g. purchase orders which need to be reviewed and approved, job positions which are created, OR any other CRUD (Create, Read, Update, Delete) based interactions. All our Cloud products are currently developing such content packages for Joule for the most relevant user interactions.

**Navigational Pattern:** - The navigational pattern helps our users handle business processes themselves in the relevant SAP screen. Joule allows users to navigate directly where they want to go. This is especially helpful for users who are not very familiar with navigating SAP applications.

**Informational Pattern:** - The informational pattern we are providing our users knowledge-based results. These are for example policy related questions. We differ between two categories of informational Joule questions:


The navigational pattern helps our users handle business processes themselves in the relevant SAP screen. Joule allows users to navigate directly where they want to go. This is especially helpful for users who are not very familiar with navigating SAP applications.
The informational pattern we are providing our users knowledge-based results. These are for example policy related questions. We differ between two categories of informational Joule questions:
One is based on SAP-owned content to have all our knowledge base available via Joule, e.g. with the SAP-help documentation. This is managed by SAP and offered to every Joule user out of the box.
Additionally, we are enabling customers to upload customer-owned content. This allows customers to upload their HR policies, travel policies, information content, and others. We call this functionality Document Grounding.
We are also working the 4th the pattern

Analytical pattern, we plan to introduce analytical interactions. Coming later in 2024 we plan to enable analytical interactions based on JustAsk and SAP Analytics Cloud, enabling customers to leverage Joule for analytical queries. In 2025, we plan to integrate Joule into SAP Analytics Cloud and further evolve the analytical capabilities of Joule.

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
