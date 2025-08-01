---
sidebar_position: 3
slug: /devlopementexamples
title: Examples
description: Examples for CSS, responsive design, and performance in the SAP Architecture Center.
sidebar_label: Development Examples
keywords:
    - sap architecture center
    - css guidelines
    - responsive design
    - webp images
    - largest contentful paint
    - layout shift
    - image optimization
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
    author: jmsrpp
    date: 2025-06-20
---

Below are several examples that demonstrate best practices for improving code styling and overall coding quality.

## Examples

### Adjusting Hero Banner Padding

Suppose you want to increase the left and/or top padding of the hero banner text on the landing page:

1. **Locate the relevant CSS class** in `src/css/custom.css` (for global) or the appropriate CSS module if the style is component-specific.
2. **Edit the padding property**. For example, to increase left padding for `.welcome` (which wraps the hero text):

```css
.welcome {
    /* ...existing code... */
    padding-left: 4rem; /* Increase as needed */
    padding-top: 5rem; /* Add or adjust as needed */
    /* ...existing code... */
}
```

3. **If the change should only apply at certain breakpoints**, add or adjust the relevant media query at the bottom of the file:

```css
@media (max-width: 600px) {
    .welcome {
        padding-left: 2rem;
        padding-top: 2rem;
    }
}
```

### Flexbox Layout and Responsive Changes

Flexbox is widely used in our CSS for layout. For example, the footer and card layouts use flex properties to control direction, alignment, and spacing.

**Changing Flex Direction for Responsive Footer**

In `src/css/custom.css`, the footer links are displayed in a row by default, but switch to a column layout on tablet screens (996px and below):

```css
.footer__links {
    display: flex;
    justify-content: center !important;
    align-items: flex-start;
    width: 100%;
    margin: 0 auto;
}

@media (max-width: 996px) {
    .footer__links {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100%;
        margin: 0 auto;
    }
}
```

**How to change:**

-   To switch a flex container from row to column at a breakpoint, add or update the `flex-direction` property inside the relevant media query.
-   Use `align-items` and `justify-content` to control alignment in the new direction.

**Example: Adjusting Card Layout for Responsiveness**

In `src/sections/index.module.css`, the `.cardContainer` class changes its `max-width` and padding at different breakpoints:

```css
.cardContainer {
    padding: 0 12px;
    box-sizing: border-box;
    min-height: 320px;
    max-width: 430px;
    width: 100%;
}

@media (max-width: 996px) {
    .cardContainer {
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
        padding-left: 0;
        padding-right: 0;
        display: flex !important;
        flex-direction: column;
    }
}

@media (max-width: 600px) {
    .cardContainer {
        min-height: 340px;
        padding: 0 2px;
    }
}
```

This ensures cards are wider and more readable on tablets, and have minimal padding on mobile.

### Card Layout with Flexbox

In `src/theme/DocCard/styles.module.css`, the `.docCard` class uses flexbox to stack content vertically and align it to the bottom:

```css
.docCard {
    /* ...existing code... */
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
```

-   `display: flex;` enables flexbox layout.
-   `flex-direction: column;` stacks children vertically.
-   `justify-content: flex-end;` aligns children to the bottom of the card.

To change the alignment (e.g., to top or center), adjust `justify-content`:

```css
.docCard {
    /* ...existing code... */
    justify-content: flex-start; /* or center */
}
```

### Adjusting Card Tag Row Spacing

To change the spacing between tags in a card, edit the `gap` property in the `.tagsRow` class:

```css
.tagsRow {
    /* ...existing code... */
    gap: 3px; /* Increase for more space between tags */
}
```

## Docusaurus & React Styling

-   Docusaurus supports global CSS, CSS Modules, and (experimental) CSS-in-JS. See [Docusaurus Styling & Layout](https://docusaurus.io/docs/styling-layout).
-   For React best practices, see [Best Practices for Styling in React](https://medium.com/@elightwalk/what-are-the-best-practices-for-styling-in-react-e9816e7912d4) and [CSS Matters: An Overview of Different CSS Approaches](https://yaron-galperin.medium.com/css-matters-an-overview-of-different-css-approaches-66a8656886ca).

## References

-   [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
-   [web.dev: Optimize CLS](https://web.dev/articles/optimize-cls)
-   [Docusaurus: Styling and Layout](https://docusaurus.io/docs/styling-layout)
-   [React Styling Best Practices](https://medium.com/@elightwalk/what-are-the-best-practices-for-styling-in-react-e9816e7912d4)
-   [CSS Approaches Overview](https://yaron-galperin.medium.com/css-matters-an-overview-of-different-css-approaches-66a8656886ca)
-   [BEM Introduction](https://getbem.com/introduction/)
-   [WebP Image Format](https://developers.google.com/speed/webp)
-   [Squoosh Image Converter](https://squoosh.app/)
