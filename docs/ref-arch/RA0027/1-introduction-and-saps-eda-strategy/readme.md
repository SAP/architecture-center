---
id: id-ra0027-1
slug: /ref-arch/AVbz5BXZ/1
sidebar_position: 1
title: 'Introduction and SAP''s EDA Strategy'
description: 'Intro'
sidebar_label: 'Introduction and SAP''s EDA Strategy'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - aws
contributors:
  - abhissharma21
  - navyakhurana
last_update:
  date: 2025-10-13
  author: abhissharma21
---

## Event-Driven Architecture

Event-driven Architecture (EDA) is a software design pattern for building and integrating systems which focuses on flow of events and resulting reaction triggered by these events. This kind of design pattern is very well suited in a heterogeneous landscape where there are multiple systems, on-premise or cloud-based environments with need to act on real-time events. The need for this pattern implementation is to address real time integration and insights, scalability , loose coupling and resilience.

Modern enterprises which are either cloud-based or hybrid with cloud and on-premise setup embrace the event-driven architecture as part of the integration strategy and API-first strategy.

## Components of an Event-Driven Architecture

### Event

Event(Business Event) is a significant change in state. The events can be either notification events or data events which are sent from event source to inform about the change. A message holding the event description in an encoded format is sent through an event broker. Event consumers registred with event broker are informed of the event that has occured.

