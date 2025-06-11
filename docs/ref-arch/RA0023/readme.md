---
id: id-ra0023
slug: /ref-arch/1c5706feb5
sidebar_position: 23
sidebar_custom_props:
  category_index:
    - appdev
    - opsec
    - aws
    - azure
    - gcp
title: DevOps with SAP BTP
description: >-
  Adopt agile DevOps principles on SAP BTP with cloud services and tools for
  streamlined application lifecycle management.
keywords:
  - sap
  - btp
  - devops
  - agile methodology
  - cicd pipelines
sidebar_label: DevOps with SAP BTP
image: img/logo.svg
tags:
  - appdev
  - build
  - cap
  - aws
  - azure
  - gcp
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - bzarske
discussion: 
last_update:
  author: bzarske
  date: 2025-06-06
---

DevOps is a key enabler for achieving high-level agility and quality in development projects – including SAP enterprise environments.

Although DevOps is primarily a cultural approach, tools can help foster agile development principles throughout the lifecycle of applications. To enable corresponding projects on SAP BTP, the platform provides cloud services and offerings for SAP customers and partners, as described in this reference architecture. If you have special needs or existing infrastructure around DevOps, SAP BTP can also be integrated into other setups, as outlined under reasonable alternatives.

SAP BTP offers various development approaches and runtime environments to meet the requirements of different target groups and boundary conditions. This reference architecture focuses on application development on the SAP BTP, Cloud Foundry environment. Details of the setup outlined here may slightly differ for other SAP BTP environments and use cases, while SAP BTP aims to provide similar concepts for the most important use cases covered by the platform. For example, it provides a harmonized delivery process so that changes from different environments can be handled in a synchronized manner. This is especially helpful when changes from different environments contribute to a larger business scenario or application.

## Architecture

![drawio](drawio/devops-with-sap-btp.drawio)

## Flow

To enable your development teams to apply DevOps for their projects on SAP BTP using the corresponding reference architecture, follow these four steps:

1. **Set up Continuous Integration**: A key driver of the agility and built-in quality that DevOps brings is the automation of large parts of the deployment pipeline. You can quickly set up a Continuous Integration / Continuous Delivery (CI/CD) pipeline in the SAP Continuous Integration and Delivery service. Simply select one of the provided pipeline templates for typical SAP BTP development use cases, such as developing a side-by-side extension using the Cloud Application Programming model (CAP) or building compelling UIs using SAP Fiori. After connecting the pipeline to your source code management system, it is executed automatically whenever your development teams submit changes to their source code repository. This enables the pipeline to build and test their changes, providing direct feedback on the quality of their updates. This approach allows developers to benefit from an opinionated agile methodology with direct SAP support, requiring minimal expertise and no need to set up or operate their own CI/CD infrastructure. As a result, the cognitive load of your development teams is reduced. SAP Continuous Integration and Delivery is also part of SAP Build.

2. **Develop**: This CI pipeline is then used by your development teams as part of their development process to qualify their changes. They incorporate required testing frameworks triggered by the pipeline, as proposed by the pipeline templates. For actual development, they use SAP Business Application Studio, a powerful and modern development environment available as part of SAP Build or as a standalone service. When developers are satisfied with the test results reported by the CI pipeline, they submit the changes comprising this qualified release candidate to the release branch of their repository, triggering a release pipeline created using provided templates. Besides initiating delivery, this release pipeline can include compliance checks, such as filtering out security flaws from integrated third-party libraries.

3. **Deliver**: The delivery pipeline in SAP Continuous Integration and Delivery can trigger, as a final step (when all tests have been successfully executed), a transport in the SAP Cloud Transport Management service. This enables you to apply a standardized central transport and change management process recommended for enterprise environments, offering additional control of your production environment and ensuring compliance requirements are met. The concept is similar to what is used in on-premise and private cloud environments, with a centrally defined delivery landscape where you can specify who is allowed to handle changes on specific SAP BTP nodes. A central log file is available for auditing, along with the option to synchronize changes from different environments (e.g., private cloud/on-premise with related cloud changes). For this, integrate SAP Cloud Transport Management into the change and deployment management capabilities of SAP Cloud ALM, allowing it to orchestrate SAP BTP changes in an aligned manner while handling changes from other environments. SAP Cloud Transport Management service is also part of SAP Build.

