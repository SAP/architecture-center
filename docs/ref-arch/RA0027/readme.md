---
id: id-ra0027
slug: /ref-arch/p3bKu28g
sidebar_position: 1
title: 'TEST'
description: 'This is a default description.'
sidebar_label: 'TEST'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - aws
  - genai
contributors:
  - cernus76
last_update:
  date: 2025-11-06
  author: cernus76
---



![drawio](drawio/diagram-7BHuNO8lyA.drawio)





**Use Case on GitHub enhanced by Docusaurus**

The different steps to prepare the guide.

1. Create a repo where we have docusaurus and all the necessary additional plugins. Refer to this repo for the deployment of the “template”. The team members will not have to look for that and download again the different elements.
2. Write in this document everything you do to set this up.

This includes:

- all the command lines.
- all the file manipulations (copy/past/move).
- all the edited files (config file, json file…) for the possible customization.

1. Additionally, write all the best practices which will need to be applied.

This includes:

- all the HTML code which should be avoided.
- all the MD tags which could be used to enhance the look and feel.
- all the tricks needed to get a nice output like TABLES with nbsp;.

1. Do not hesitate to make screenshots for the step-by-step guide.

I will be implementing this to validate the guide once it is complete.

If there is a way for me to help you, please reach out. I will be more than delighted to support you in this.

Please, focus on the content, not on the form. I will take care of that.

Guide starts here.

**Use Case on GitHub enhanced by Docusaurus**

**Requirement:**

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above required.

**Project Structure:**

**my-website**

**├── docs**

**│ ├── project-panel**

|. | ├── basic

|. | ├── doc1.md

|. |. ├── advance

|. |. ├── doc2.md

|. | ├── category.json

**│ ├── support.md**

**│ └── overview.md**

**├── src**

**│ ├── css**

**│ │ └── custom.css**

**│ └── pages**

**│ ├── styles.module.css**

**│ └── index.js**

**├── static**

**│ └── img**

**├── docusaurus.config.js**

**├── config.json**

**├── .env**

**├── package.json**

**├── README.md**

**├── sidebars.js**

### **Project structure rundown:**

