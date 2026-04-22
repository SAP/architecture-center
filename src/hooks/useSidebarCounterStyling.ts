import { useEffect } from 'react';

/**
 * Hook to enhance sidebar items with styled duplicate counters
 * Wraps "+N" counters in spans with tooltips
 */
export function useSidebarCounterStyling() {
  useEffect(() => {
    const processCounters = () => {
      // Find all sidebar links
      const menuLinks = document.querySelectorAll('.menu__link');

      menuLinks.forEach((link) => {
        // Skip if already processed
        if (link.hasAttribute('data-counter-processed')) return;

        // Get all text content from the link
        const linkText = link.textContent || '';

        // Check if it contains a counter pattern
        const counterMatch = linkText.match(/^(.+?)\s+\+(\d+)$/);

        if (counterMatch) {
          const [, mainText, count] = counterMatch;

          // Clear the link content
          link.textContent = '';

          // Create span for main text
          const textSpan = document.createElement('span');
          textSpan.textContent = mainText;
          textSpan.title = mainText;

          // Create span for counter
          const counterSpan = document.createElement('span');
          counterSpan.className = 'sidebar-duplicate-counter';
          counterSpan.textContent = ` [+${count}]`;
          counterSpan.title = `Also appears in ${count} other ${count === '1' ? 'domain' : 'domains'}`;
          counterSpan.style.cssText = `
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--ifm-color-content-secondary);
            cursor: pointer;
          `;

          // Add hover effect
          counterSpan.addEventListener('mouseenter', () => {
            counterSpan.style.color = 'var(--ifm-color-primary)';
          });
          counterSpan.addEventListener('mouseleave', () => {
            counterSpan.style.color = 'var(--ifm-color-content-secondary)';
          });

          // Append both spans to the link
          link.appendChild(textSpan);
          link.appendChild(counterSpan);

          link.setAttribute('data-counter-processed', 'true');
        }
      });
    };

    // Process on mount and after a short delay to ensure DOM is ready
    setTimeout(processCounters, 100);

    // Use MutationObserver to process dynamically added items
    const observer = new MutationObserver(() => {
      setTimeout(processCounters, 50);
    });

    const sidebarContainer = document.querySelector('.menu, nav[class*="domainSidebar"]');

    if (sidebarContainer) {
      observer.observe(sidebarContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);
}
