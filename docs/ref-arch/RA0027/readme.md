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
title: Log Driven Security Operations with SAP Enterprise Threat Detection and FortiSIEM and FortiSOAR
description: This reference architecture shows how SAP Enterprise Threat Detection provides log-driven security signals that are correlated in FortiSIEM and orchestrated through FortiSOAR to enable centralized monitoring incident investigation and automated response.
sidebar_label: Log Driven Security Operations with SAP Enterprise Threat Detection and FortiSIEM and FortiSOAR
keywords: [log management, threat analytics, cloud security, hybrid architectures, siem, soar, security automation, security]
image: img/logo.svg
tags: [Log Driven Security, Security Operations, SAP Enterprise Threat Detection, SIEM, SOAR, Security Automation, Threat Detection, Incident Response, Event Correlation, FortiSIEM, FortiSOAR]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - randomstr1ng
last_update:
    date: 2025-12-16
    author: Julian Petersohn
############################################################
#                   End of Front Matter                    #
############################################################
---

SAP landscapes generate security-relevant logs across application, database, and platform layers, including environments such as SAP RISE and SAP BTP. SAP Enterprise Threat Detection provides deep, domain-specific insights into these SAP logs and identifies suspicious or anomalous activities within SAP systems.

To operate security monitoring at an enterprise level, these SAP-specific detections must be combined with a centralized cybersecurity logging and analytics capability. FortiSIEM serves as the central log collector and correlation layer, aggregating security events from SAP Enterprise Threat Detection alongside signals from other infrastructure, cloud, and security sources.

FortiSOAR complements this architecture by orchestrating and automating incident response workflows triggered by correlated events. It enables consistent investigation, enrichment, and response actions, completing the end-to-end security operations chain from SAP-specific detection to enterprise-wide visibility and automated response.

## Architecture

![drawio](drawio/siem_soar_etd.drawio)

## Flow

1. **Generate security relevant telemetry**

SAP systems and services (for example SAP RISE workloads and SAP BTP applications and platform services) emit security relevant logs and events such as authentication activity authorization changes administrative actions and application access traces.

2. **Ingest and analyze SAP logs in SAP Enterprise Threat Detection**

SAP Enterprise Threat Detection Cloud ingests SAP specific log sources and applies SAP domain parsing context enrichment and detection logic to identify suspicious activity and produce findings.

3. **Forward detections as security events**

SAP Enterprise Threat Detection outputs findings as security events suitable for enterprise monitoring so they can be consumed outside the SAP domain.

4. **Centralize and correlate in FortiSIEM**

FortiSIEM ingests SAP Enterprise Threat Detection events and combines them with broader enterprise telemetry such as cloud identity network and endpoint signals. FortiSIEM normalizes events applies correlation rules and produces higher confidence incidents that represent cross domain attack narratives.

5. **Trigger incident workflows in FortiSOAR**

Correlated incidents from FortiSIEM are sent to FortiSOAR to create a case. FortiSOAR orchestrates the investigation workflow including enrichment evidence collection task assignment and approval gates.

6. **Execute response actions and document outcomes**

FortiSOAR executes automated and semi automated response actions such as notifications ticket creation and containment steps in integrated systems. It records decisions evidence and outcomes for auditability and repeatability.

7. **Close the loop and improve detection quality**

Case status and response outcomes are synchronized back to the monitoring layer for reporting and operational visibility. Lessons learned can be used to tune correlation and response logic over time.

## Characteristics

- **Log-driven security architecture**

The architecture is based on the continuous ingestion and analysis of security-relevant logs as the primary input for detection, correlation, and response.

- **SAP domain-aware threat detection**
S
AP Enterprise Threat Detection provides deep visibility into SAP-specific logs and contexts across SAP RISE, SAP BTP, SAP SaaS applications, and on-premises SAP deployments.

- **Real-time SAP event correlation**

SAP-specific events are analyzed and correlated in near real time to identify suspicious activities and attack patterns within SAP applications and platforms.

- **Centralized enterprise log collection**

FortiSIEM aggregates detections from SAP Enterprise Threat Detection together with logs from non-SAP sources such as infrastructure, cloud platforms, networks, operating systems, applications, and security controls.

- **Cross-domain security correlation**

SAP security events are correlated with non-SAP telemetry to detect multi-stage and cross-system attacks that cannot be identified within SAP systems alone.

