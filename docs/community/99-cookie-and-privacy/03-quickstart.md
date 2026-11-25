---
sidebar_position: 3
slug: /community/quickstart
title: Quick Start Statement | SAP Architecture Center
description: "How the Quick Start tool uses GitHub OAuth and what personal data it processes to fork repositories, commit changes, and create pull requests on your behalf."
sidebar_label: SAP AC Quick Start Statement
keywords:
 - sap
 - quick start
 - privacy
 - github oauth
 - personal data
 - business ai platform
image: img/ac-soc-med.png
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: cernus76
  date: 2026-10-22
---

The **Quick Start** tool uses GitHub OAuth for user authentication. Users are redirected to GitHub to log in and authorize the application. GitHub credentials and OAuth access tokens are kept by the server-side authentication service and are not sent to or stored by the browser.

Personal Data Processed:
- GitHub Username
- Public Profile Information (e.g., name, profile picture, email if made public)
- Repository Access Token (scoped access held by the server-side service to fork, commit, and create pull requests)

This data is used solely to perform GitHub actions on behalf of the user such as forking repositories, committing changes, and creating pull requests.
No personal data is shared with third parties or used for marketing, analytics, or advertising purposes.
The **Quick Start** tool sets a strictly necessary, first-party session cookie after login. The cookie contains an opaque session identifier rather than an OAuth token. It is protected with the `Secure`, `HttpOnly`, and `SameSite=Lax` attributes and is deleted when the session ends. GitHub may also set cookies during the OAuth login process, which is outside the **Quick Start** tool’s control.
