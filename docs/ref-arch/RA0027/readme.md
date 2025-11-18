---
id: id-ra0027
slug: /ref-arch/6BwjG3-Y
sidebar_position: 27
title: 'This is a test'
description: 'This is a default description.'
keywords: 
  - agents
sidebar_label: 'This is a test'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - agents
contributors:
  - cernus76
last_update:
  date: 2025-11-18
  author: cernus76
---

jfdhjlhgld



 

1. Just out of curiosity, can we make the draw io solution diagram navigable? If we annotate the solution diagram with labels and then add links ([https://drawio-app.com/blog/linking-content-in-draw-io-diagrams/](https://drawio-app.com/blog/linking-content-in-draw-io-diagrams/" \o "https://drawio-app.com/blog/linking-content-in-draw-io-diagrams/)), then that might make the developer experience nice (to Marin’s point of reducing too-much-information for the reader)

If this is not provided by the Use Case team, it will add some additional effort when implementing the template.

But it is of course possible.

1. I recollect you mentioned about adding a one-click automation option. Can you investigate how to plug in BTP Terraform Provider ([https://registry.terraform.io/providers/SAP/btp/latest/docs](https://registry.terraform.io/providers/SAP/btp/latest/docs" \o "https://registry.terraform.io/providers/SAP/btp/latest/docs)) with GitHub Workflows ([https://docs.github.com/en/actions/using-workflows](https://docs.github.com/en/actions/using-workflows" \o "https://docs.github.com/en/actions/using-workflows)) – if that’s at all possible?

 

This is not part of the MVP but will be evaluated for the next phase. We need an automation guru (Max?) to evaluate how much effort do we need to adapt the automation from DC to GitHub. 

1. Can we decide about the ToC titles on the left or is that automatically taken from the respective README headline?

This automatically generated but can be customized if necessary. For that additional effort will be required for maintaining the entries in some config files.

1. It’s just a personal opinion, but I think there should be a separate “Overview” page, which only contains the absolute essential details of the use-case and maybe another “Project Detail. Secondary, can e.g., contain a lot of the details which are in the “Overview” as of today. Otherwise, that might be a bit “overwhelming”.

This is possible but needs to be created and maintained. The content will need to be created and segregated by the content team (Use Case Experts).

1. A few screenshots especially on subpages (e.g., [here](https://navyakhurana.github.io/PAA/project-panel/basic/kyma-resources-helm/components/TemplateDetails)) are not displayed properly – works when I click on it – no idea why that’s the case…

We do not experience this on our side. Let’s check this together.

1. You think it’s possible to provide a sandwich button to hide the menu on the left?

Yes, this is possible. It has been implemented.

1. Interested in how you solved the link resolution as it works pretty well except for a few exceptions (e.g., [here](https://navyakhurana.github.io/PAA/project-panel/basic/explore-the-components/components/SharedContainer#1-helm-chart-definition) – first “click here” link in #1)

The content of the repo changed in the meantime. Sometimes some links need to be updated. Maybe the link was already “wrong” in the source file.

1. Can we have sth. like a “Share” feature/buttons on the top of each page (for instance, share via Mail or WhatsApp etc…)?

We can investigate but it seems docusaurus does not have this feature.

1. Not sure but sometimes tables are displayed incorrectly (e.g., bottom of [this page](https://navyakhurana.github.io/PAA/project-panel/basic/introduction-basic-version))

We need to investigate.

1. It would be amazing to have an option to provide further details to each of the cards on e.g., the “Project Panel” like a short summary or anticipated setup time or similar

This is possible but needs to be added manually. There is a config file which can be edited.

1. I am a fan of Icons tbh… You think we could get icons instead or in addition to the menu titles?

So do I. I also like colors but the further we go from the standard the more effort you will get when implementing the template. We could use for example Font Awesome (free).

1. Similar finding I also had with Discover center when it comes to Markdown processing – “\<Release>-api-\<Namespace>-\<ShootName>” – Not sure why the backslashes are being rendered (see [here](https://navyakhurana.github.io/PAA/project-panel/basic/subscribe-consumer-subaccount#2-api-service-broker-instance))…

We need investigate. For this example, we have the \ in the source file (md).

1. Somehow the “namespace” keyword seems to cause strange formatting in code snippets…

We need investigate. For this example, we have the spaces in the source file (md).

1. Next and previous chapter buttons would also be nice on the top of each page.

We need to investigate this. This is generated by docusaurus and I am not sure if we can customized this part.

1. I like the **green** highlighting of hints, but somehow it doesn’t work equally throughout the tutorial



![drawio](drawio/diagram-2uSL7NRR-v.drawio)



It has been fixed.

1. I like the fact we can zoom into the images and that the images are displayed at 100% size, but sometimes we should have an option to set a fixed size for an image, if we do not want to display it at 100%.

We need to align on this because we are not getting it ☺

1. Looking forward to the “Issues List” integration (if it is technically possible) – The Support page is already super cool, although we should try to reduce the reference to Discover Center terms (Mission / Use Case Expert).

Absolutely. We have updated the page.

1. Adding the last update on the page (date and who made the update).

This has been implemented.

