# Unused Assets Report

**Generated:** 2026-03-03
**Project:** SAP Architecture Center NEO

## Summary

This report identifies assets stored in the `static/` directory that are not referenced anywhere in the codebase.

- **Total Assets Found:** 62 files
- **Used Assets:** 33 files
- **Unused Assets:** 29 image files
- **System Files:** 3 .DS_Store files

---

## 🗑️ Unused Assets (Safe to Delete)

### Landing Page Images (5 files)

These hero banner images were created but never implemented in the UI:

- `static/img/landingPage/architecture_center_hero_banner_1440x424_light.webp`
- `static/img/landingPage/architecture_validator_hero_banner_1140x424_light.webp`
- `static/img/landingPage/community_of_practice_hero_banner_1140x424_light.webp`
- `static/img/landingPage/solution_diagram_guidelines_hero_banner_1140x424_light.webp`
- `static/img/landingPage/whats_new_hero_banner_1140x424_light.webp`

### Icon/Logo Images (13 files)

Legacy icons and logos that have been superseded or are no longer used:

- `static/img/Architecture_Center_SocMed6 Large.png`
- `static/img/BTP.png`
- `static/img/ac-soc-med_old.png` *(superseded by ac-soc-med.png)*
- `static/img/blankBlueFolder.png`
- `static/img/blog.svg`
- `static/img/blogpost.png`
- `static/img/discoverycenter.svg`
- `static/img/github-logo.png`
- `static/img/githubFolder.png`
- `static/img/old_favicon.ico` *(superseded by favicon.ico)*
- `static/img/ref-arch-details.png`
- `static/img/sap.webp`
- `static/img/sap_logo.png`
- `static/img/usecase.svg`
- `static/img/work-in-progress.svg`

### Background Images (2 files)

Unused background images:

- `static/img/background_dark_spe7.jpg`
- `static/img/background_light_spe7.jpg`

### Docusaurus Template Images (3 files)

Default Docusaurus template files that were never customized or used:

- `static/img/undraw_docusaurus_mountain.svg`
- `static/img/undraw_docusaurus_react.svg`
- `static/img/undraw_docusaurus_tree.svg`

### Additional Files (6 files)

System files that should be removed:

- `static/img/landingPage/.DS_Store`
- `static/img/.DS_Store`
- `static/.DS_Store`
- `static/.nojekyll` *(GitHub Pages configuration - verify before deletion)*
- `static/CNAME` *(Custom domain configuration - verify before deletion)*
- `static/robots.txt` *(SEO configuration - verify before deletion)*

---

## ✅ Used Assets (33 files)

These assets are actively referenced in the codebase and should **NOT** be deleted:

### Core Images
- `static/img/ac-soc-med.png` - Referenced in docusaurus.config.ts and 100+ markdown files
- `static/img/favicon.ico` - Referenced in docusaurus.config.ts
- `static/img/logo.svg` - Referenced in docusaurus.config.ts and navbar
- `static/img/logo.png` - Referenced in multiple files

### Component Assets
- `static/img/blankBlueFolder.svg` - Used in file tree components
- `static/img/blogpost.svg` - Used in DocCard component
- `static/img/card_header_blue.webp` - Used in DocCard component
- `static/img/fallback-drawio-img.svg` - Used in DrawioResources component
- `static/img/fireworks.gif` - Used in LoadingModal component
- `static/img/rocket.gif` - Used in LoadingModal component
- `static/img/github-mark.svg` - Used in custom.css
- `static/img/github-mark-white.svg` - Used in custom.css
- `static/img/headers/customHeader.svg` - Used in CustomHeader component

