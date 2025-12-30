---
id: id-ra0027
slug: /ref-arch/vuJi1h5F
sidebar_position: 27
title: 'Product Family Manager'
description: 'This is a default description.'
keywords: 
  - genai
  - integration
  - eda
  - build
sidebar_label: 'Product Family Manager'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - genai
  - integration
  - eda
  - build
contributors:
  - surreshsrao
last_update:
  date: 2025-12-30
  author: surreshsrao
---

1.        plantuml



@startuml

skinparam componentStyle rectangle

title VFSM Architecture (Project Velocity) - Simplified

 

package "Users & Devices" #LightBlue {

  [Native Mobile App\n(Offline-capable)] as NativeApp

  [Web Browser\n(Portal -> Web App)] as WebApp

  [Portal / Launchpad\n(SAP Build Work Zone)] as Portal

  [Dev / Admin Tools\n(Business App Studio / BTP Cockpit)] as DevAdmin

}

 

package "SAP BTP (Cloud)" #LightYellow {

  package "Identity & Security" {

    [IAS\n(Identity Authentication Service)] as IAS

    [IPS\n(Identity Provisioning Service)] as IPS

  }

 

  package "Frontend & Mobile" {

    [HTML5 Repo / Launchpad] as HTML5

    [SAP Build Apps / Fiori UI] as Frontend

    [SAP Mobile Services\n(MDK / SDK / Sync)] as MobileSvc

  }

 

  package "Application Backend" {

    [Cloud Foundry App\n(CAP / Node / Java)\nCRUD APIs] as Backend

    [Destination Service] as Destination

  }

 

  package "Integration & Connectivity" {

    [Cloud Connector] as CloudConnector

    [Integration Suite\n(Cloud Integration / iFlows)] as IntegrationSuite

    [Event Mesh (optional)] as EventMesh

  }

 

  package "Storage & DB" {

    [Object Store\n(photos / signatures)] as ObjectStore

    [HANA Cloud / PostgreSQL\n(metadata & cache)] as DB

  }

 

  package "Ops & Governance" {

    [Cloud Logging\n(OpenSearch)] as Logging

    [Alert Notification] as Alerts

    [CI/CD / Transport Management] as CICD

    [Job Scheduling Service] as Scheduler

    [Data Retention Manager] as DRM

    [Usage Data Management] as Usage

  }

}

 

package "On-Premise" #LightGreen {

  [SAP S/4HANA\n(OData / RFC / BAPI)] as S4

  [Corporate IdP\n(Azure AD / Okta)] as CorporateIdP

}

 

*' Authentication / provisioning flows*

IAS <..> Portal : SSO / OIDC

IAS <..> NativeApp : SSO / OIDC

IPS --> IAS : Provision users

CorporateIdP ..> IAS : Federation (optional)

 

*' Frontend to backend*

WebApp --> HTML5 : Load UI

HTML5 --> Frontend : Serve app

Frontend --> Backend : REST / OData CRUD

 

*' Mobile flows*

NativeApp --> MobileSvc : Sync / Offline store

MobileSvc --> Backend : Sync API calls

NativeApp --> ObjectStore : Upload photos (via Backend or MobileSvc)

 

*' Backend -> integration -> on-prem*

Backend -> Destination : Resolve endpoint

Backend --> IntegrationSuite : Call / proxy

IntegrationSuite --> CloudConnector : Secure tunnel

CloudConnector --> S4 : OData / RFC calls

 

*' Media & metadata handling*

Backend --> ObjectStore : Store binary (photo/signature)

Backend --> DB : Store metadata / sync logs

Backend --> S4 : Write metadata (via IntegrationSuite)

 

*' Optional eventing*

S4 --> EventMesh : Publish business events

EventMesh --> Backend : Notify / subscribe

 

*' Operations / monitoring*

Backend --> Logging : App logs

IntegrationSuite --> Logging : Integration logs

Logging --> Alerts : Trigger notifications

Scheduler --> Backend : Background jobs / retries

CICD --> Backend : Deploy pipelines

Usage --> Backend : Usage metrics

DRM --> ObjectStore : Retention policies

 

*' Notes / Annotations*

note left of NativeApp

  Offline store on device,

  conflict resolution, local DB

end note

 

note right of S4

  S/4HANA = single source of truth

  (master data, inventory, contracts)

end note

 

note top of Backend

  Stateless, container-ready

  Externalize config via Destination

end note

 

@enduml

 