- **Separation of operational responsibilities**

SAP Enterprise Threat Detection is typically operated by SAP security or SAP Basis teams, while FortiSIEM and FortiSOAR are managed by the Security Operations Center, enabling clear ownership and collaboration.

- **Centralized incident orchestration**

FortiSOAR acts as the central coordination layer for security incidents, consolidating alerts, investigations, and response activities across SAP and non-SAP environments.

- **Contextual enrichment and threat investigation**

Security events are enriched with contextual data such as user information, asset details, locations, indicators of compromise, and threat intelligence to support investigation and threat hunting.

- **Automated and governed response workflows**

Incident response actions are executed through automated playbooks with optional approval steps to support governance, compliance, and separation of duties.

- **SAP-aware response capabilities**

The architecture supports response actions specific to SAP environments, including user session termination, account locking, identity management actions, and role or authorization changes.

- **Enterprise integration and auditability**

Security incidents, actions, and decisions are integrated with enterprise systems such as ITSM platforms and are fully documented to support auditability and continuous improvement.

- **Scalable and extensible design**

The architecture supports incremental adoption, additional log sources, and evolving detection and response use cases without fundamental changes to the overall design.

## Examples in an SAP context
- **Detecting suspicious SAP user activity across hybrid landscapes**

SAP Enterprise Threat Detection identifies anomalous dialog or RFC activity within SAP systems, such as repeated failed logons or unusual access patterns. These detections are correlated in FortiSIEM with identity, network, or endpoint signals to determine whether the activity is part of a broader attack. FortiSOAR coordinates investigation and response actions.

- **Monitoring SAP RISE environments within a centralized SOC**

Security-relevant events from SAP RISE managed systems are analyzed by SAP Enterprise Threat Detection and forwarded to FortiSIEM. This enables the SOC to monitor SAP RISE workloads alongside non-SAP systems using a single SIEM platform, while FortiSOAR ensures consistent incident handling and documentation.

- **Securing SAP BTP applications and services**

Logs from SAP BTP applications and platform services are analyzed by SAP Enterprise Threat Detection to identify suspicious behavior such as unauthorized access or misuse of service credentials. FortiSIEM correlates these events with cloud and identity telemetry, while FortiSOAR orchestrates notifications, investigations, and response actions.

- **Correlating SAP events with enterprise infrastructure attacks**

SAP-specific detections, such as unusual authorization changes or administrative actions, are correlated in FortiSIEM with infrastructure signals such as firewall logs, endpoint alerts, or network anomalies. This enables detection of multi-stage attacks that span SAP and non-SAP systems. FortiSOAR coordinates cross-team response.

- **Automating SAP incident response with governance controls**

When a high-confidence incident is identified, FortiSOAR executes predefined response workflows that may include user notification, ticket creation, or SAP-specific actions such as user locking or session termination. Approval steps can be included to support compliance and separation of duties.

- **Supporting threat hunting in SAP environments**

Security analysts use FortiSIEM to explore historical SAP Enterprise Threat Detection events in combination with enterprise telemetry. FortiSOAR supports threat hunting by enriching events with contextual information and coordinating follow-up actions when suspicious patterns are identified.

- **Aligning SAP security incidents with enterprise ITSM processes**

Security incidents related to SAP systems are automatically synchronized with IT service management platforms. FortiSOAR ensures that SAP-specific context, evidence, and response actions are included in tickets, enabling collaboration between SAP teams and the SOC.


## Services and Components

- [SAP Enterprise Threat Detection](https://www.sap.com/products/financial-management/enterprise-threat-detection.html)
- [FortiSIEM](https://www.fortinet.com/products/siem/fortisiem)
- [FortiSOAR](https://www.fortinet.com/products/fortisoar)

## Resources

- [SAP Community Webinar: Oh no, someone breached the SAP systems – Cybersecurity for Hybrid SAP Landscapes](https://www.youtube.com/live/AAgAS8JZDq0)
- [FortiSIEM SAP Enterprise Threat Detection integration](https://docs.fortinet.com/document/fortisiem/7.4.0/external-systems-configuration-guide/200971/sap-enterprise-threat-detection-etd)
- [FortiSOAR Connectors Content Hub](https://fortisoar.contenthub.fortinet.com//list.html?contentType=all&searchContent=SAP)

## Related Missions

<!-- Add related missions here -->
