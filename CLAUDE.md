# Claude Code Guidelines for SAP Architecture Center

This file provides guidance for Claude Code when working in the SAP Architecture Center repository.

## Project Overview

The SAP Architecture Center contains reference architectures that show how SAP applications, data, and AI operate at the product and service level. These templates provide standardized approaches to designing systems with SAP technologies.

## PR Review Guidelines

When reviewing pull requests, evaluate contributions against these criteria:

### 1. SAP Strategic Alignment (Critical)

**All reference architectures must align with SAP's strategy and interests.**

- **SAP-centric positioning**: SAP products and services should be the primary focus and value driver in any architecture
- **Non-SAP solutions must complement, not compete**: Third-party or partner solutions should extend SAP capabilities, not replace or diminish them
- **Verify partnership status**: When a PR introduces third-party vendor products, verify if they are official SAP partners
- **Avoid promotional language**: Content should not read like marketing material for non-SAP vendors
- **Compare with existing patterns**: Check if SAP has documented integrations with alternative vendors (e.g., Microsoft Sentinel for SIEM) that might be preferred

**Red flags to watch for:**
- SAP products positioned as "feeder systems" to third-party solutions
- Third-party products described as the "central" or "primary" component
- Missing mention of SAP's own capabilities in the same space
- Vendor-specific architectures that could be more generic

**Questions to ask contributors:**
- Is [vendor] an official SAP partner?
- Why this specific vendor vs. a vendor-neutral pattern?
- Does this align with SAP's existing partner ecosystem?

### 2. Content Structure

Reference architectures must follow the established folder structure:

```
docs/ref-arch/RAXXXX/
├── drawio/
│   └── [diagram-name].drawio
├── images/
│   └── (auto-generated SVGs)
└── readme.md
```

For sub-pages:
```
docs/ref-arch/RAXXXX/
├── 1-first-subfolder/
│   ├── drawio/
│   ├── images/
│   └── readme.md
├── 2-second-subfolder/
│   ├── drawio/
│   ├── images/
│   └── readme.md
├── drawio/
├── images/
└── readme.md
```

### 3. Front Matter Requirements

Every readme.md must include proper front matter:

```yaml
---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0001
slug: /ref-arch/xxxxxxxxxx
sidebar_position: 1
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Title (max 50 characters, alphanumeric and spaces only)
description: Description (important content in first 110 characters, max 300)
sidebar_label: Sidebar Label (max 50 characters)
keywords: [sap, keyword1, keyword2]
image: img/logo.svg
tags: [tag1, tag2, tag3]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - github-username1
    - github-username2
last_update:
    date: YYYY-MM-DD
    author: github-username
############################################################
#                   End of Front Matter                    #
############################################################
---
```

**Validation rules:**
- `id`, `slug`, `sidebar_position`: Auto-assigned, do not modify
- `title`: Max 60 characters, alphanumeric and spaces only
- `description`: Important content in first 110 characters
- `keywords`: Must include `sap` as default
- `tags`: Must be valid tags from tags.yml
- `draft`: Set to `true` until ready for review
- `last_update.date`: Format YYYY-MM-DD

### 4. Required Content Sections

Every reference architecture readme.md must include these sections:

```markdown
<!-- Add the 'why?' for this architecture -->

## Architecture

![drawio](drawio/[diagram-name].drawio)

## Flow

<!-- Numbered steps explaining the architecture flow -->

## Characteristics

<!-- Bullet points describing key properties -->

## Examples in an SAP context

<!-- Practical use cases in SAP context -->

## Services and Components

<!-- Links to SAP Discovery Center or official product pages -->

## Resources

<!-- Links to documentation, blogs, tutorials -->

## Related Missions

<!-- Add related missions here -->
```

### 5. Technical Quality

- No formatting errors (check for broken markdown, split words)
- Proper punctuation in lists and descriptions
- No empty sections (remove or populate placeholder sections)
- Consistent formatting with other reference architectures
- Diagrams render correctly with `![drawio](drawio/filename.drawio)` syntax
- Title must only contain alphanumeric characters and spaces

### 6. Writing Style

- Professional, objective tone
- Focus on technical accuracy
- Avoid marketing language or superlatives
- Use SAP terminology consistently

## Common Review Checklist

```
[ ] Aligns with SAP strategy (not competing with SAP products)
[ ] Third-party vendors are SAP partners or appropriately positioned
[ ] Follows folder structure (RAXXXX/drawio/, readme.md)
[ ] Front matter is complete and properly formatted
[ ] Title is alphanumeric with spaces only, max 50 chars
[ ] Description has important content in first 110 chars
[ ] Keywords include 'sap' as default
[ ] Has all required sections: Architecture, Flow, Characteristics, Examples, Services, Resources
[ ] No formatting errors or typos
[ ] No empty placeholder sections
[ ] Diagrams are included and properly referenced
[ ] Links are valid and point to official sources
[ ] draft: true until ready for final review
```

## File Locations

- Reference architectures: `docs/ref-arch/RAXXXX/`
- Contribution guidelines: `community/02-Guidelines/`
- Front matter documentation: `community/02-Guidelines/04-front-matter.md`
- Content structure guide: `community/02-Guidelines/03-content-structure.md`

## Communication Style

**All responses and outputs must sound natural and human-like.**

When working in this repository, communicate in a way that feels conversational and fluid, not like generic AI-generated text. This applies to:

- PR review comments and feedback
- Commit messages and documentation updates
- Analysis and recommendations
- Any written communication about the codebase

Write as a knowledgeable colleague would write, with personality and clarity, while maintaining professionalism and technical accuracy.

## Commands

- Build locally: Check package.json for available scripts
- Validate links: GitHub Actions run periodic link checks

## Task Progress Completion Rules

**A task should only be marked as complete ([x]) when ALL of the following conditions are met:**

1. **Fully Tested**: The implementation has been verified to work correctly
2. **No Pending Actions**: There are no remaining steps or follow-up work required
3. **No Pending Questions**: There are no unanswered questions waiting for human response

**Do NOT mark a task as complete if:**
- Testing is still in progress or has not been performed
- There are open questions that require human input before proceeding
- The task depends on information that hasn't been provided yet
- The implementation is partial or requires additional work
- Verification from the user is still pending

**Example of correct usage:**
```
- [x] Analyze requirements (completed - requirements gathered and understood)
- [x] Implement the feature (completed - code written and tested successfully)
- [ ] Review with stakeholder (waiting for human feedback)
- [ ] Deploy to production (blocked by pending review)
```

This ensures that task progress accurately reflects the true state of work and prevents premature marking of incomplete items.
