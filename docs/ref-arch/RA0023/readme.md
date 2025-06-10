---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0023
slug: /ref-arch/7a6eeddefb
sidebar_position: 23
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: DevOps with SAP BTP
description: This reference architecture describes cloud services and offerings of SAP BTP for SAP customers and partners to foster agile development principles along the lifecycle of SAP BTP applications, in the spirit of DevOps.
sidebar_label: DevOps with SAP BTP
keywords: [sap, devops, agile, cicd]
image: img/logo.svg
tags:
    - ref-arch
    - appdev
    - build
    - cap
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - bzarske
last_update:
    date: 2025-06-06
    author: bzarske
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->
DevOps is a key enabler for achieving high-level agility and quality in development projects – also in SAP enterprise environments.

Although DevOps is mainly a cultural approach, tools can help to foster agile development principles along the lifecycle of applications. To enable corresponding projects on SAP BTP, the platform brings corresponding cloud services and offerings for SAP customers and partners, described in this reference architecture. In case you should have special needs or certain infrastructure around DevOps already in place, SAP BTP can also be integrated in other setups, as described under reasonable alternatives.

SAP BTP does offer several different development approaches and runtime environments, to fulfill requirements from different target groups and boundary conditions. In this reference architecture, we concentrate on application development on the SAP BTP, Cloud Foundry environment. Details of the setup outlined here might slightly differ for other SAP BTP environments and use cases, while SAP BTP has the goal to offer similar concepts fitting for the most important use cases covered by the platform. For example, by providing a harmonized delivery process, so that changes from different environments can be handled in a synchronized way. This is especially helpful, if changes from different environments contribute to a bigger business scenario or application.

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/devops_with_sap_btp.drawio)

## Flow

<!-- Add your flow content here -->
To enable your development teams to apply DevOps for their projects on SAP BTP using the corresponding reference architecture, follow these four steps:

1. **Set up Continuous Integration**: One driver of the agility and built-in quality that DevOps brings is the automation of large parts of the deployment pipeline. For this, you can easily set up a so-called Continuous Integration / Continuous Delivery (CI/CD) pipeline in SAP Continuous Integration and Delivery service in minutes. Just select one of the provided pipeline templates for typical SAP BTP development use cases - such as to develop a side-by-side extension using Cloud Application Programming model (CAP) or for building compelling UIs using SAP Fiori. After you connect the pipeline to your source code management system, it gets executed automatically whenever your development teams do submit changes to their source code repository. This then lets the pipeline build and test their changes and provides the developers direct feedback on the quality of their changes. This way, you can enable your developers to benefit from an opinionated agile approach with direct support from SAP, without having to bring much expertise and without having to set up and operate own CI/CD infrastructure, as you only have to bring any Git-based source code repository. As a result, the cognitive load of your development teams gets reduced. SAP Continuous Integration and Delivery is also part of SAP Build.
2. **Develop**: This CI pipeline is then used by your development teams as part of their developer process, to qualify their changes. For this, they involve required testing frameworks triggered by the pipeline, as proposed by the pipeline templates. For the actual development, they use SAP Business Application Studio - a powerful and modern development environment, available as part of SAP Build or as standalone service. When development is fine with the outcome of the test results reported back by the CI feature pipeline, they submit the changes comprising this qualified release candidate to the release branch of their repository, which would then trigger a release pipeline, also created using provided templates. Besides triggering the delivery, this release pipeline could then also comprise compliance checks, such as to filter out security flaws from integrated third-party libraries.
3. **Deliver**: Your delivery pipeline in SAP Continuous Integration and Delivery can trigger as final step (that is, when all comprised tests could be executed successfully) a transport in SAP Cloud Transport Management service. This allows you to apply a standardized central transport and change management process recommended for enterprise environments, as it allows you to gain additional control of your production environment and to apply compliance requirements. The actual concept is quite similar to what you might be used to from development in on-premise and private cloud environments, with a centrally defined delivery landscape, where you can centrally define who is allowed to handle changes on which SAP BTP node, with a central log file for auditing. And with the option to synchronize the propagation of changes from different environments (such as from private cloud/on-premise together with related cloud changes). For this, integrate SAP Cloud Transport Management into change and deployment management capabilities of SAP Cloud ALM, so that it can orchestrate your SAP BTP changes in an aligned way - in addition to its ability to handle changes also from other environments. SAP Cloud Transport Management service is also part of SAP Build.
4. **Operate**: With SAP Cloud ALM, SAP is providing a central observability platform for all SAP products, including SAP BTP - in interplay with several local SAP-BTP-specific observability capabilities. To operate your apps on SAP BTP, you can therefore use the unified monitoring, alerting and analytics offering of SAP Cloud ALM, based on telemetry data exposed by SAP BTP (and other SAP solutions), to reduce the meantime to detect any issues. SAP is using OpenTelemetry as unified and open instrumentation approach for SAP BTP use cases, allowing you for example to instrument your custom apps for central observability. To resolve issues, you can then navigate from SAP Cloud ALM to the local expert tools on SAP BTP, to perform a use-case-specific root cause analysis or remediate issues. For example, from an error message in Exception Monitoring of SAP Cloud ALM, you could directly jump to SAP Cloud Logging service to perform a detailed analysis, for which the SAP BTP service stores and visualizes log files, metrics, and traces from your apps running in different SAP BTP environments. For the execution of corrective actions on SAP BTP, events in SAP Cloud ALM could automatically trigger the execution of corresponding commands on SAP Automation Pilot. This service offers a low-code and no-code automation engine and brings catalogs of automated actions around SAP BTP that you can use to compile the best-fitting command for automating your recurring DevOps-related tasks and for remediation of alerts from your custom SAP BTP applications. This way, you can reduce your operation efforts and increase the resilience of your business scenarios by increasing your automation level. To reduce efforts for setting up your SAP BTP accounts, consider to use the Terraform provider for SAP BTP.

