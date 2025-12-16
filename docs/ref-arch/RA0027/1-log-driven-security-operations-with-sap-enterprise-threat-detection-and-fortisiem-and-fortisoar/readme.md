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
