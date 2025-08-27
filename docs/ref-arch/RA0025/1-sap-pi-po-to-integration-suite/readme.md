---
############################################################
# Beginning of Front Matter#
############################################################
#[DO NOT MODIFY] #
############################################################
id: id-ra0025-1 
slug: /ref-arch/5f84ec80cc/1
sidebar_position: 1
sidebar_custom_props:
 category_index:
############################################################
#You can modify the front matter properties below#
############################################################
title: Migrating from SAP Process Integration/Orchestration to SAP Integration Suite
description: Learn about the transition from SAP Process Integration (PI) and Process Orchestration (PO) to SAP Integration Suite, an iPaaS solution for modern integration needs. Discover benefits, migration tools, architectural shifts, and strategies for simplifying integration landscapes and reducing TCO.
sidebar_label: SAP PI/PO to SAP Integration Suite
keywords: [SAP PI/PO migration, SAP Integration Suite iPaaS, Edge Integration Cell, SAP migration tools and assessment]
image: img/logo.svg
tags: [integration, transition]
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
# End of Front Matter#
############################################################
---

SAP Process Integration / Process Orchestration (PI/PO) is a NetWeaver-based solution for meeting cross-domain integration needs that serve both intra- and inter-company scenarios. As it approaches the end of standard maintenance in 2027, customers need to plan migrations to a modern integration solution that offers robust, scalable, and secure integration capabilities. Customers do have the option to extend maintenance until 2030, after which SAP support comes to an end.

The challenge is to identify a solution that fits all necessary scenarios or at least one that addresses the majority of the scenarios. The remaining scenarios can then be migrated to another suitable solution.

SAP Integration Suite is an Integration Platform as a Service (iPaaS) offering from SAP through its multi-cloud Business Technology Platform. It is the ideal solution in the SAP portfolio that can be leveraged by SAP customers looking to migrate from PI/PO.

### Benefits of an iPaaS
SAP Integration Suite provides feature parity with SAP PI/PO and thus is an excellent candidate for seamless transition and migration from PI/PO. It is important to note that SAP Integration Suite provides far more capabilities than PI/PO. For instance, EDA-based integrations are met by (Advanced) Event Mesh, while API Management meets modern requirements like request throttling (rate limiting) and API monetization. The biggest benefit of this is the simplification of the integration landscape. Instead of managing several tools for different integration needs in the landscape, organizations can consolidate the integration workloads on SAP Integration Suite, which offers capabilities that serve all modern integration requirements. Integration Suite capabilities range from process integration (Cloud Integration product) and service mediation (API Management product) to EDA-based integration (the Event Mesh products). The capabilities can be enabled as needed.

The simplification through consolidation brings benefits such as reducing technology spread, which in turn reduces the need to maintain diverse skillsets and dedicated administration and support teams per technology. Integration Suite comes equipped with a centralized integration monitoring feature that simplifies observability and troubleshooting. All of this leads to a reduction in TCO, without any reduction in performance.

### Coverage of Integration Domains
Integration Suite is ideal for integrations that cover cloud-to-cloud and cloud-to-on-premise domains. For integrations that cover on-premise only domains, customers can consider opting for Edge Integration Cell (EIC). EIC provides the same runtime as that of Integration Suite, which has several advantages. Firstly, existing Integration Suite skills in the organization can be leveraged. Next, this allows deployment of the same iFlow with different configurations in Integration Suite and EIC to suit business needs, which reduces testing, maintenance, and upgrade efforts. As the administration of EIC and Integration Suite is available via the BTP cockpit, this makes overall administration simpler.

It is important to recognize that here 'on-premise' doesn't necessarily mean self-hosted data centers. The term 'on-premise' is used to refer to private landscapes, which can be data centers owned and operated by organizations or private networks on Hyperscalers. Refer to [Edge Integration Cell on Hyperscalers](https://architecture.learning.sap.com/docs/ref-arch/263f576c90) for further details about this process and supporting architectures.

