---
sidebar_position: 4
slug: /front-matter
title: Front Matter
sidebar_label: Front Matter
keywords:
 - sap
 - front matter
image: img/logo.svg
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - navyakhurana
  - cernus76
  - jmsrpp
last_update:
  author: navyakhurana
  date: 2025-01-20
---

The Front Matter plays a crucial role in reference architectures. It defines key aspects such as SEO details, along with essential technical information like the slug (URL), sidebar position, and the date of the last update.

## Example
Here is an example of what a page front matter looks like:

```yaml
---
id: id-ra0001
slug: /ref-arch/a06a959120
sidebar_position: 1
sidebar_custom_props:
  category_index:
    - aws
title: SAP Event-Driven Architecture Technology
description: Please add a description (max 300 characters)
keywords:
  - sap
sidebar_label: SAP Event-Driven Architecture Technology
image: img/logo.svg
tags:
  - ref-arch
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - cernus76
  - jmsrpp
last_update:
  author: jmsrpp
  date: 2025-01-01
---
```

***

## `---`

The front matter starts and ends with `---`.

***

## `id` 

* Each page receives an `id`. 

This `id` is structured as the following:

* `id` `-` `< assigned RAXXXX of the page >` for the landing page.
* `id` `-` `< assigned RAXXXX of the page >` `-` `< number from 1 to 99... >` for a subpage.

Let's take the following example: `id: id-ra0001`.
This id indicates this is the landing page of the reference architecture 0001.

Example:
```yaml
id: id-ra0001
```

:::warning Do Not Modify
This information is auto-assigned.
:::

***

## `slug` 

* Each page receives a `slug` which is the document's URL. 

This `slug` is structured as the following:

* `/ref-arch/` is followed by a short UUID `XXXXXXXXXX` 
* `/ref-arch/XXXXXXXXXX` is reserved for the landing page of the reference architecture.
* `/ref-arch/XXXXXXXXXX/1` will be assigned to the first subpage of the reference architecture.
* `/ref-arch/XXXXXXXXXX/1/1` will be assigned to the first sub-subpage of the reference architecture.

Example: 
```yaml
slug: /ref-arch/a06a959120
```
This id indicates this is the landing page of the reference architecture.

:::warning Do Not Modify
This information is auto-assigned.
:::

***

## `sidebar_position`

* `sidebar_position` is used to position the reference architecture on the sidebar.

Example:
```yaml
sidebar_position: 1
```

:::warning Do Not Modify
This information is auto-assigned.
:::

***

## `sidebar_custom_props`

This information defines in which part of the SAP Viewpoints the page will appear.

In the following example, the page will be displayed in the `aws` part of the SAP Viewpoints.

Example:
```yaml
sidebar_custom_props:
  category_index:
    - aws
```

:::warning Do Not Modify
This information is auto-assigned.
:::

***

## `title`

* `title` defines the page name, the one which will be displayed in the browser tab.
* `title` is used for the SEO (used as page title when indexed by the search engines) or when the page is shared on social medias.
* Additionally, `title` can also be displayed on your reference architecture page if it does not have any single `#` headings in it.
* It should be clear and concise. 

Example:
```yaml
title: SAP Event-Driven Architecture Technology
```

:::tip Best practice
Your title should not be longer than **60** characters. 
:::

***

## `description`

* `description` is used for the SEO (used as page description when indexed by the search engines) or when the page is shared on social medias.

Example:
```yaml
description: Event-driven Architecture(EDA) is a software design pattern for building and integrating systems which focuses on flow of events and resulting reaction triggered by these events.
```

:::tip Best practice
We recommend to make sure the important part of your description is within the first **110** characters.
:::

***

## `keywords`

* `keywords` is used for specific keywords to find the page. All pages should have `sap` as default.

Example:
```yaml
keywords:
  - sap
  - analytics
  - sac
```

***

## `sidebar_label`

* `sidebar_label` is the displayed entry on the sidebar. 
* It can be identical to the `title` or different. It is up to you.
* It should be clear and concise. 

Example:
```yaml
sidebar_label: SAP Event-Driven Architecture Technology
```

:::tip Best practice
Your title should not be longer than **50** characters. 
:::

***

## `image`

* `image` is the image which will be displayed when sharing the page. 
* The default image is the SAP logo `image: img/logo.svg`

Example:
```yaml
image: img/logo.svg
```

:::tip Best practice
The optimal size should be **1200 x 630**. 
:::

***

## `tags`

* `tags` are displayed at the bottom of the page. 
* The tags are defined in a yaml file named `tags.yml`.
* It is possible to enrich the file and add new tags.

Example:
```yaml
tags:
  - ref-arch
  - aws
  - azure
```

Example of a tag declaration in the `tags.yml` file:
```yaml
ref-arch:
  label: "Reference Architectures"
  description: "Reference Architectures offer standardized, reusable templates for software architecture, providing best practices, guidelines, and blueprints to streamline design, development, and deployment."
```

***

## `hide_table_of_contents`

* `hide_table_of_contents` allows you to reclaim the space allocated to the Table Of Content (TOC) on the right hand side of the page. 
* In some cases it makes sense to hide the TOC as there is no really use of it. 
* Default value is set to `false`.

Example:
```yaml
hide_table_of_contents: false
```

***

## `hide_title`

* `hide_title` allows you to not display the title of the page on the page. 
* In some cases it makes sense to hide the Title if there is no need for it. 
* Default value is set to `false`.

Example:
```yaml
hide_title: false
```

***

## `toc_min_heading_level`

* `toc_min_heading_level` allows you to define the minimum level for the TOC. 
* Default value is set to `2`.

Example:
```yaml
toc_min_heading_level: 2
```

***

## `toc_max_heading_level`

* `toc_max_heading_level` allows you to define the maximum level for the TOC. 
* Default value is set to `4`.

Example:
```yaml
toc_min_heading_level: 4
```

***

## `draft`

* `draft` defines the status of your page. If it is in draft mode, it means the page is not ready yet.
* The default value is `true`
* If you set this to `true`, the page will not be part of the build and will not be deployed.
* If you set this to `false`, the page will be part of the build and will be deployed.

Example:
```yaml
draft: false
```

:::tip Best practice
Keep the value to `true` until you are done and ready to submit the page for review.
:::

***

## `unlisted`

* `unlisted` defines if your page is visible in the Architecture Center. If it is unlisted, it means the page is deployed and accessible but it not visible.
* The default value is `false`
* If you set this to `true`, the page will be part of the build, will be deployed, but will not be visible in the sidebar. You need to access it directly via the defined `slug`.
* If you set this to `false`, the page will be part of the build, will be deployed, and will be visible in the sidebar.

Example:
```yaml
unlisted: false
```

:::tip Best practice
Set the value to `true` when you want to share the page to a limited number of people for validation.
:::
***

## `contributors`

* `contributors` defines the main contributors of the page.
* Enter the GitHub username(s).
* The contributors are displayed at the bottom of the page. 

Example:
```yaml
contributors:
  - cernus76
  - jmsrpp
  - navyakhurana
```

:::tip Best practice
Check the generated admonition to make sure there are no typos in the GitHub usernames.
:::
***

## `last_update`

* `last_update` defines the last update of the page (author + date).
* The contributors are displayed at the bottom of the page.
* The date should be **YYYY-MM-DD**.

Example:
```yaml
last_update:
  author: jmsrpp
  date: 2025-01-01
```

:::tip Best practice
Enter only one author.
:::

***