- /blog/ - Contains the blog Markdown files. You can delete the directory if you've disabled the blog plugin, or you can change its name after setting the path option. More details can be found in the [blog guide](https://docusaurus.io/docs/blog)
- /docs/ - Contains the Markdown files for the docs. Customize the order of the docs sidebar in sidebars.js. You can delete the directory if you've disabled the docs plugin, or you can change its name after setting the path option. More details can be found in the [docs guide](https://docusaurus.io/docs/docs-introduction)
- /src/ - Non-documentation files like pages or custom React components. You don't have to strictly put your non-documentation files here, but putting them under a centralized directory makes it easier to specify in case you need to do some sort of linting/processing
- /src/pages - Any JSX/TSX/MDX file within this directory will be converted into a website page. More details can be found in the [pages guide](https://docusaurus.io/docs/creating-pages)
- /static/ - Static directory. Any contents inside here will be copied into the root of the final build directory
- /docusaurus.config.js - A config file containing the site configuration. This is the equivalent of siteConfig.js in Docusaurus v1
- /package.json - A Docusaurus website is a React app. You can install and use any npm packages you like in them
- /sidebars.js - Used by the documentation to specify the order of documents in the sidebar
- /config.json & .env- Used for Enabling Algolia DocSearch configurations.
- /docs/project-panel/category.json: To automatically generate sidebar indexes.

Sample Template for the Docusaurus project: [https://github.com/navyakhurana/paa-projects-sample.git](https://github.com/navyakhurana/paa-projects-sample.git)

Steps to Follow:

1. **Getting Started:**
2. Embed the contents of above repo in your project [https://github.com/navyakhurana/paa-projects-sample.git](https://github.com/navyakhurana/paa-projects-sample.git)
3. Run “**npm install**” - To install all docusaurus dependencies (Remember to use correct version of node as mentioned above)
4. To Start the project locally: Run “npm run start” and your project should be running on [http://localhost:3000/baseURL](http://localhost:3000/baseURL)
5. **Deployment: (On GitHub Pages)**

- **Building Project:**

Run “**npm run build**” - To build the project. (Once it finishes, the static files will be generated within the build directory.)

## **Configuration**[](https://docusaurus.io/docs/deployment#configuration)

The following parameters are required in **docusaurus.config.js **to optimize routing and serve files from the correct location:

**Name**

**Description**

url

URL for your site. For a site deployed at [https://my-org.com/my-project/](https://my-org.com/my-project/), url is [https://my-org.com/](https://my-org.com/).

baseUrl

Base URL for your project, with a trailing slash. For a site deployed at [https://my-org.com/my-project/](https://my-org.com/my-project/), baseUrl is /my-project/.

- **Testing your build locally**

Run “**npm run serve**”

### **docusaurus.config.js settings**[](https://docusaurus.io/docs/deployment#docusaurusconfigjs-settings)

First, modify your docusaurus.config.js and add the following params:

**Name**

**Description**

organizationName

The GitHub user or organization that owns the deployment repository.

projectName

The name of the deployment repository.

deploymentBranch

The name of deployment branch. Defaults to 'gh-pages' for non-organization GitHub Pages repos (projectName not ending in .github.io). Otherwise, this needs to be explicit as a config field or environment variable.

These fields also have their environment variable counterparts, which have a higher priority: ORGANIZATION_NAME, PROJECT_NAME, and DEPLOYMENT_BRANCH.

- Deploying to GitHub Pages:

Run command **“GIT_USER=***YourGitID ***npm run deploy”**

For any other information regarding deployment: Refer [https://docusaurus.io/docs/deployment](https://docusaurus.io/docs/deployment)

1. **Using Algolia DocSearch (Optional)**

For configuring the search bar we’ll be running our own Docker crawler.

The whole code base of DocSearch is open source, and we package it as a Docker image to make this even easier for you to use.

@docusaurus/preset-classic for Algolia DocSearch integration is already there in the docusaurus.config.js

- - **SetUp your environment:**

You'll need to set your Algolia application ID and admin API key as environment variables. If you don't have an Algolia account, you need to [create one.](https://www.algolia.com/pricing)

- - - APPLICATION_ID set to your Algolia Application ID
- API_KEY set to your API Key. Make sure to use an API key with **write** access to your index. It needs [the ACL addObject, editSettings and deleteIndex](https://www.algolia.com/doc/guides/security/api-keys/#acl).

For convenience, we have created a **.env file **in the repository root where you need to append your below IDs.

APPLICATION_ID=YOUR_APP_IDAPI_KEY=YOUR_API_KEY

Also, config.json have already been maintained at the root level which will be used by Docker Crawler to crawl over the MD files.

Changes Required in config.json file for DocSearch to run through your Docusaurus file:

"index_name": "your_algolia_index",

"start_urls":[ "https://yourGithubRepoName.github.io/yourBaseURL" ],

"sitemap_urls": [

“[https://yourGithubRepoName.github.io/yourBaseURL/sitemap.xml”](https://yourGithubRepoName.github.io/yourBaseURL/sitemap.xml”)

- - - **Run Your Docker Crawler:**

Run “**docker run -it --env-file=.env -e "CONFIG=$(cat ./config.json | jq -r tostring)" algolia/docsearch-scraper”**

]

Reference Tutorial for Algolia DocSearch: [How to add search functionality to Docusaurus with Algolia Docusearch and a custom crawler](https://www.youtube.com/watch?v=F_jqADu-izk)

[https://docusaurus.io/docs/search#using-algolia-docsearch](https://docusaurus.io/docs/search#using-algolia-docsearch)

[https://docsearch.algolia.com/docs/legacy/run-your-own](https://docsearch.algolia.com/docs/legacy/run-your-own)

1. **Customizations Required(in existing template)**

- Add your documentation folders directly in the /docs folder
- Add your main README.md file which contains Overview of your usecase in Overview.md file present in the docusaurus template.
- In the Support.md file present in docusaurus template, append the contributors in the **Collaborate with Experts** section
- For adding images in your usecase, please follow the github syntax given below:

![Alt text](image link)

- Under the folder hierarchy of your document allow custom props through _*category_*.json. (To generate index automatically, Sample given in the github template)



- In addition to the basic Markdown syntax, to highlight specific content, docusaurus offers a special admonitions syntax by wrapping text with a set of 3 colons, followed by a label denoting its type.

Example:

:::note Your Title

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::



:::tip Your Title

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::



:::info Your Title

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::



:::caution Your Title

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::



:::danger Your Title

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::



Reference link: [https://docusaurus.io/docs/markdown-features/admonitions#usage-in-jsx](https://docusaurus.io/docs/markdown-features/admonitions#usage-in-jsx)

