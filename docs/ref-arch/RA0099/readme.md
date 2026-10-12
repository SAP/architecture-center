---
id: ra0099
slug: /ref-arch/ra0099
sidebar_position: 9999
title: Testing Grammar Checks With Intentionally Broken Prose
description: "A throwaway reference architecture that exists only to exercise the new LanguageTool grammar check, written on purpose with many broken sentences."
keywords:
  - test
  - grammar
sidebar_label: RA0099 Grammar Test
image: img/ac-soc-med.png
tags:
  - appdev
hide_table_of_contents: false
hide_title: false
draft: false
unlisted: false
last_update:
  author: SAP Architecture Center
---

# RA0099 — Grammar Check Test Fixture

:::warning Disposable test content
This page is **not** a real reference architecture. It exists only to exercise the
LanguageTool grammar check in CI and is full of deliberate mistakes. Delete it once
the check is confirmed working.
:::

## Overview

The architecture consist of three main layer.
There is many reasons to adopting this pattern.
This solution depends of a external service for authentication.
We was planning to migrated the workloads last year.

## Design principles

- An user can access the data without no credentials.
- The system have been more better than the previous one.
- Their is a dependency between this two components.
- The team could of avoided the outage if they was prepared.
- It don't matter which database you chooses.
- Each services communicate over a events bus.

## Operational considerations

One of the microservices are failing frequent.
This change will effect the performance of the API.
You might loose your data if the node crash.
The latency is to high for real-time use.
Its important that every service log their own requests.

## Recommendations

He don't recommend to use a single region for production.
We recommend that the architect reviews there design regular.
The data is more fresher then the cache behind it.
If the user don't logs out, the session remain active forever.
Neither the frontend nor the backend were tested proper.