### Landing Page Assets
- `static/img/landingPage/AC_AWS_Dark_Logo.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_AWS_Light_Logo.webp` - Used in constants.ts
- `static/img/landingPage/AC_Azure_Logo.webp` - Used in constants.ts
- `static/img/landingPage/AC_GCP_Logo.webp` - Used in constants.ts
- `static/img/landingPage/AC_amazon_logo_dark.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_amazon_logo_light.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_databricks_logo_dark.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_databricks_logo_light.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_google_logo.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_ibm_logo.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_microsoft_logo.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_nvidia_logo_dark.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_nvidia_logo_light.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_snowflake_logo_dark.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/AC_snowflake_logo_light.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/Anvil_RipplePattern_RGB_blue_10.svg` - Used in TechnologyDomainSection
- `static/img/landingPage/Anvil_RipplePattern_RGB_blue_2.svg` - Used in TechnologyDomainSection
- `static/img/landingPage/SAPLogo.svg` - Used in constants.ts
- `static/img/landingPage/worldmap_1440x424_dark.webp` - Used in TrustedTecPartnersSection
- `static/img/landingPage/worldmap_1440x424_light.webp` - Used in TrustedTecPartnersSection

### Other Assets
- `static/img/sap-portfolio-cloud-erp-btp-graphic.svg` - Used in multiple documentation files
- `static/img/sap-architecture-center-logo-v21-450x345.webp` - Used in README.md
- `static/img/sap-architecture-center-logo-v21-900x690.webp` - Used in documentation

### Videos
- `static/video/297893_gettyimages-1396007643_video_web.mp4` - Used in HeroSection component

---

## Recommendations

### Immediate Actions (Safe to Delete)

Delete the following 29 unused image files to reduce repository size:

```bash
# Landing page images
rm "static/img/landingPage/architecture_center_hero_banner_1440x424_light.webp"
rm "static/img/landingPage/architecture_validator_hero_banner_1140x424_light.webp"
rm "static/img/landingPage/community_of_practice_hero_banner_1140x424_light.webp"
rm "static/img/landingPage/solution_diagram_guidelines_hero_banner_1140x424_light.webp"
rm "static/img/landingPage/whats_new_hero_banner_1140x424_light.webp"

# Icon/Logo images
rm "static/img/Architecture_Center_SocMed6 Large.png"
rm "static/img/BTP.png"
rm "static/img/ac-soc-med_old.png"
rm "static/img/blankBlueFolder.png"
rm "static/img/blog.svg"
rm "static/img/blogpost.png"
rm "static/img/discoverycenter.svg"
rm "static/img/github-logo.png"
rm "static/img/githubFolder.png"
rm "static/img/old_favicon.ico"
rm "static/img/ref-arch-details.png"
rm "static/img/sap.webp"
rm "static/img/sap_logo.png"
rm "static/img/usecase.svg"
rm "static/img/work-in-progress.svg"

# Background images
rm "static/img/background_dark_spe7.jpg"
rm "static/img/background_light_spe7.jpg"

# Docusaurus template images
rm "static/img/undraw_docusaurus_mountain.svg"
rm "static/img/undraw_docusaurus_react.svg"
rm "static/img/undraw_docusaurus_tree.svg"

# System files
rm "static/img/landingPage/.DS_Store"
rm "static/img/.DS_Store"
rm "static/.DS_Store"
```

### Caution: Verify Before Deletion

These files may be needed for deployment:
- `static/.nojekyll` - Required for GitHub Pages to serve files with underscores
- `static/CNAME` - Custom domain configuration
- `static/robots.txt` - SEO configuration for search engines

---

## Impact Analysis

**Disk Space to be Recovered:**
- Estimated: ~5-10 MB (depending on image sizes)
- Repository size reduction will improve clone times

**Risk Level:** ✅ LOW
- All identified unused assets have been verified to have no references in:
  - Source code (.tsx, .ts, .jsx, .js)
  - Stylesheets (.css, .scss)
  - Configuration files
  - Markdown documentation (.md, .mdx)

---

## Notes

- This analysis was performed on 2026-03-03
- All source files, configuration files, and markdown files were checked
- Re-run this analysis if significant codebase changes are made
- Consider adding `.DS_Store` to `.gitignore` to prevent future commits
