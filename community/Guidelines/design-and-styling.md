---
sidebar_position: 7
slug: /design-and-styling
title: Design & Styling
description: Best practices for CSS, responsive design, and performance in the SAP Architecture Center. Ensure a fast, accessible, and maintainable site.
sidebar_label: Design & Styling
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

A well-structured CSS approach is essential for maintainable, scalable, and performant web applications. Our project leverages global styles, CSS Modules, and sparing use of inline styles to ensure:

-   **Consistency**: Shared variables and resets keep the look and feel unified.
-   **Isolation**: CSS Modules prevent style conflicts between components.
-   **Responsiveness**: Media queries and flexible layouts adapt to all devices.
-   **Performance**: Optimized images and layout techniques minimize layout shifts and improve load times.

These guidelines help us deliver a robust user experience and make ongoing development easier. As a contributor of reference architecture content, you might not need to worry about this at all. Markdown is styled automatically and we handle the majority of this customization at the site level. Our development team uses these guidelines to provide the rich content on our [main page](https://architecture.learning.sap.com). If you ever contribute a custom component or other site-level modification to our project, the following sections are for you!

## Why Responsive Design?

Responsive design is critical for the SAP Architecture Center because our users access complex technical content from various devices - from mobile phones during commutes to large desktop monitors in development environments. Our architecture diagrams, code examples, and reference materials must remain readable and functional across all screen sizes.

This is achieved using flexible layouts, relative units, and media queries that adapt our content presentation to each device's capabilities. See [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) for a comprehensive guide.

**Minimizing Cumulative Layout Shift (CLS)**

CLS measures unexpected layout shifts during page load. To minimize CLS:

-   Always set `width` and `height` attributes on images.
-   Reserve space for dynamic or late-loading content (e.g., ads, embeds).
-   Avoid inserting new content above existing content without user interaction.
-   Use CSS aspect-ratio or min-height for placeholders.
-   See [web.dev Optimize CLS](https://web.dev/articles/optimize-cls) for more details.

**Optimizing Largest Contentful Paint (LCP) and Images**

LCP is a key web performance metric that measures when the largest content element (often a hero image or heading) becomes visible. To optimize LCP:

-   Use modern image formats like [WebP](https://developers.google.com/speed/webp) for better compression and faster loads. We convert hero and banner images to WebP (see [squoosh.app](https://squoosh.app/) for easy conversion).
-   Use the `srcSet` and `sizes` attributes on `<img>` tags to serve responsive images based on device size and resolution. See the `HeroSection.tsx` for an example:

```tsx
<img
    src={fallbackSrc}
    srcSet={srcSet}
    sizes="(max-width: 600px) 350px, (max-width: 1200px) 700px, 1440px"
    width={1440}
    height={424}
    alt="SAP Architecture Center Banner"
    loading="eager"
    fetchPriority="high"
/>
```

-   Always specify `width` and `height` to reserve space and reduce layout shift.
-   Use `loading="eager"` and `fetchPriority="high"` for above-the-fold images.

## Structure

-   **Global styles**: Located in `src/css/custom.css`. These apply site-wide and include CSS custom properties (variables), typography, utility classes, layout resets, and Infima/Docusaurus overrides.
-   **CSS Modules**: Used for component or page-level styles (e.g., `src/sections/index.module.css`, `src/theme/DocCard/styles.module.css`). These provide local scoping and prevent style conflicts.
-   **CSS Custom Properties**: Centralized variables for spacing, colors, shadows, border-radius, and breakpoints defined in `src/css/custom.css`.
-   **Utility Classes**: Common layout patterns like `.flex-center`, `.card-shadow`, and `.standard-button-width` available globally.
-   **Media queries**: Always placed at the bottom of each CSS or CSS module file, grouped together for clarity and maintainability.

## Best Practices

-   **Use CSS Custom Properties** for consistent spacing, colors, shadows, and dimensions across components. Reference variables like `var(--spacing-md)` instead of hard-coded values.
-   **Prefer CSS Modules** for component/page-specific styles. This keeps styles modular and avoids global namespace pollution.
-   **Leverage utility classes** for common patterns like flexbox layouts (`.flex-center`) and standard button widths (`.standard-button-width`).
-   **Avoid inline styles completely**; use CSS modules or utility classes instead.
-   **Use standardized breakpoints** via CSS variables (`--breakpoint-tablet: 996px`, `--breakpoint-mobile: 600px`).
-   **Keep media queries together** at the end of each file to simplify responsive maintenance.
-   **Name classes descriptively** and use Block Element Modifier (BEM) or similar conventions for clarity. [BEM](https://getbem.com/introduction/) is a naming convention for classes in HTML and CSS that helps keep CSS more maintainable and scalable.
-   **Test changes across breakpoints** to ensure responsive behavior.

### ⚠️ CSS Modules Limitation: Media Query Variables

**Important**: CSS variables **do not work in media queries within CSS Modules** (`.module.css` files). This is a technical limitation of CSS Modules processing.

**✅ This works in CSS Modules:**
```css
.myComponent {
    padding: var(--spacing-md); /* ✅ Works fine */
    color: var(--color-primary); /* ✅ Works fine */
}
```

**❌ This does NOT work in CSS Modules:**
```css
@media (max-width: var(--breakpoint-tablet)) { /* ❌ Variable not resolved */
    .myComponent { /* Styles won't apply correctly */ }
}
```

**✅ Workaround - Use hardcoded breakpoints in CSS Modules:**
```css
@media (max-width: 996px) { /* ✅ Use hardcoded values */
    .myComponent { /* Styles work correctly */ }
}
```

**✅ Alternative - Use global CSS for breakpoint variables:**
CSS variables in media queries work perfectly in `src/css/custom.css` (global CSS file).

**Recommendation**: Use a hybrid approach - CSS variables for properties, hardcoded breakpoints in CSS Modules media queries.

## CSS Custom Properties & Utility Classes

We use CSS custom properties (variables) and utility classes to maintain consistency and reduce code duplication. Instead of hard-coding values like `padding: 16px` or `border-radius: 20px`, use our standardized variables.

### Key Variables & Classes

**Most Common:**
- Spacing: `var(--spacing-sm)` (8px), `var(--spacing-md)` (16px), `var(--spacing-lg)` (24px)
- Shadows: `var(--shadow-card)`, `var(--shadow-card-hover)`
- Border radius: `var(--border-radius-md)` (12px), `var(--border-radius-lg)` (20px)
- Layout: `.flex-center`, `.standard-button-width`

**Example Usage:**
```css
.myCard {
    padding: var(--spacing-md);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-card);
}
```

```tsx
<Button className="standard-button-width">Click Me</Button>
```

*See `src/css/custom.css` for the complete list of available variables and utility classes.*

### Impact on Our Live Site

These practices directly improve our site's performance and user experience:

- **Faster loading**: CSS variables reduce bundle size by ~25%, meaning faster page loads for users accessing architecture diagrams and documentation
- **Consistent experience**: Standardized spacing and shadows ensure our reference architectures and code examples look professional across all devices
- **Easier maintenance**: When we need to update our design system (like adjusting card shadows or spacing), we change one variable instead of hunting through dozens of files

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