### Migration from PI/PO
As both Integration Suite and PI/PO are SAP products, SAP provides a detailed migration guide. In addition to the guide, SAP provides tools like Migration Assessment to estimate the technical effort involved in the migration process and evaluates how various integration scenarios might be migrated. Furthermore, SAP provides migration tooling as part of the Cloud Integration capability that has a wizard-based step-by-step migration mechanism for integration objects residing in PI/PO. These tools help not just in the evaluation and planning stages of the migration project but also help in performing semi-automated migration of artifacts. This enables a robust foundation fostering a more predictable, and thus, successful migration.

Migration Assessment is a standalone capability of SAP Integration Suite, and Migration Planning is an integral part of the Cloud Integration capability. In other words, these are available to SAP Integration Suite customers as part of the subscription.

There are dedicated missions on Discovery Center (see the resources section below) that provide step-by-step guidance on using Migration Assessment and Migration Tooling, as well as SAP partner tools to support testing efforts in the migration project.

## Architecture

### As-Is Architecture
![drawio](drawio/sap_architecture_center_is_eic_pre.drawio)

### To-Be Architecture
![drawio](drawio/sap_architecture_center_is_eic_post.drawio)

## Flow

### Integration Landscape with SAP PI/PO (and Other Solutions)

PI/PO is part of the private solution landscape of the organization and integrates bi-directionally with on-premise SAP products like SAP S/4HANA or Central Finance on one side and SAP or third-party solutions  outside the private landscape. The low-level networking details involving DMZ and firewall rules that enable cross-domain traffic are implicit and not shown in the diagram. PI/PO supports integration over various protocols and adapters.

The organization uses dedicated solutions for API Management and an event broker for EDA-based integrations. While these are hosted on the customer private network, they are used exclusively for cross-domain integrations with cloud-based solutions owned by suppliers and customers of the organization, government compliance solutions, or event stream storage employed for observability and reporting.

### Integration Landscape with SAP Integration Suite and Edge Integration Cell

The SAP Integration Suite takes center stage in managing cross-domain integrations between solutions hosted on the customer private network and cloud-based solutions. The different capabilities of Integration Suite integrate securely with the solution on the customer private landscape through SAP Cloud Connector in an HA setup (not depicted) after routing through the BTP Destination and Connectivity services. This setup provides reliable and secure connectivity while reducing the number of firewall exceptions needed in the customer private network.

Integration Suite capabilities also connect to third-party cloud-based systems via the BTP Destination service. As Integration Suite is a cloud-based service, its IP addresses are publicly available and static in nature. This eases integration with third parties, especially with entities that allow connections only by IP addresses.

For integration scenarios that exclusively involve systems within the customer private network, the organization uses Edge Integration Cell. It allows intra-company traffic to remain within the customer private network. If all solutions integrated by EIC are within the same region of a single Hyperscaler, this setup leads to the avoidance of ingress and egress costs.

## Characteristics

- Clear migration path with suitable tooling and estimates
- Clear segregation of solutions for cross-domain and on-premise only integrations
- Simplification of landscape and operational complexity
- Build once, deploy anywhere approach
- Central administration and monitoring

## Services and Components

1. [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?]region=all)
2. [Cloud Integration](https://help.sap.com/viewer/368c481cd6954bdfa5d0435479fd4eaf/Cloud/en-US/9af2f05c7eb04457aee5906fd8553e00.html)
3. [Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-sap-integration-suite-edge-integration-cell)

## Resources

1. [Migration Guide for SAP Process Orchestration](https://help.sap.com/docs/migration-guide-po/migration-guide-for-sap-process-orchestration/migration-guide-sap-process-orchestration)
2. [Migration Assessment](https://help.sap.com/docs/integration-suite/sap-integration-suite/migration-assessment)
3. [Migration Tooling](https://help.sap.com/docs/integration-suite/sap-integration-suite/migration-tooling)
4. [Operating Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/operating-edge-integration-cell)

## Related Missions

1. [Get Started with Migration to SAP Integration Suite](https://discovery-center.cloud.sap/missiondetail/4408/4694/)
2. [Automate the Migration from SAP Process Integration to SAP Integration Suite with Figaf](https://discovery-center.cloud.sap/missiondetail/3717/3760/)
3. [Automate over 65% of your SAP Integration Suite migration with Int4 solutions](https://discovery-center.cloud.sap/missiondetail/4196/4449/)