4. **Operate**: SAP Cloud ALM provides a central observability platform for all SAP products, including SAP BTP, in conjunction with several local SAP-BTP-specific observability capabilities. To operate your apps on SAP BTP, use the unified monitoring, alerting, and analytics offerings of SAP Cloud ALM, based on telemetry data exposed by SAP BTP (and other SAP solutions), to reduce the mean time to detect issues. SAP uses OpenTelemetry as a unified and open instrumentation approach for SAP BTP use cases, allowing you to instrument custom apps for central observability. To resolve issues, navigate from SAP Cloud ALM to local expert tools on SAP BTP for use-case-specific root cause analysis or remediation. For example, from an error message in Exception Monitoring of SAP Cloud ALM, you can directly jump to the SAP Cloud Logging service to perform a detailed analysis. The SAP BTP service stores and visualizes log files, metrics, and traces from apps running in different SAP BTP environments. For corrective actions on SAP BTP, events in SAP Cloud ALM can automatically trigger corresponding commands on SAP Automation Pilot. This service offers a low-code/no-code automation engine with catalogs of automated actions around SAP BTP, enabling you to compile commands for automating recurring DevOps-related tasks and remediating alerts from custom SAP BTP applications. This reduces operational efforts and increases the resilience of your business scenarios by enhancing automation. To simplify the setup of your SAP BTP accounts, consider using the Terraform provider for SAP BTP.

