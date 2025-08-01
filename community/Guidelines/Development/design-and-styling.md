---
sidebar_position: 2
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

A well-structured CSS approach is essential for maintainable, scalable, and performant web applications. Our project leverages global styles, CSS Modules, and utility classes for:

-   **Consistency**: Shared variables and resets keep the look and feel unified.
-   **Isolation**: CSS Modules prevent style conflicts between components.
-   **Responsiveness**: Media queries and flexible layouts adapt to all devices.
-   **Performance**: Optimized images and layout techniques minimize layout shifts and improve load times.

These guidelines help us deliver a robust user experience and make ongoing development easier. As a contributor of reference architecture content, you might not need to worry about this at all. Markdown is styled automatically and we handle the majority of this customization at the site level. Our development team uses these guidelines to provide the rich content on our [main page](https://architecture.learning.sap.com). If you ever contribute a custom component or other site-level modification to our project, the following sections are for you!

## Why Responsive Design?

Responsive design is critical for the SAP Architecture Center because our users access complex technical content from various devices - from mobile phones during commutes to large desktop monitors in development environments. Our architecture diagrams, code examples, and reference materials must remain readable and functional across all screen sizes.

This is achieved using flexible layouts, relative units, and media queries that adapt our content presentation to each device's capabilities. See [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) for a comprehensive guide.

The impact on our site is surfaced in our [core web vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) score, which influences where pages are ranked for Google searches. Two critical topics are:

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

## CSS Custom Properties & Utility Classes

We use CSS custom properties (variables) and utility classes to maintain consistency and reduce code duplication. Instead of hard-coding values like `padding: 16px` or `border-radius: 20px`, use our standardized variables.

### Key Variables & Classes

**Most Common:**
- Spacing: `var(--spacing-sm)` (8px), `var(--spacing-md)` (16px), `var(--spacing-lg)` (24px)
- Shadows: `var(--shadow-card)`, `var(--shadow-card-hover)`
- Border radius: `var(--border-radius-md)` (12px), `var(--border-radius-lg)` (20px)
- Layout: `.flex-center`, `.standard-button-width`

**Carousel Specific:**
- Padding: Use the `cardClassName` prop on the `ReactCarousel` component to apply consistent padding. The `paddedCardContainer` class in `ReactCarousel.module.css` is a good default.

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