To foster and ease separation of concerns (such as for security reasons), we recommend to run services like SAP Cloud Transport Management in an own subaccount, with other shared services. For more information on which SAP BTP services could be run centrally, see the <!-- dc-ref-arch-services-start -->
  [SAP BTP Administrator's Guide](https://help.sap.com/docs/btp/btp-admin-guide/sharing-btp-services)<!-- dc-ref-arch-services-end -->.

## Characteristics

<!-- Add your characteristics content here -->
An architecture for DevOps on SAP BTP using the reference architecture can be characterized as follows:
- **Agile**: your development teams can benefit from tight feedback loops, as changes submitted to their source code repository get qualified directly, allowing them to react on the feedback immediately, with low cognitive load and without high efforts to set up and maintain own CI/CD infrastructures.
- **Allows an easy start with a low entry barrier**: due to the opinionated approach focused especially on SAP development scenarios, you can verify the value such a more agile approach does bring also in SAP environments for your development teams.
- **Enterprise-ready**: Compliance checks that are part of your CI pipeline make sure that only qualified changes are considered to be propagated to your production environment. As release candidates get handed over into a reliable central transport and change management process, you can centrally manage the propagation of changes towards your production environment - with the option to synchronize interdependent changes, coming from different environments (public and private cloud, on-premise). As a result, also cloud changes can be handled in a compliant and centralized way.
- **Integrated**: the approach does offer the complete lifecycle, from development to operations. The interplay of related processes can be configured smoothly (for example, with the option to just switch on the triggering a transport of your changes in the pipeline templates provided by SAP).
- **Respects existing operations processes**: due to the out-of-the-box integration into SAP Cloud ALM (and other SAP operation platforms), you can centrally handle the delivery and operations also of your SAP BTP applications following this architecture.

## Examples in an SAP context

<!-- Add your SAP context examples here -->
In the following, you can find examples in an SAP BTP context where you can apply the reference architecture to apply agile DevOps principles using SAP BTP services:
- Typical development use cases on SAP BTP, such as to build an application following the Cloud Application Programming (CAP) model on Cloud Foundry or to come up with a compelling UI based on SAP Fiori, allow to apply DevOps using SAP BTP services. Find more information in the <!-- dc-ref-arch-services-start -->
  [SAP BTP Administrator's Guide](https://help.sap.com/docs/btp/btp-admin-guide/btp-admin-guide)<!-- dc-ref-arch-services-end -->
- SAP Continuous Integration and Delivery service, SAP Business Application Studio, and SAP Cloud Transport Management service are part of <!-- dc-ref-arch-services-start -->[SAP Build | SAP Help Portal ](https://help.sap.com/docs/build-service)<!-- dc-ref-arch-services-end --> and the overall approach can be applied there accordingly.

## Reasonable alternatives

As there are many approaches in place and customers might have already certain processes in place, flexibility options are an elementary part of the offered approach, complementing the opinionated low-entry-barrier approach outlined above. In the following, alternative approaches and deviations from the recommended approach are briefly described:
- In case you should need more flexibility or should already have CI/CD infrastructure in use (such as for non-SAP scenarios), consider the open source offering <!-- dc-ref-arch-services-start -->[project 'Piper'](https://www.project-piper.io/)<!-- dc-ref-arch-services-end -->. It brings several building blocks that allow you to compile an own pipeline for SAP-specific use cases. In detail, it brings pipeline templates (for the CI/CD infrastructure Jenkins only), a library of pipeline steps (written in Golang, which allows you to use them also for non-Jenkins CI/CD infrastructures), scenarios (end-to-end descriptions with sample code snippets), and Docker images that you can add to your pipeline. As it is an open source offering, there is no direct support provided by SAP – only community support. The offering is addressing especially those partners and customers that need full flexibility and already bring expertise or infrastructure (or are willing to build it up and operate it) and now want to know how to best expand it also for SAP-specific use cases. Project 'Piper' also brings a pipeline step that allows to trigger a transport in SAP Cloud Transport Management service out of a custom pipeline running on own CI/CD infrastructure. If you should be new to DevOps around SAP BTP, first want to verify the value a more agile approach might bring on SAP BTP or prefer to stick to an SAP standard approach with direct SAP support, we recommend to look at SAP Continuous Integration and Delivery first.
- Instead of using testing frameworks that are part of the pipeline templates of SAP Continuous Integration and Delivery, you can also integrate other frameworks by adding additional commands to the pipelines provided by SAP. This is described <!-- dc-ref-arch-services-start -->[in this blog post | SAP Community ](https://community.sap.com/t5/technology-blogs-by-sap/next-level-of-flexibility-additional-commands-in-ci-cd-pipelines/ba-p/13567178)<!-- dc-ref-arch-services-end -->.
- For the development environment, you can consider other options, such as Eclipse - also depending on the actual development use case you address on SAP BTP and the used SAP BTP environment.
- Instead of using a feature pipeline and a separate release pipeline outlined above, you could use a single pipeline that would cover both. Besides activities like build activities and testing on different levels (as required - such as unit tests and compliance checks), such a single pipeline would comprise also a corresponding release stage that could perform a direct deployment or trigger a transport request. Still, using two pipelines can help to decouple development from delivery: while with two pipelines, you would only propagate release candidates towards production, a single pipeline would trigger a transport for every single small development change. If you plan to come up with many development changes (such as for new or large projects) or have large development teams, a decoupled approach with two pipelines is recommended. 
- If you only want to use single SAP BTP services of the outlined architecture, you can include them via open APIs into own flows and processes - such as for triggering transports in SAP Cloud Transport Management or for the execution of recommended actions in SAP Automation Pilot from third-party operations platforms. For more information, search for the API description of the corresponding SAP BTP services in <!-- dc-ref-arch-services-start -->[SAP Business Accelerator Hub](https://api.sap.com/)<!-- dc-ref-arch-services-end -->.
- Instead of using SAP Cloud Transport Management, the <!-- dc-ref-arch-services-start -->[enhanced Change and Transport System (CTS+) | SAP Support Portal ](https://support.sap.com/en/tools/software-logistics-tools/enhanced-change-and-transport-system.html)<!-- dc-ref-arch-services-end --> part of ABAP servers can be considered for any content type handled in the format of multitarget application (MTA) archives. CTS+ can also be integrated into change management processes. Nevertheless, there are no plans to extend coverage of CTS+ transports for further SAP cloud content types, so only consider to use CTS+, if you already have corresponding infrastructure in place and do not plan to extend transport management to further use cases beyond those handled in MTA format. For more information, see <!-- dc-ref-arch-services-start -->[in this blog post | SAP Community ](https://community.sap.com/t5/technology-blogs-by-sap/interplay-of-sap-cloud-platform-transport-management-cts-and-charm-in/ba-p/13428863)<!-- dc-ref-arch-services-end -->.
- Instead of using change and delivery management of SAP Cloud ALM to orchestrate transports in SAP Cloud Transport Management, you can also use corresponding approaches from SAP Solution Manager, such as Change Request Management (ChaRM) or Quality Gate Management (QGM). We recommend to consider them only in case you should have those already in place, while looking at SAP Cloud ALM for new scenarios. For more information, see <!-- dc-ref-arch-services-start -->[this blog post | SAP Community ](https://community.sap.com/t5/technology-blogs-by-sap/how-to-use-the-integration-of-sap-cloud-platform-transport-management-into/ba-p/13443259)<!-- dc-ref-arch-services-end -->. Also, you can use SAP Cloud ALM as data proxy for SAP Focused Run.
- In addition to use SAP Automation Pilot to automate recurring technical operation tasks, you can use [SAP Build Process Automation | SAP Help Portal ](https://help.sap.com/docs/build-process-automation)<!-- dc-ref-arch-services-end -->, such as come up with business workflows.

## Services and Components

<!-- Add your services and components here -->
<!-- dc-ref-arch-services-start -->
- [SAP Continuous Integration and Delivery](https://discovery-center.cloud.sap/serviceCatalog/continuous-integration--delivery)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [SAP Business Application Studio](https://discovery-center.cloud.sap/serviceCatalog/business-application-studio)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [SAP Build](https://discovery-center.cloud.sap/serviceCatalog/sap-build)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [SAP Cloud Transport Management](https://discovery-center.cloud.sap/serviceCatalog/cloud-transport-management)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [SAP Cloud Logging](https://discovery-center.cloud.sap/serviceCatalog/cloud-logging)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [SAP Automation Pilot](https://discovery-center.cloud.sap/serviceCatalog/automation-pilot)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-services-start -->
- [Terraform on SAP BTP](https://sap-docs.github.io/terraform-landingpage-for-btp/)
<!-- dc-ref-arch-services-end -->

## Resources

<!-- Add your resources here -->
<!-- dc-ref-arch-resources-start -->
- [Blog post on DevOps with SAP BTP | SAP Community ](https://community.sap.com/t5/technology-blogs-by-sap/devops-with-sap-btp/ba-p/13686887)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [DevOps Topic Page | SAP Community ](https://pages.community.sap.com/topics/devops)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [DevOps with SAP BTP | SAP Help Portal ](https://help.sap.com/docs/DEVOPS_OVERVIEW)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [Discovering DevOps with SAP BTP | Learning journey in SAP Learning ](https://learning.sap.com/learning-journeys/discovering-devops-with-sap-btp)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-services-start -->
- [SAP BTP Administrator's Guide | SAP Help Portal ](https://help.sap.com/docs/btp/btp-admin-guide/btp-admin-guide)
<!-- dc-ref-arch-services-end -->

<!-- dc-ref-arch-resources-start -->
- [SAP Cloud ALM for Implementation | SAP Support Portal ](https://support.sap.com/en/alm/sap-cloud-alm/implementation.html)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [SAP Cloud ALM for Operations | SAP Support Portal ](https://support.sap.com/en/alm/sap-cloud-alm/operations.html)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [Tutorials around SAP Continuous Integration and Delivery | SAP Learning ](https://developers.sap.com/tutorial-navigator.html?search=SAP+continuous+integration+and+delivery)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [Blog post on booster for SAP Automation Pilot | SAP Community ](https://community.sap.com/t5/technology-blogs-by-sap/setup-configuration-of-automation-pilot-in-btp-cockpit/ba-p/13564257)
<!-- dc-ref-arch-resources-end -->

<!-- dc-ref-arch-resources-start -->
- [SAP Customer Influence session | SAP Customer Influence ](https://influence.sap.com/sap/ino/#campaign/2277)
<!-- dc-ref-arch-resources-end -->

## Related Missions

<!-- Add related missions here -->
<!-- dc-ref-arch-related-missions-start -->
- [Develop a multitenant SaaS application on SAP BTP using CAP | SAP Discovery Center](https://discovery-center.cloud.sap/missiondetail/4064/4275/)
<!-- dc-ref-arch-related-missions-end -->

<!-- dc-ref-arch-related-missions-start -->
- [Enhance core ERP business processes with resilient applications on SAP BTP | SAP-samples on GitHub](https://github.com/SAP-samples/btp-build-resilient-apps)
<!-- dc-ref-arch-related-missions-end -->
