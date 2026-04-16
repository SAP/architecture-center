---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0027
slug: /ref-arch/d6e703646d
sidebar_position: 27
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Log-Driven Security Operations with SAP Enterprise Threat Detection and SIEM/SOAR Platforms
description: This reference architecture shows how SAP Enterprise Threat Detection provides log-driven security signals that are correlated in FortiSIEM and orchestrated through FortiSOAR to enable centralized monitoring incident investigation and automated response.
sidebar_label: Log-Driven Security Operations with SAP Enterprise Threat Detection and SIEM/SOAR Platforms
keywords: [sap enterprise threat detection, sap security, siem, soar, security operations, soc architecture, log-driven security, event correlation, incident response, security automation, hybrid security architecture, cloud security monitoring]
image: img/logo.svg
tags: [ref-arch, community-contrib, security, integration, eda]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - randomstr1ng
last_update:
    date: 2026-01-26
    author: Julian Petersohn
############################################################
#                   End of Front Matter                    #
############################################################
---

:::note External Contribution

**This content is brought to you by [Fortinet](https://www.fortinet.com/), an SAP partner.**

:::

SAP landscapes generate security-relevant telemetry across application, database, and platform layers, including environments such as SAP RISE, SAP BTP, SAP SaaS applications, and on-premises SAP systems.
SAP Enterprise Threat Detection (ETD) provides deep, domain-specific analysis of SAP logs and identifies suspicious or anomalous activities within SAP environments.

To extend SAP-native detections into enterprise-wide security operations, SAP Enterprise Threat Detection can be integrated with a centralized Security Information and Event Management (SIEM) platform. A SIEM aggregates SAP ETD findings together with telemetry from the broader IT landscape—such as identity systems, endpoints, networks, cloud platforms, and security controls—enabling cross-domain correlation and unified monitoring.

A Security Orchestration, Automation, and Response (SOAR) platform complements this architecture by orchestrating and automating incident response workflows based on correlated security events. This enables consistent investigation, enrichment, governance, and response across SAP and non-SAP environments, completing the end-to-end security operations lifecycle.

This reference architecture describes an integration pattern for SAP Enterprise Threat Detection with SIEM and SOAR platforms. FortiSIEM and FortiSOAR are used as example implementations in this iteration, but the architectural principles are applicable to alternative SIEM and SOAR solutions.

## Architecture

![drawio](drawio/siem_soar_etd.drawio)

## Flow

1. **Generate security-relevant telemetry**

SAP systems and services (for example SAP RISE workloads, SAP BTP applications, and platform services) emit security-relevant logs and events, including authentication activity, authorization changes, administrative actions, and application access traces.

2. **Analyze SAP logs in SAP Enterprise Threat Detection**

SAP Enterprise Threat Detection ingests SAP-specific log sources and applies SAP domain-aware parsing, contextual enrichment, and detection logic to identify suspicious activity and generate findings.

3. **Expose SAP detections as security events**

SAP Enterprise Threat Detection outputs its findings as security events suitable for consumption by enterprise monitoring and security operations platforms.

4. **Centralize and correlate events in a SIEM platform**

A SIEM platform ingests SAP Enterprise Threat Detection events and correlates them with broader enterprise telemetry such as identity, network, endpoint, cloud, and infrastructure signals. The SIEM normalizes events, applies correlation logic, and produces higher-confidence incidents representing cross-domain attack scenarios.

:::tip Note
In this reference implementation, FortiSIEM is used as the example SIEM platform.
:::

5. **Trigger incident workflows in a SOAR platform**

Correlated incidents from the SIEM are forwarded to a SOAR platform to create and manage security cases. The SOAR platform orchestrates investigation workflows, including enrichment, evidence collection, task assignment, and approval steps.

:::tip Note
In this reference implementation, FortiSOAR is used as the example SOAR platform.
:::

6. **Execute response actions and document outcomes**

The SOAR platform executes automated and semi-automated response actions such as notifications, ticket creation, containment steps, and SAP-specific actions where applicable. All actions, decisions, and outcomes are documented to support auditability and compliance.

7. **Close the loop and improve detection quality**

Incident status and response outcomes are fed back into the monitoring and reporting layers. Lessons learned are used to refine detection logic, correlation rules, and response workflows over time.

## Characteristics

- **Log-driven security architecture**
Continuous ingestion and analysis of security-relevant logs form the foundation for detection, correlation, and response.

- **SAP domain-aware threat detection**
SAP Enterprise Threat Detection provides deep visibility into SAP-specific contexts across SAP RISE, SAP BTP, SAP SaaS, and on-premises SAP deployments.

- **Near real-time SAP event analysis**
SAP-specific events are analyzed and correlated in near real time to identify suspicious activity within SAP environments.

- **Centralized enterprise security monitoring**
A SIEM platform aggregates SAP ETD findings together with non-SAP telemetry from infrastructure, cloud platforms, networks, operating systems, applications, and security controls.

- **Cross-domain correlation**
SAP security events are correlated with non-SAP signals to detect multi-stage and cross-system attacks that cannot be identified within SAP environments alone.

- **Clear separation of operational responsibilities**
SAP Enterprise Threat Detection is typically operated by SAP security or SAP Basis teams, while SIEM and SOAR platforms are operated by the Security Operations Center, enabling clear ownership and collaboration.

- **Centralized incident orchestration**
A SOAR platform provides a unified coordination layer for investigations and response activities across SAP and non-SAP environments.

- **Contextual enrichment and investigation support**
Security events are enriched with user, asset, identity, location, and threat intelligence context to support investigation and threat hunting.

- **Automated and governed response workflows**
Response actions are executed through automated playbooks with optional approval steps to support governance, compliance, and separation of duties.

- **SAP-aware response capabilities**
The architecture supports SAP-specific response actions such as user session termination, account locking, and authorization or role changes. This heavily depends on the integrations provided by the SOAR platform.

- **Enterprise integration and auditability**
Security incidents, actions, and decisions are integrated with enterprise systems such as ITSM platforms and are fully documented.

- **Scalable and extensible design**
The architecture supports incremental adoption, additional data sources, and evolving use cases without fundamental architectural changes.

## Examples in an SAP context
- **Detecting suspicious SAP user activity across hybrid landscapes**
SAP Enterprise Threat Detection identifies anomalous dialog or RFC activity within SAP systems. These detections are correlated in a SIEM platform with identity, network, or endpoint signals to determine whether the activity is part of a broader attack. A SOAR platform coordinates investigation and response.

- **Monitoring SAP RISE environments within a centralized SOC**
SAP ETD findings from SAP RISE managed systems are forwarded to a SIEM platform, enabling unified monitoring alongside non-SAP systems while a SOAR platform ensures consistent incident handling.

- **Securing SAP BTP applications and services**
SAP ETD analyzes SAP BTP logs to detect suspicious behavior such as unauthorized access or misuse of service credentials. These events are correlated with cloud and identity telemetry and handled through automated response workflows.

- **Correlating SAP events with enterprise infrastructure attacks**
SAP-specific detections are correlated with infrastructure signals such as firewall logs, endpoint alerts, or network anomalies to identify multi-stage attacks spanning SAP and non-SAP environments.

- **Automating SAP incident response with governance controls**
High-confidence incidents trigger predefined SOAR workflows that may include notifications, ticket creation, and SAP-specific response actions with approval steps where required.

- **Supporting threat hunting in SAP environments**
Analysts use the SIEM platform to explore historical SAP ETD events alongside enterprise telemetry. The SOAR platform supports enrichment and coordinated follow-up actions.

- **Aligning SAP security incidents with enterprise ITSM processes**
SAP-related security incidents are synchronized with ITSM platforms, ensuring SAP-specific context, evidence, and response actions are preserved.

## Services and Components

- [SAP Enterprise Threat Detection](https://www.sap.com/products/financial-management/enterprise-threat-detection.html)
- [FortiSIEM](https://www.fortinet.com/products/siem/fortisiem)
- [FortiSOAR](https://www.fortinet.com/products/fortisoar)

## Resources

- [SAP Community Webinar: Oh no, someone breached the SAP systems – Cybersecurity for Hybrid SAP Landscapes](https://www.youtube.com/live/AAgAS8JZDq0)
- [FortiSIEM SAP Enterprise Threat Detection integration](https://docs.fortinet.com/document/fortisiem/7.4.0/external-systems-configuration-guide/200971/sap-enterprise-threat-detection-etd)
- [FortiSOAR Connectors Content Hub](https://fortisoar.contenthub.fortinet.com//list.html?contentType=all&searchContent=SAP)