To foster and ease separation of concerns (e.g., for security reasons), we recommend running services like SAP Cloud Transport Management in their own subaccount alongside other shared services. For more information on which SAP BTP services can be run centrally, see the [SAP BTP Administrator's Guide](https://help.sap.com/docs/btp/btp-admin-guide/sharing-btp-services).

## Characteristics

An architecture for DevOps on SAP BTP using the reference architecture can be characterized as follows:

-   **Agile**: Development teams benefit from tight feedback loops, as changes submitted to their source code repository are qualified directly. This allows them to react to feedback immediately, with low cognitive load and minimal effort to set up and maintain their own CI/CD infrastructures.
-   **Low entry barrier**: The opinionated approach, focused on SAP development scenarios, enables teams to verify the value of a more agile approach within SAP environments.
-   **Enterprise-ready**: Compliance checks in the CI pipeline ensure that only qualified changes are propagated to production. Release candidates are handed over to a reliable central transport and change management process, enabling centralized management of changes towards production. Interdependent changes from different environments (public/private cloud, on-premise) can be synchronized, ensuring cloud changes are handled in a compliant and centralized manner.
-   **Integrated**: The approach covers the complete lifecycle, from development to operations. Related processes can be configured smoothly, such as enabling transport triggering in SAP pipeline templates.
-   **Respects existing operations processes**: Out-of-the-box integration into SAP Cloud ALM (and other SAP operation platforms) enables centralized handling of delivery and operations for SAP BTP applications following this architecture.

## Examples in an SAP context

Below are examples of applying the reference architecture to implement agile DevOps principles using SAP BTP services:

-   Typical SAP BTP development use cases, such as building applications with the Cloud Application Programming (CAP) model on Cloud Foundry or creating compelling UIs based on SAP Fiori, allow the application of DevOps using SAP BTP services. Find more information in the [SAP BTP Administrator's Guide](https://help.sap.com/docs/btp/btp-admin-guide/btp-admin-guide).
-   SAP Continuous Integration and Delivery service, SAP Business Application Studio, and SAP Cloud Transport Management service are part of [SAP Build | SAP Help Portal](https://help.sap.com/docs/build-service) and can be applied accordingly.

## Reasonable alternatives

Flexibility options complement the opinionated low-entry-barrier approach outlined above, catering to customers with existing processes or specific requirements. Alternative approaches and deviations from the recommended setup include:

-   For greater flexibility or existing CI/CD infrastructure (e.g., non-SAP scenarios), consider the open-source offering [Project 'Piper'](https://www.project-piper.io/). It provides pipeline templates, pipeline step libraries, end-to-end scenarios, and Docker images for SAP-specific use cases. While it offers community support only, it is suitable for partners and customers seeking full flexibility and already equipped with expertise or infrastructure.
-   Instead of using SAP-provided testing frameworks in CI/CD pipelines, you can integrate other frameworks by adding additional commands to the pipelines. Learn more in [this blog post | SAP Community](https://community.sap.com/t5/technology-blogs-by-sap/next-level-of-flexibility-additional-commands-in-ci-cd-pipelines/ba-p/13567178).
-   For the development environment, consider alternatives like Eclipse, depending on the specific SAP BTP use case and environment.
-   A single pipeline covering both feature and release stages could be used instead of separate pipelines. However, separating pipelines helps decouple development from delivery, especially for large teams or projects.
-   Individual SAP BTP services can be integrated via open APIs into custom flows and processes. For example, use APIs for SAP Cloud Transport Management or SAP Automation Pilot from third-party platforms. Find API descriptions on [SAP Business Accelerator Hub](https://api.sap.com/).
-   Enhanced Change and Transport System (CTS+) from ABAP servers can handle multitarget application (MTA) archives. While CTS+ offers integration into change management processes, it is limited to MTA formats. Learn more in [this blog post | SAP Community](https://community.sap.com/t5/technology-blogs-by-sap/interplay-of-sap-cloud-platform-transport-management-cts-and-charm-in/ba-p/13428863).
-   SAP Solution Manager's Change Request Management (ChaRM) or Quality Gate Management (QGM) can orchestrate transports in SAP Cloud Transport Management. Consider these options if already in use, while SAP Cloud ALM is recommended for new scenarios. Learn more in [this blog post | SAP Community](https://community.sap.com/t5/technology-blogs-by-sap/how-to-use-the-integration-of-sap-cloud-platform-transport-management-into/ba-p/13443259).
-   Use [SAP Build Process Automation | SAP Help Portal](https://help.sap.com/docs/build-process-automation) to create business workflows alongside SAP Automation Pilot for technical tasks.

## Services and Components

-   [SAP Continuous Integration and Delivery](https://discovery-center.cloud.sap/serviceCatalog/continuous-integration--delivery)
-   [SAP Business Application Studio](https://discovery-center.cloud.sap/serviceCatalog/business-application-studio)
-   [SAP Build](https://discovery-center.cloud.sap/serviceCatalog/sap-build)
-   [SAP Cloud Transport Management](https://discovery-center.cloud.sap/serviceCatalog/cloud-transport-management)
-   [SAP Cloud Logging](https://discovery-center.cloud.sap/serviceCatalog/cloud-logging)
-   [SAP Automation Pilot](https://discovery-center.cloud.sap/serviceCatalog/automation-pilot)
-   [Terraform on SAP BTP](https://sap-docs.github.io/terraform-landingpage-for-btp/)

## Resources

-   [Blog post on DevOps with SAP BTP | SAP Community](https://community.sap.com/t5/technology-blogs-by-sap/devops-with-sap-btp/ba-p/13686887)
-   [DevOps Topic Page | SAP Community](https://pages.community.sap.com/topics/devops)
-   [DevOps with SAP BTP | SAP Help Portal](https://help.sap.com/docs/DEVOPS_OVERVIEW)
-   [Discovering DevOps with SAP BTP | Learning journey in SAP Learning](https://learning.sap.com/learning-journeys/discovering-devops-with-sap-btp)
-   [SAP BTP Administrator's Guide | SAP Help Portal](https://help.sap.com/docs/btp/btp-admin-guide/btp-admin-guide)
-   [SAP Cloud ALM for Implementation | SAP Support Portal](https://support.sap.com/en/alm/sap-cloud-alm/implementation.html)
-   [SAP Cloud ALM for Operations | SAP Support Portal](https://support.sap.com/en/alm/sap-cloud-alm/operations.html)
-   [Tutorials around SAP Continuous Integration and Delivery | SAP Learning](https://developers.sap.com/tutorial-navigator.html?search=SAP+continuous+integration+and+delivery)
-   [Blog post on booster for SAP Automation Pilot | SAP Community](https://community.sap.com/t5/technology-blogs-by-sap/setup-configuration-of-automation-pilot-in-btp-cockpit/ba-p/13564257)
-   [SAP Customer Influence session | SAP Customer Influence](https://influence.sap.com/sap/ino/#campaign/2277)

## Related Missions

-   [Develop a multitenant SaaS application on SAP BTP using CAP | SAP Discovery Center](https://discovery-center.cloud.sap/missiondetail/4064/4275/)