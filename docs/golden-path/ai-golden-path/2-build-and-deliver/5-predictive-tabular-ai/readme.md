---
sidebar_position: 5
title: Predictive & Tabular AI
description: >-
  Build, deploy and run tabular prediction use cases with SAP-RPT-1, SAP's foundation
  model for relational business data.
keywords:
    - sap
    - rpt-1
    - predictive ai
    - tabular ai
    - in-context learning
    - ai core
sidebar_label: Predictive & Tabular AI
image: img/ac-soc-med.png
tags:
    - ai-golden-path
    - genai
    - data
    - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
last_update:
  author: SAP
  date: '2026-04-23'
---

# How to build, deploy and run with RPT-1

SAP-RPT-1 (in short for Relational Pre-trained Transformer) is our first-ever relational foundation model. Unlike traditional large language models that works primarily with unstructured text, SAP-RPT-1 is a table-native model that excels at understanding and predicting on your relational business data. It enables in-context learning on your relational business data. This allows you to use the model out-of-the-box to gain business insights from your data, without the need for model training or fine-tuning.  

## How to Get Started with SAP RPT 1  
If you are new to SAP-RPT-1, we have a [playground environment](https://www.sap.com/products/artificial-intelligence/sap-rpt.html) that allows you to test SAP-RPT-1 for free. It is mainly designed for exploration and building initial business cases with SAP-RPT-1. Please note that, in contrast to the commercial variants, the free version only allows predictions for up to 25 rows, 4 columns and 50 target classes. Also, rate limitations apply.  
The model variants for SAP-RPT-1 will be available on SAP generative AI hub. You will need to first deploy your desired model variant before you can start making inferences to the deployed model. If you are already using SAP generative AI hub, you can refer to our [help documentation](https://help.sap.com/docs/sap-ai-core/generative-ai-hub/quick-start?locale=en-US) and can get a headstart with SAP-RPT-1.  
Prerequisites:  
To get access to the model variants, you will first need to have a working AI Core instance under the [extended plan](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/service-plans?locale=en-US) _(see_ [_SAP Note_](https://me.sap.com/notes/3437766) _on region availability)_. We generally recommend the use of AI Launchpad alongside your AI Core instance and you can follow the [here](https://community.sap.com/t5/technology-blog-posts-by-sap/set-up-sap-generative-ai-hub-in-an-sap-btp-enterprise-account-and-consume/ba-p/13624287) to get started with SAP generative AI hub.  

## Architecture at a glance
The solution involves several key components working together:

- **Your Data Source**: Structured business data (e.g., from SAP S/4HANA or another data system) used for context and predictions.
- **SAP AI Core**: The platform where the SAP-RPT-1 model is deployed and exposed as an inference endpoint.

## Deployment:
A step-by-step guide is provided in the following [blog post](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-a-step-by-step-guide-on-getting-started/ba-p/14290171).  
## Run
The RPT-1 model on AI Core is a productive model, hence it can be used as is for a productive implementation. Only your development deployment and BTP subaccount needs to be replaced with the customer's details.  

## What's Next
We are continuously working to improve your developer experience. for AI, allowing your developers to seamlessly integrate the model into their applications with just a few lines of code. Stay tuned for more updates!  

## References

- [SAP-RPT-1 Help Portal](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/sap-rpt-1)
- [Blog: A New Paradigm for Enterprise AI: In-Context Learning for Relational Data](https://community.sap.com/t5/technology-blog-posts-by-sap/a-new-paradigm-for-enterprise-ai-in-context-learning-for-relational-data/ba-p/14260221)
- [Blog: SAP-RPT-1: Enterprise AI for Relational Data Now Generally Available!](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-enterprise-ai-for-relational-data-now-generally-available/ba-p/14287926)
- [Blog: SAP-RPT-1: A Step-by-Step Guide on Getting Started - SAP Community](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-a-step-by-step-guide-on-getting-started/ba-p/14290171)
- [API Collection and Code Snippets](https://github.com/SAP-samples/sap-rpt-samples)
