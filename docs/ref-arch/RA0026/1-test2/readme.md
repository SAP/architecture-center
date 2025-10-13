---
id: id-ra0026-1
slug: /ref-arch/L3cfoBpp/1
sidebar_position: 1
title: 'test2 [RA0026]'
description: 'This is a default description.'
sidebar_label: 'test2'
tags:
  - eda
contributors:
  - navyakhurana
last_update:
  date: 2025-10-13
  author: navyakhurana
---



INTERNAL

**Cross Product Architecture (CPA) – Architecture Decision Record**

SAP Architecture Center: A Well-Architected Framework for SAP Architectures

Working Group **Reference Architecture**Workstream Reference **Solution Architecture**

Date

2024-07-22

Version

0.2

Status

Draft

Majority Vote by Org Units

Accepted, Not accepted, In review

Contributor(s)

James Rapp, Anirban Majumdar, PVN PavanKumar, Pierre-Olivier Basseville

Reviewer(s)

OCTO – Platform Architecture & Adoption

***REQUEST TO DOCUMENT-REVIEWERS: Read the whole document at least once before adding any comment. We also ask everyone to take the guidelines (available in the side comment, or ***[***here***](https://pages.github.tools.sap/CPA/landing-page/participation-and-processes/managing-working-groups-and-clusters/making-and-documenting-important-decisions)***) for document reviewing into account. These were created based on the lessons learned from previous reviews.***

Version History

**Version**

**Date**

**Changes**

0.1

2024-07-22

- Initial version

Table of Contents

[1 Executive Summary 3](#_Toc176971690)

[2 Context 4](#_Toc176971691)

[2.1 Problem Statement and The Need for an SAP Architecture Center 4](#_Toc176971692)

[2.2 Comparison of existing Well-Architected Frameworks Across Major Cloud Providers 5](#_Toc176971693)

[2.3 Increased importance of architecture with RISE and GROW with SAP 6](#_Toc176971694)

[2.4 Architecting for mission critical integrations and extensions 7](#_Toc176971695)

[2.5 Optimizing cost of cloud 7](#_Toc176971696)

[2.6 Security considerations in modern cloud architectures 9](#_Toc176971697)

[2.7 Updating the SAP Center of Excellence 10](#_Toc176971698)

[3 Key Assumptions and Boundary Conditions 11](#_Toc176971699)

[4 Solutions considered 12](#_Toc176971700)

[4.1 SAP Architecture Center (our proposal) 12](#_Toc176971701)

[4.1.1 Well-Architected Framework Pillars 13](#_Toc176971702)

[4.1.2 Reference Architecture repository 13](#_Toc176971703)

[4.1.3 SAP Architectures 14](#_Toc176971704)

[4.1.4 Architecture Validator 14](#_Toc176971705)

[4.1.5 Foundation for Community of Practice 15](#_Toc176971706)

[4.1.6 Cons of this solution 16](#_Toc176971707)

[4.2 BTP Reference Architectures on SAP Discovery Center (link) 16](#_Toc176971708)

[4.2.1 Cons of this solution 16](#_Toc176971709)

[4.3 Leveraging Existing Sources 17](#_Toc176971710)

[4.3.1 CPA Working Groups (link) 17](#_Toc176971711)

[4.3.2 SAP BTP Guidance Framework (link) 17](#_Toc176971712)

[4.3.3 BTP Solution Diagram Repository (link) 17](#_Toc176971713)

[4.3.4 Internal sources hosting Architectures 17](#_Toc176971714)

[5 Decision 18](#_Toc176971715)

[6 Decision Protocol 19](#_Toc176971716)

[7 APPENDIX 20](#_Toc176971717)

[7.1 SAP Architecture Center – UX Mockup 20](#_Toc176971718)

# Executive Summary

Today's software environments blend on-premises, cloud, and multi-cloud systems. In SAP, this includes a range of applications like SAP S/4HANA and SAP SuccessFactors, integrated with SAP BTP and other external systems. The shift to cloud, especially in integration, extensions, and AI, necessitates detailed solution reference architectures. These guides optimize SAP investments by focusing on security, reliability, TCO, operations, scalability, and performance. SAP BTP’s internal development also needs guidance for cost-effective cloud usage and global scalability. Enterprises today, or “Networked Enterprises,” require scalable, interoperable architectures to support intelligent, integrated systems.

Despite an abundance of online resources—including BTP solution diagrams, assets, and presentations on platforms like the SAP Community and GitHub—the scattered and diverse information often leaves companies navigating through a cluttered landscape. This disarray can lead to architectural misuse, improper sizing in contracts, mixed opinions about SAP’s role in hybrid landscapes, and challenges with TCO and scalability. Existing resources like blog posts, GitHub samples, and SAP Discovery Center missions touch upon various aspects of SAP architecture patterns, but they often exist in silos and vary in depth for different audiences. These fragmented insights lack the comprehensive, interconnected guidance needed for architecting, implementing, managing, and optimizing resilient, secure, and efficient SAP solutions. Critical elements such as performance optimization and cost-efficiency, essential for seamless SAP operations, often fall through the cracks.

It is important to note that we are not alone in recognizing the need for a cohesive architectural framework. Competitors in the enterprise software space and hyperscalers already offer well-architected frameworks and tools, guiding their customers to better outcomes. These frameworks have set a standard in the industry.

[AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)

[Microsoft Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)

[Google Cloud Architecture Center](https://cloud.google.com/architecture/framework)

[Alibaba Cloud Well-Architected Framework](https://www.alibabacloud.com/architecture/well-architected-framework)

[Salesforce - Well-Architected](https://architect.salesforce.com/well-architected/)

[Oracle Architecture Center](https://www.oracle.com/cloud/architecture-center/)

Recognizing the benchmark set by these frameworks, it’s critical for SAP to create a similar foundation, notably with the recent formation of our Office of the CTO (OCTO). **We propose to build an SAP Architecture Center tool** (name pending) based on Well-Architected Framework principles, providing a centralized platform with actionable reference architectures and fostering a community of practice. This will empower customers, partners, and SAP teams by offering a single access point at architect.sap.com (domain pending) with comprehensive resources for SAP architects, helping them architecting enterprise landscapes and building cloud solutions that are reliable, secure, performant, scalable, sustainable, and cost-effective. In addition, we can leverage the power of GenAI for automatic validation of solution architectures to identify anti-patterns and incorrect patterns, suggest best practices, and utilize Joule to enhance the interactivity and overall user experience of the tool. By anchoring this community of practice in CTO-certified SAP reference architectures, the framework will guide and elevate SAP implementations to their highest potential. As a result, this initiative will build trust and credibility, positioning us as a reliable and innovative leader in the cloud market.



*Figure 1 – A Visual representation of SAP Architecture Center tool*

This Architectural Decision Record **(ADR) advocates for the creation of a distinctive SAP Architecture Center tool **(name pending) based on Well-Architected Framework principles.

# Context

What is the problem?

## Problem Statement and The Need for an SAP Architecture Center

At present, SAP lacks a consistent and coherent approach to reference solution architecture best practices and a clear and authoritative channel for disseminating CTO-endorsed reference architectures. This leads to the spread of incorrect and unvalidated architectures on various channels. SAP Community blogs often inadvertently publish architectures which promote competitive hyperscaler services through anti-patterns, and neglect non-functional pillars such as security, scalability, resiliency, reliability, and TCO.

The absence of a well-defined authoring and governance process for SAP-endorsed reference architectures, managed by the Office of the CTO, further exacerbates these issues, creating uncertainty and diminishing trust among customers and partners. Typically, the Architecture Centers managed by our enterprise software peers are overseen by their corresponding Office of the CTO, which guarantees strong governance, reliability, and confidence.

**The Need for an SAP Architecture Center:** To address these gaps and elevate SAP's position in the market, we propose the creation of an SAP Architecture Center and a Well-Architected Framework (WAF) tool that will serve as a centralized, cohesive platform for SAP customers, partners, and internal teams.

This tool will differentiate itself by offering:

- **Comprehensive and Interactive Architectures:** Moving beyond static content, the SAP WAF Tool will provide detailed, interactive architectures that adhere to the principles of a well-architected framework, covering all essential pillars such as security, reliability, performance, scalability, and cost-efficiency.
- **Architecture Validation and Best Practices:** Offers a GenAI-based architecture validator for users (customers, partners, SAP Enterprise Architects) to upload and automatically validate their architecture diagrams, receiving actionable recommendations on best practices and identifying potential anti-patterns with minimal intervention. For those needing more assistance, a high-touch validator with a paid engagement model (e.g. Dev2X will offer consulting service to customers/partners who want to optimize their complex landscapes, like what the AWS Well-Architected Tool offers.
- **Community of Practice (CoP):** The platform will foster a collaborative environment where stakeholders can contribute, edit, and refine architectures together, anchored by CTO-certified SAP reference architectures. This will create a trusted space for shared learning and innovation.

**Governance and Credibility:** A key differentiator for the SAP Architecture Center will be its strong governance structure, managed by the Office of the CTO (OCTO). This will ensure that all published architectures undergo rigorous vetting and are aligned with SAP's strategic goals. By establishing a clear authoring and governance process, we will eliminate the confusion currently caused by disparate, unvetted content available on platforms like community.sap.com.

The SAP Architecture Center, accessible at architect.sap.com (domain pending), will be the new tool that provides governed and endorsed architectures from the Office of the CTO. These architectures will adhere to the principles of Well-Architected Framework (WAF), which covers best practices for designing and operating reliable, secure, efficient, and cost-effective SAP cloud solutions.

*Figure 2 – Vision of SAP Architecture Center underpinned by key tools and non-functional pillars.*

## Comparison of existing Well-Architected Frameworks Across Major Cloud Providers

Competitors in the enterprise software space and hyperscalers already offer well-architected frameworks and tools, guiding their customers to better outcomes. Below is a comparison of the well-architected frameworks provided by major cloud providers, including AWS, Microsoft Azure, Google Cloud Platform (GCP), Salesforce, and Oracle.





AWS

Microsoft Azure

Google Cloud Platform (GCP)

Salesforce

Oracle

Link to their offering

[AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)

[Microsoft Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)

[Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)

[Salesforce - Well-Architected](https://architect.salesforce.com/well-architected/)

[Oracle Architecture Center](https://www.oracle.com/cloud/architecture-center/)

Design Principles

6 Key Pillars

5 Key Pillars

4 Key Pillars

5 Key Pillars

4 Key Pillars

Pillars

Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability

Cost Optimization, Operational Excellence, Performance Efficiency, Reliability, Security

Operational Excellence, Security, Reliability, Cost Optimization

Security, Performance, Operational Excellence, Cost Efficiency, Reliability

Reliability, Cost, Security, Flexibility

Framework name

AWS Well-Architected Framework

Azure Well-Architected Framework

Google Cloud Architecture Framework

Salesforce Well-Architected

OCI best practices pillars

Tools

AWS Well-Architected Tool, AWS Well-Architected Lenses

AWS CAF (Cloud Adoption Framework)

Azure Advisor, Azure Well-Architected Review

Architecture Center

Pattern & Anti Pattern validator

Salesforce Diagram Framework

Architecture Basics

Cloud Architecture Center, Cloud Adoption Framework

Reference Architectures

Yes

Yes

Yes

Yes

Yes

Pricing

Free + Premium Services

Free + Premium Services

Free + Premium Services

Free + Premium Services

Free + Premium Services

Support and Resources

AWS Support, SA Engagements

Microsoft Experts, Support Plans

GCP Support Plans, Google Cloud Experts

Salesforce Support, Customer Success Services

Oracle Support, Professional Services

Documentation and Guidance

Whitepapers, Labs, FAQs, Videos

Best Practices, Guides, Resource Center

Best Practices, Articles, Blogs

Guides, Whitepapers, Best Practices

Cloud Adoption Framework, Best Practices Guidelines

Assessment Framework

Well-Architected Review Tool

Well-Architected Review

Optimize, Assessments

Salesforce Architecture Review (Well-Architected Review)

Cloud Adoption Framework, Assessment Tools

## Increased importance of architecture with RISE and GROW with SAP

In consideration of our strategy related to growth in public cloud, the global profile of our customers, and SAP’s ongoing data center expansions, high-performant, globally accessible applications are table stakes. As SAP BTP runs on many hyperscalers, and we empower our customers to make their own choices, we must support them to deliver a consistently positive user experience.

Latency and performance are critical topics in cloud architectures, and SAP is no different. This is because they directly impact user satisfaction, productivity, and efficiency. High latency can cause delays, errors, and frustration for users who interact with cloud applications, especially when they involve complex or data-intensive processes. Performance issues can also affect the scalability, reliability, and security of cloud solutions, as well as the cost and complexity of managing them. Therefore, cloud architects need to consider various factors that influence latency and performance, such as network design, data distribution, load balancing, caching, compression, encryption, and optimization techniques.

Never is this more important than in public cloud landscapes, where extensibility is frequently performed in a side-by-side manner. Equipping the SAP ecosystem with clear guidance and direction, explaining the relationships between dozens (or more) of independent services, and sharing benchmarks and considerations for optimization, either sets them up for success, or leaves them to determine their own way with considerable input from our competitors and from well-meaning architects who don’t have the sufficient knowledge and resources to plot the appropriate course.

As SAP accelerates initiatives such as RISE and GROW with SAP, the demand for actionable architectures with sufficient detail and transparency on latency and performance will increase. This is especially true in cases where BTP is co-located with S/4HANA PCE deployments, as cross-region integration scenarios become increasingly possible. These architectures will enable SAP enterprise architects and their counterparts in the customer and partner organizations to implement, run, and maintain cloud solutions that meet the business requirements, the technical standards, and the best practices of SAP. These architectures will also support the Clean Core strategy, which advocates for minimizing customizations in the core SAP applications and leveraging BTP and Public Cloud services for innovation and differentiation. Moreover, the total cost of ownership (TCO) is another important factor for RISE and GROW deployment, especially if customers are expected to create many enterprise-grade BTP applications for extending their business processes. SAP needs to provide clear guidance and tools for optimizing the cloud costs and avoiding unnecessary or excessive spending.

Another factor that increases the importance of architecture with RISE and GROW with SAP is the competition that SAP faces from the hyperscalers themselves. Many SAP S/4HANA customers have migrated onto hyperscaler landscapes such as Microsoft Azure, AWS, and Google Cloud, and these customers already have millions of dollars of hyperscaler credits. Without any endorsed reference architecture guidance from SAP, hyperscaler solution architects push our RISE & GROW customers to use data, analytics, AI and application integration services directly from hyperscalers without realizing that these anti-patterns present TCO challenges in the long run related to data duplication, master data reconciliation, and authorization/principal propagation. Therefore, a CTO-endorsed Well-Architected guidance will differentiate SAP’s offering against those competitive offerings.

## Architecting for mission critical integrations and extensions

Global customers require uptime > 99.999% and cloud solutions that deliver the same for their mission critical processes. Their ERP applications have adhered to this level of uptime for years, and they have the right to expect their key process integrations, automations, and extension applications deliver to this standard as well.

In the current state, reliability-related information for BTP services resides in individual product help guides, with no way of evaluating an entire architecture for requirements associated with regional availability, load balancing, and multi-region disaster recovery of SAP applications. With the reality being that SAP engineering teams don’t have capacity or even the desire to specifically build high availability, failover, and resiliency across all products, the gap can be filled by actionable architectures that demonstrate these non-functional requirements with code, configuration, and creative use of hyperscaler services.

Additional focus on reliability is needed to test, monitor, and optimize the recovery procedures, the capacity planning, and the change management of cloud solutions. These activities are not new, but they are more complex and dynamic in cloud than in on-premises, as they involve multiple layers of abstraction, dependencies, and configuration. Testing the recovery time and point objectives, understanding the usage patterns and scaling triggers, and managing the changes with automation and governance are essential for ensuring the reliability of cloud solutions. These activities also present an opportunity for SAP to provide updated best practices and new improved tooling for cloud architects and developers.

## Optimizing cost of cloud

Gone are the heady days of unfettered cloud spend and subsidies by hyperscalers to offset some of the cost. Customers are now repatriating some of their cloud components back to on-premises, even as SAP pushes for more public cloud adoption. While hybrid environments are the norm for the foreseeable future, there are efficiencies to be gained for the entire value chain (e.g. SAP, partners, customers, hyperscalers) through careful optimization of cloud costs, especially those incurred by mis-sizing of SAP BTP components. The efficiencies gained are likely to be returned to SAP as increased utilization of BTP services.

Currently, there are distinct metrics, levels, and other constraints that make reducing TCO associated with SAP cloud environments challenging. In May 2024 alone, there were ~500K euros in reimbursements for BTP services, mostly related to accidental activation of Premium Integration Suite. In the same timeframe, there were ~5.6M (almost 9% of total platform consumption) euros in contract overages.

In 2023, the total cloud revenue was €13.664 million, with a cost of cloud amounting to €3.749 million, resulting in a cloud gross profit of €9.915 million. The cloud gross margin for 2023 was 72.6%, and it is projected to increase to 75.0% by 2025. The total cloud revenue growth year-over-year is expected to be 27.6% in 2025, while the total cloud costs growth year-over-year is projected to be 18.1%. For the HCM solution area, the cloud revenue in 2023 was €2.290 million, with a cost of cloud of €477 million, resulting in a cloud gross profit of €1.813 million. The cloud gross margin for HCM in 2023 was 79.2%, and it is expected to be 79.4% by 2025. The ISBN solution area had a cloud revenue of €3.867 million in 2023, with a cost of cloud of €717 million, resulting in a cloud gross profit of €3.150 million. The cloud gross margin for ISBN in 2023 was 81.5%, and it is projected to increase to 86.0% by 2025. The Core ERP solution area had a cloud revenue of €3.939 million in 2023, with a cost of cloud of €1.684 million, resulting in a cloud gross profit of €2.255 million. The cloud gross margin for Core ERP in 2023 was 57.2%, and it is expected to increase to 65.5% by 2025. Lastly, the CX solution area had a cloud revenue of €1.092 million in 2023, with a cost of cloud of €311 million, resulting in a cloud gross profit of €781 million. The cloud gross margin for CX in 2023 was 71.5%, and it is projected to be 73.4% by 2025.

The high cost of cloud is primarily due to several factors, including the cost of cloud infrastructure, application management, cloud support, and reuse services. To counter these high costs, several measures are being taken internally through the Cloud Delivery Architecture (CDA) Next Level Transformation (NLT) programs:

1. **Rightsizing Infrastructure**: Regularly adjusting the size of infrastructure to match usage and avoid over-provisioning.
2. **Optimizing Storage Costs**: Implementing strategies to reduce storage costs, such as rightsizing databases, reducing logs, and using database compression.
3. **Reducing Data Transfer Costs**: Designing application architecture to minimize data transfer between components and using content delivery networks (CDNs) to reduce bandwidth consumption.
4. **Optimizing Application Performance**: Using profiling and monitoring tools to identify performance bottlenecks and implementing caching and data compression techniques.
5. **Implementing Cost Monitoring and Optimization Processes**: Regularly monitoring and analyzing costs, reviewing utilization of reserved instances and savings plans, and using automated anomaly detection to prevent cost surprises.
6. **Modernizing Technology**: Upgrading to new generations of technology that offer performance gains at lower prices.
7. **Committing to Resource Usage for Better Prices**: Utilizing commitment-based pricing models offered by hyperscalers to reduce costs.
8. **Switching Off Unused Resources**: Identifying and stopping resources that are not in use to save costs.
9. **Reviewing Third-Party Licenses**: Regularly reviewing and renegotiating the price for licenses of third-party software components or services.
10. **Investing in Training and Knowledge Sharing**: Encouraging collaboration and knowledge sharing among team members to avoid costly mistakes and duplicated efforts.

In addition to these measures, adopting a Well-Architected Framework and providing Architecture Guidance, both internally and externally, can further optimize the total cost of cloud operations (TCO). Internally, a well-architected approach can guide teams to design solutions that are scalable and efficient. Customers, partners, and internal BTP developers all require the type of transparency that SAP made famous for our on-premises ERP, with SAPS benchmarking and supporting materials. They need guidance on which services to use when, how to size them, and how to monitor and iteratively improve their cost of ownership.

Here are some practical instances of how large enterprises enhance their Total Cost of Ownership via Well-Architected Frameworks:

- **Media & Entertainment: Netflix (Streaming Services)**
- - **Context: Netflix, a global streaming service, relies on cloud infrastructure to deliver content to millions of users globally. The scalability and flexibility of cloud computing are vital for managing demand and providing a smooth user experience.**
- **WAF Impact: Utilizing AWS’s Well-Architected Framework, Netflix consistently reviews and enhances its cloud architecture. This involves right-sizing resources, optimizing storage costs, and improving CDN efficiency. The framework helps identify underutilized resources, automate scaling, and implement cost-effective data transfer methods, leading to significant cost savings while maintaining high performance**
- **Outcome: Netflix has saved substantially by optimizing cloud resource usage, enabling reinvestment in content creation and further innovation.**
- **Financial Services: Capital One (Banking)**
- - **Context: Capital One, a major bank, has migrated much of its IT operations to the cloud, utilizing AWS for digital transformation. In this highly regulated sector, balancing cost efficiency with security and compliance is crucial.**
- **WAF Impact: Capital One leverages AWS’s Well-Architected Framework to ensure its cloud architecture remains both cost-effective and secure. This framework aids them in optimising computing resources, automating infrastructure management, and using cost management tools. This systematic approach helps Capital One balance performance and compliance while preventing over-provisioning and reducing cloud waste.**
- **Outcome: By adhering to WAF principles, Capital One lowered its overall cloud expenditure and enhanced its operational efficiency, leading to more predictable and reduced Total Cost of Ownership (TCO).**
- **Retail: Coca-Cola (Beverage Industry)**
- - **Context: Coca-Cola uses cloud infrastructure for its global supply chain, customer engagement, and data analytics, needing cost-efficient resources for high demand and worldwide operations.**
- **WAF Impact: By adopting the Microsoft Azure Well-Architected Framework, Coca-Cola optimizes its cloud deployment with cost management tools, regular resource reviews, and automated scaling and redundancy. This prevents overspending on underutilized resources and supports data-driven scaling decisions.**
- **Outcome: Coca-Cola has reduced cloud costs by identifying inefficiencies and optimizing resources, leading to lower TCO and better ROI on its cloud investments.**

## Security considerations in modern cloud architectures

SAP has been synonymous with security for many years. There are safeguards in place to make BTP secure by default that are extensive ([https://www.sap.com/documents/2024/06/e0f9895d-c47e-0010-bca6-c68f7e60039b.html](https://www.sap.com/documents/2024/06/e0f9895d-c47e-0010-bca6-c68f7e60039b.html)), but do not cover scenarios where developers still must secure new entry points via extension applications, APIs, and service account / non-human access to systems across BTP and hyperscaler environments.

This extends to architects, IT, and partners who must take care of public and private networking to access on-premises systems, planning of hybrid topology, different considerations for connectivity (e.g. Private Link vs. public internet, private cloud, etc.). Hyperscalers are also frequently part of this process, as customers likely have existing investments with one or more already.

Never has security been more important than with the advent of Generative AI and applications and use cases dealing with Personally Identifiable Information (PII) or other confidential data. There are architectural decisions ranging from whether to host an LLM or send prompts through the public cloud, to anonymization of PII in-flight, to fundamental software architecture of SAP products ([https://www.wiz.io/blog/sapwned-sap-ai-vulnerabilities-ai-security](https://www.wiz.io/blog/sapwned-sap-ai-vulnerabilities-ai-security)) where uniform guidance is needed. The Istio-related exploit in the previous link is relevant not only to AI Core, but to Kyma where Istio is used to provide service mesh, and to any SAP product looking for ways to run untrusted 3rd party code.



Security is a crucial aspect of actionable reference architectures, especially in scenarios involving one or more of cloud, on-premises, and hyperscaler environments. Authentication, authorization, and single sign on are essential for ensuring data protection, user access, and seamless workflows across different applications and platforms, and it needs to be frictionless for end users at the same time. SAP Cloud Identity Services provides the capabilities to enable these security features at every level, from BTP subaccounts to multi-tenant applications and across SAP Business Applications.

However, there is still a gap in the available guidance and best practices for implementing security-related patterns in real-world situations. The information that exists is either too high level, too trivial, or too specific to certain use cases. There is a need for more comprehensive and practical documentation on how to design and deploy secure solutions with SAP BTP and SAP Cloud Identity Services. For example, even in the excellent [SAP BTP Developer’s Guide tutorials](https://developers.sap.com/tutorials/add-authorization.html) authorization and authentication are mocked. [CAP documentation](https://cap.cloud.sap/docs/guides/security/authorization#role-assignments-with-ias-and-ams) paints the grim picture of IAS/AMS vs. XSUAA as an ongoing issue with pros and cons of extension development in either direction. With thousands of [Stack@SAP](https://sap.stackenterprise.co/search?q=%5Bbtp-core-security%5D+or+%5Bias%5D+or+%5Bxsuaa%5D) questions on BTP security, it is clearly top of mind with our internal development teams as well. Moreover, the best practices and guidance to SAP Identity Management customers on moving their identity management scenarios to Microsoft Entra ID are missing on certified SAP channels. Some guidance is available on Microsoft Community Blogs (e.g. https://techcommunity.microsoft.com/t5/microsoft-entra-blog/microsoft-and-sap-work-together-to-transform-identity-for-sap/ba-p/2520430), but it is not endorsed by SAP or aligned with SAP's security standards and recommendations.

Deep and consistent guidance on these security-focused topics and attention to this aspect can be improved tremendously and be well represented in actionable reference architectures.

## Updating the SAP Center of Excellence

Historically, the SAP CoE has been focused on developing and operating on-premises workloads, with specialties such as Basis and ABAP development at the forefront. Similarly, SAP lenses provided by AWS focus exclusively on running these on-premises workloads in the private cloud and how to translate SAP best practices for on-prem deployments into AWS architectures. Effective cloud platform management requires observability, automation, infrastructure as code, CI/CD practices, and various process and organizational improvements already covered by established WAF methodology. Reference architectures should address some of these areas, specifically those where an architecture is open to interpretation or replacement by competitive hyperscaler services. They should also leverage established methodologies for CoE-related functions when possible.

# Key Assumptions and Boundary Conditions

Which assumptions were made? What are the boundary conditions?

- To ensure efficiency and avoid redundancy, it is essential to rely on existing sources of detailed information such as the BTP Developer Guide/Golden Path, Extension and Integration Methodologies, and other established resources. These sources provide valuable insights and guidelines that can be leveraged without the need for reinvention in the SAP Architecture Center.
- Incorporating foundational aspects of the Amazon and Azure Well-Architected framework is also crucial, especially those elements that are not unique to SAP. This includes practices such as applying Well-Architected Pillars to SAP applications, allocating time for continuous improvements, and documenting and sharing lessons learned. These practices help in maintaining a robust and secure architecture.
- The primary goal of the Architectural Decision Record (ADR) is the creation of an OCTO-managed tool rather than a process. This approach ensures that the focus remains on developing practical solutions that can be directly implemented, providing tangible benefits and efficiencies.

# Solutions considered

Which potential solutions were considered? What are their pros and cons?

In response to the challenges stated above, we have done both an evaluation of existing solutions, as well as for a newly created solution, mentioned below, but hereafter referred to as SAP Architecture Center. Each solution is evaluated on its suitability as a reference architecture catalogue, its ability to provide deep architecture feedback via tooling or services, and how inclusive it is for the SAP Ecosystem to contribute.

## SAP Architecture Center (our proposal)

The first solution considered is the OCTO proposed SAP Architecture Center. It is based on Well-Architected Framework principles, providing a centralized platform with actionable reference architectures and a collaborative space for customers, partners, and SAP to create and evolve SAP architectures together. It will empower the SAP ecosystem to build cloud solutions that are reliable, secure, performant, scalable, and cost-effective.

Additionally, we can enable customers and partners to submit their own solution diagrams for low-touch validation by the SAP Architecture Center. This feature will leverage GenAI to automatically check the diagrams for best practices and anti-patterns and provide feedback and suggestions via a Joule interface. For more complex or critical scenarios, we can also offer a high-touch mode where stakeholders can request a comprehensive review of their SAP architecture and landscape by our experts. This service will follow a charging model and will be delivered by Enterprise Architects from the CS&D organization.

**By anchoring this community of practice** in CTO-certified SAP reference architectures, the framework will guide and elevate SAP implementations to their highest potential. As a result, this initiative will build trust and credibility, positioning us as a reliable and innovative leader in the cloud market.



*Figure 3 – Vision of SAP Architecture Center underpinned by key tools and non-functional pillars.*

Note: Refer to the [appendix section](#_SAP_Archietcture_Center) for an idea of the potential user experience with the proposed SAP Architecture Center

As the solution is only partially developed, the details below represent the vision for this channel, alongside evaluated pros and cons. The primary current UX for SAP Architecture Center is [Docusaurus](https://docusaurus.io/), deployed to [GitHub pages](https://docusaurus.io/docs/3.4.0/deployment#deploying-to-github-pages) but the web application can be deployed anywhere as a React app. This allows us to treat reference architectures like code, utilizing a channel and repository that all software developers and architects are familiar with. It additionally lets us achieve a high level of automation and scale the creation and maintenance of reference architecture-related artifacts to both internal and external colleagues, as below.

*.*

### Well-Architected Framework Pillars

The Well-Architected Framework is a comprehensive set of best practices and guiding principles designed to help cloud architects build secure, high-performing, resilient, and efficient enterprise architectures and cloud solutions in the SAP context. It is centered around five key pillars: Operational Excellence, Security, Reliability, Performance, and TCO (Total Cost of Operations/Cost of Cloud). Each pillar provides detailed insights and strategies on how to optimize your architecture to meet specific business needs and industry standards. By following the Well-Architected Framework, organizations can systematically review and improve their SAP cloud environments, ensuring they align with proven architectural principles and practices. This helps them deliver better value to customers, maintain regulatory compliance, and effectively manage resources while optimizing costs.

### Reference Architecture repository

- By utilizing GitHub as the underlying repository and making reference architectures machine readable (e.g., as Draw.io pseudo-xml/html or JSON) we start making them available for use with infrastructure as code and platform automation techniques such as Terraform and shrink the space between architecture as an image on the page, and it being realized in a customer environment.
- GitHub provides support for workflows with approval, version control, and automation for updates to core content.
- GitHub is already licensed for SAP use and is broadly adopted externally via SAP and SAP-samples organizations. It would incur no additional license or infrastructure cost to deploy and minimizes cost of ownership.



Figure 4 - SAP Architecture Center powered by Docusaurus and GitHub. The architecture on the left could also be fulfilled by a private repo on github.com. The assumption is that new reference architectures can be developed but not released to customers until they are ready.

### SAP Architectures

The "**SAP Architectures**" section is an inventory of certified actionable reference architectures , design patterns for building enterprise architectures and applications leveraging SAP Products, SAP BTP, and hyperscaler services. Users can explore a wide range of architecture categories, such as Application development, Integration, Automation, AI, data analytics, hybrid cloud, and many more. Each category contains a set of reference architectures that provide detailed blueprints and guidance for implementing specific solutions on SAP. **Furthermore**, these patterns provide best practices and proven approaches for addressing specific architectural challenges, such as scalability, resilience, security, and performance optimization.

These reference architectures are designed by SAP and the community and are validated by SAP experts. A key differentiator for the SAP Architecture Center will be its strong governance structure, managed by the Office of the CTO (OCTO). This will ensure that all published architectures undergo rigorous vetting and are aligned with SAP's strategic goals. By establishing a clear authoring and governance process, we will eliminate the confusion currently caused by disparate, unvetted content available on platforms like community.sap.com.

Each architecture in the "SAP Architectures" section is accompanied by detailed documentation, including architecture diagrams, component explanations, and guidance on how to implement and deploy the solution, and finally complemented with real-world customer scenarios. Users can also find links to relevant SAP documentation, tutorials, DC missions and code samples to further assist them in understanding and applying the architectures.

The "SAP Architectures" section is regularly updated with new architectures to meet the evolving needs of the SAP ecosystem, incorporating the latest SAP Products, BTP services, and best practices. It serves as a valuable resource for architects and developers to explore, learn, and adopt proven architectural patterns, helping them build robust, scalable, and secure applications within SAP enterprise landscapes.

### Architecture Validator

Designing solutions for hybrid customer landscapes is complex because RISE and GROW customers have significant license credits for hyperscaler services in addition to SAP services. When consultants or architects from partner or customer companies create these solutions, they frequently end up using more AWS, Azure, or GCP services instead of equivalent SAP BTP services, which we call "anti-patterns." This usually happens due to a lack of information, resulting in SAP BTP services being underutilized.

One key responsibility of the PAA team is to work with hyperscalers to define the right usage of their services and develop joint reference architectures (JRA). Currently, we share these JRA through blog posts, the DC missions tool, and presentations. However, it's challenging for the PAA team alone to validate these solution architectures, especially at scale. Therefore, there's a need for a tool that provides insights on whether a given pattern is correct or an anti-pattern and what additional services should be used as best practices.

Using the [SAP BTP metadata](https://github.com/SAP-samples/btp-service-metadata), you can already see, and use in code, the datacenter availability of services, service plans, API, and documentation. By enhancing [BTP service icons](https://pages.github.tools.sap/btp-solution-diagram/btp-diagram-guideline/) with this information, we can validate or propose a customer’s BTP topography in terms of regions, hyperscaler, etc. This brings an additional level of detail and value to reference architectures because they become actionable as a result.

Once architecture diagrams are backed by BTP service metadata, it opens the door for downstream integration with enterprise architecture management tools, such as LeanIX, as well as the [Unified Customer Landscape (UCL)](https://sapedia.one.int.sap/wiki/Unified_Customer_Landscape). In a realized sense, this means that a customer adopts a reference architecture, beginning with a diagram, but resulting in a fully provisioned SAP environment, with any customer-specific adaptations documented in their enterprise architecture repository, and available as part of their landscape model.

Ensuring machine readable reference architectures, connected to real customer landscapes, enables us to build a architecture validation tool.

Introducing the Architecture Validator within the proposed Architecture Central tool will streamline the architecture review process through a multi-tiered approach, providing automated intelligence, expert consultation, and comprehensive professional support tailored to address a wide range of architectural challenges.

1. **Low-Touch: Intelligent Automated Architecture Review**: Leveraging GenAI to automatically validate architecture designs, recommend best practices, and identify potential issues or "anti-patterns." This provides a quick, automated review with minimal human interaction.
2. **Expert Consultation**: For more complex cases that cannot be fully addressed by the automated tool, our OCTO PAA team can offers a free 1-hour consultation to review customers' or partners' architecture designs, offering expert advice and personalized feedback.
3. **High-Touch: Comprehensive Professional Services**: For additional support beyond the personalized consultation, we can provides access to paid professional services by either OCTO or CS&D organization. These typically begin with Well-Architected Reviews conducted by SAP Certified Solutions Architects or Authorized SAP Partners (WAF Certified), who meticulously evaluate an organization’s architecture against the framework’s five pillars: Operational Excellence, Security, Reliability, Performance Efficiency, and Cost Optimization. Following the review, SAP professionals offer tailored workshops and advisory sessions to address identified gaps, providing strategic guidance and hands-on best practices. For implementing recommendations, SAP consulting services or premium engagement teams assist in re-architecting solutions, enhancing security, optimizing costs, and improving overall performance. These professional services can be accessed via the SAP Architecture Center Tool, accredited SAP Partners, and direct engagements with SAP Professional Services, ensuring robust support and expertise throughout the cloud adoption and optimization journey.

With this approach, customers, partners, and internal SAP teams can better evaluate solution architectures and stay within the SAP ecosystem, avoiding anti-patterns and ensuring optimal use of SAP BTP services. This will provide a reliable reference and improve the overall quality of solution architectures

### Foundation for Community of Practice

**Objective**

Software communities of practice are defined by 2 primary themes: a group of motivated people who want to contribute to a topic, and a channel where they can make the actual contributions. GitHub is the de facto industry standard for Open-Source projects with key contributors from many different companies. In the popular [btp-cap-multitenant-saas](https://github.com/SAP-samples/btp-cap-multitenant-saas) repository, 26 distinct issues, raised by 18 different people, have been resolved, tested, and merged in the last 12 months. SAP customers and partners have made direct contributions to this sample.

A dedicated [SAP Community interest group](https://community.sap.com/t5/enterprise-architecture/gh-p/Enterprise-Architecture) for Enterprise Architecture has existed since 2022, but sees fairly limited activity from SAP experts. This group is the logical home for engaging on the topic of reference architectures and promote additional exchanges with the enterprise architecture community.

The SAP Architecture Center Community of Practice aims to create a collaborative space where SAP architects globally can share knowledge, design, and improve enterprise architectures together. Our goal is to build a community where everyone from ecosystem can contribute, edit, and refine architectures, guided & governed by CTO-certified SAP standards, creating a trusted space for shared contributions and learning.

**Activities**

1. **Build and maintain new architecture patterns in an open-source manner:**
2. - SAP employees can contribute internally.
- Certified SAP architects from outside SAP can contribute new patterns. (Open-source collaboration on architecture patterns by internal SAP staff and external certified experts.)
3. **Provide feedback on existing architecture patterns:**
4. - Anyone can offer suggestions for improvement.
- Feedback goes through a review process before being incorporated. (Gathering and reviewing feedback from the community to enhance existing patterns.)
5. **Request new architecture patterns: **Identify in-demand patterns that the ecosystem wants from SAP
6. **Offer certification to scale with SAP WAF experts from partner ecosystem (via SAP Learning)**
7. - Become a certified SAP Well Architected Framework (WAF) Expert (via SAP Learning)

. Certified partners can conduct SAP WAF Assessments for customers.

1. **Share knowledge about SAP architectures:**
2. - Publish blog posts and YouTube videos about architectures.
- Collaborate with customers and partners in knowledge sharing. (Disseminating architecture knowledge through blog posts, videos, and collaboration with stakeholders.)

**Governance:**

Establish a governance process to build credibility to eliminate the confusion currently caused by disparate, unvetted content available on platforms like community.sap.com.

- Managed by the Office of the CTO (OCTO) (see stakeholders)
- Published architectures undergo rigorous vetting and are aligned with SAP's strategic goals.

### Cons of this solution

- Investment is needed to build a productive SAP Architecture Center and SAP Well-Architected Framework Tool
- Existing communities are sparsely used, requiring a significant push to kickstart and maintain engagement

## BTP Reference Architectures on SAP Discovery Center ([link](https://discovery-center.cloud.sap/refArchCatalog/))

The SAP Discovery Center tool is designed to help users effectively implement use cases on the SAP Business Technology Platform (BTP). It provides step-by-step missions with expert guidance and community support. The platform includes overviews of individual BTP services, pricing models, related missions, future roadmaps, and inspiring customer stories. The tool recently introduced an architecture catalog featuring a list of reference architectures.

One key advantage of the SAP Discovery Center is its recognition as a well-known channel that provides access to missions and various other related assets to customers and partners. Additionally, it has an established process for the publication and maintenance of reference architectures.

However, while the SAP Discovery Center is a useful tool for implementing use cases on the SAP Business Technology Platform, it falls behind cloud providers’ well-architected framework tools in offering dynamic content, validation tools, community engagement, and comprehensive coverage of non-functional aspects. This makes the SAP Discovery Center less effective for organizations seeking holistic and optimized SAP cloud architectures. Here are the main gaps in the current SAP Discovery Center Architecture Catalog:

### Cons of this solution

1. **Static Content Limitation:** The existing Architecture Catalog offers static content with limited scope—only a single page of brief descriptions and diagrams—restricting the ability to fully explore the pillars of a Well-Architected Framework.
2. **Lack of Validation Tools:** The current catalog does not provide any validation tooling, preventing stakeholders such as customers, partners, and SAP Enterprise Architects from uploading and validating architecture solution diagrams for best practices or identifying anti-patterns involving competitive hyperscaler services.
3. **Coverage of Non-Functional Aspects:** SAP Discovery Center's reference architectures do not adequately cover essential non-functional aspects such as security, TCO, operational efficiency, scalability, and reliability, whereas cloud providers’ well-architected framework tools such as Azure Architecture Center offers detailed guidelines and best practices that thoroughly address these critical non-functional perspectives
4. **Lack of Architecture Advisory**
5. **Absence of a Community of Practice (CoP):** The catalog is not a collaborative platform where stakeholders—customers, partners, mentors, and enterprise architects—can co-create and refine architectures together.
6. **Governance Framework:** Typically, with cloud providers’ well-architected framework tools, the governance and vetting process for content is overseen by the Office of the CTO, ensuring high-quality, reliable, and strategically aligned content

## Leveraging Existing Sources

Some of the existing solutions at SAP cover different aspects and dimensions of enterprise solution architectures. These resources can be used to support the broader vision of the architecture center, while also benefiting from the unified architecture center tool.

### CPA Working Groups ([link](https://pages.github.tools.sap/CPA/landing-page/technology-guidelines/))

**Cross-Product Architecture (CPA)** is a collaboration model that brings together experts from all board areas to align on technology requirements and drive cross-product architecture decisions

Internal projects and initiatives produce numerous Architecture Decision Records (ADRs) and Architecture Concept Documents (ACDs), but these architectures, which are candidates for mass consumption, are not easily accessible if they are documented and archived in Microsoft Word documents within CPA Workstreams.

### SAP BTP Guidance Framework ([link](https://help.sap.com/docs/sap-btp-guidance-framework/guidance-framework/what-is-sap-btp-guidance-framework))

The SAP BTP Guidance Framework is a central resource for architects, developers, and administrators to build and operate enterprise-grade solutions on SAP Business Technology Platform (BTP). It provides decision guides, reference architectures, methodologies, and DevOps principles, helping users choose the best technology options, improve cloud maturity, and follow best practices for developing and managing SAP BTP solutions. The reference architectures section is internally linked to the Discovery center architecture catalog discussed in [section 4.2](#_Reference_Architectures_on)

### BTP Solution Diagram Repository ([link](https://sap.github.io/btp-solution-diagrams/))

This repository includes latest updates and ready-to-use templates to develop high quality diagrams of architectural landscapes. Is the single source of truth for BTP Architects for solution diagrams. A BTP solution diagram illustrates the architecture and elements of a solution developed using SAP Business Technology Platform. It demonstrates how various services and technologies within the platform are employed to meet distinct business needs. Each BTP solution diagram offers a visual outline of the total solution configuration and its operational flow

### Internal sources hosting Architectures

Here are some internal resources related to reference architectures:

- Enterprise Architecture Group Blog Posts ([link](https://community.sap.com/t5/enterprise-architecture-blog-posts/bg-p/Enterprise-Architectureblog-board))
- SAP Enterprise Architecture Methodology ([Workkzone](https://workzone.one.int.sap/site" \l "workzone-home&/groups/Kw5OEs5RdD13zDI4wjg1sI/workpage_tabs/BIWmwWDcwBpRUZH7V3Mgsl))
- Reference Architecture & EA Methodology ([MS Teams group](https://teams.microsoft.com/l/channel/19%3a286a9f5dd10a4a549cce58b467dab47e%40thread.skype/20%2520Working%2520Group%2520(Core%2520Team)?groupId=9d04d487-efa3-4d8b-b0b6-e100b22a3608&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7)) - managed by Andreas Poth
- TG05 - Industry Reference Architecture ([link](https://github.tools.sap/CentralEngineering/TechnologyGuidelines/tree/main/tg05#summary)) - TG lead: Andreas Poth

# Decision

Which considered solution was chosen? Why?

Also explain what are the consequences of the decision.

The SAP Discovery Center is a well-established channel for publishing use cases (missions) and offers a comprehensive service catalog where users can view pricing, availability, and license contracts for SAP BTP services. Additionally, it features a Reference Architecture catalog that includes snippets of architecture solution diagrams and short abstracts explaining the purpose of each architecture. However, there are several challenges associated with the current setup. Firstly, there is no centralized channel within SAP for defining Reference Solution Architectures based on Well-Architected Framework pillars, which cover best practices and non-functional requirements. Internal projects and initiatives produce numerous Architecture Decision Records (ADRs) and Architecture Concept Documents (ACDs), but these architectures, which are candidates for mass consumption, are not easily accessible if they are documented and archived in Microsoft Word documents within CPA Workstreams. Furthermore, most customer-facing architecture guidance exists as large Microsoft PowerPoint files, which are cumbersome to maintain and version control. In the worst-case scenario, outdated and modified versions of these files are circulated and used in customer conversations across regions, often misaligned with CPA guidance and the company's Technology Strategy. Additionally, there is no central place where customers and partners can validate and get guidance for their architecture problems, unlike hyperscalers such as AWS, Microsoft Azure, and GCP, which provide architecture validation as a service. Moreover, there is no architecture community of practice for SAP architects and developers in our ecosystem. Architectures are authored and maintained by a select few in the T&I unit, which does not scale. To address these issues, we propose an Office of the CTO-managed SAP Architecture Center. This center would enable internal stakeholders, such as Enterprise Architects from the CS&D organization and CSPs, to contribute and manage architectures. It would also allow our external ecosystem to contribute SAP architectures. Other channels, such as the SAP Discovery Center, can continue their objective of publishing service catalogs and SAP BTP use cases without disruption.

The decision to establish an CTO-endorsed SAP Architecture Center comes with several consequences. On the positive side, it will create a centralized repository for all reference architectures, ensuring that they are easily accessible and aligned with SAP's strategic goals. This will enhance collaboration and knowledge sharing among architects, developers, and other stakeholders, leading to more innovative and efficient solutions. Additionally, it will provide a trusted space for shared learning and innovation, where stakeholders can contribute, edit, and refine architectures together. This approach will also build trust and credibility, positioning SAP as a reliable and innovative leader in the market.

However, there are also some potential challenges to consider. One significant consequence is the need for a governance structure to manage and maintain the community of contributors. This requires dedicated resources and ongoing effort to ensure that the community remains active, relevant, and aligned with the organization's goals.

Furthermore, there is the challenge of maintaining the quality and consistency of the architectures being produced. Without proper oversight and governance, there is a risk that the architectures may not meet the required standards or may become outdated over time.

 

# Decision Protocol

<Record here the individual decision votes of org unit representatives, who have stake and taken part in the decision-making by simply including a screenshot of the [Jira dashboard](https://jira.tools.sap/secure/Dashboard.jspa?selectPageId=100607) of the CPAConnect doc review tool>.

*oppose = do not support decision but accept the decision in case a majority of colleagues support it.

**veto has the power to override the majority of support. If a decision is stopped by veto and cannot to be solved in the WG, those decisions will be taken via the CPA PMO to the CPA Steering and then potentially to Engineering Senior Leadership Team as highest decision-making body.

The decision process is documented on the [CPA Landing page](https://pages.github.tools.sap/CPA/landing-page/participation-and-processes/managing-working-groups-and-clusters/making-and-documenting-important-decisions/).

# APPENDIX

What additional information is relevant?

## SAP Architecture Center – UX Mockup

Here's what the user experience with the proposed SAP Architecture Center might look like (note: this is a conceptual description to illustrate the tool's idea, not an exact UX mockup).



*Screen 1: Home screen*



*Screen 2: Interactive experience via Joule*



*Screen 3: Browse SAP Architectures*



*Screen 4: Detailed SAP Reference*



*Screen 5: Architecture Validator*



*Screen 6: Community of Practice*

