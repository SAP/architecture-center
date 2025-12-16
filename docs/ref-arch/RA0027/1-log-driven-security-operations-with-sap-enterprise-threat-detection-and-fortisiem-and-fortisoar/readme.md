---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0027-1
slug: /ref-arch/d6e703646d/1
sidebar_position: 1
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

<!-- Add your characteristics content here -->

## Examples in an SAP context

<!-- Add your SAP context examples here -->

## Services and Components

<!-- Add your services and components here -->

## Resources

- [SAP Community Webinar: Oh no, someone breached the SAP systems – Cybersecurity for Hybrid SAP Landscapes](https://www.youtube.com/live/AAgAS8JZDq0)
- [FortiSIEM SAP Enterprise Threat Detection integration](https://docs.fortinet.com/document/fortisiem/7.4.0/external-systems-configuration-guide/200971/sap-enterprise-threat-detection-etd)
- [FortiSOAR Connectors Content Hub](https://fortisoar.contenthub.fortinet.com//list.html?contentType=all&searchContent=SAP)

## Related Missions

<!-- Add related missions here -->
