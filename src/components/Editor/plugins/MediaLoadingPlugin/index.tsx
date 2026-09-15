import React, { useEffect, useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BusyIndicator } from '@ui5/webcomponents-react';
import { useEditor } from '../../hooks/useEditor';

export default function MediaLoadingPlugin() {
  const { core } = useEditor();
  const rootsRef = useRef<Map<HTMLElement, Root>>(new Map());
  const updateScheduledRef = useRef(false);

  const updatePlaceholders = useCallback(() => {
    if (!core) return;
    const container = core.getContainer();
    if (!container) return;

    const elements = container.querySelectorAll('.editorMediaPlaceholder');
    const currentElements = new Set<HTMLElement>();

    elements.forEach((el) => {
      const element = el as HTMLElement;
      currentElements.add(element);

      // Skip if already rendered
      if (rootsRef.current.has(element)) return;

      const label = element.getAttribute('data-loading-label') || 'Loading...';
      const root = createRoot(element);
      root.render(<BusyIndicator active size="M" text={label} />);
      rootsRef.current.set(element, root);
    });

    // Clean up removed placeholders - defer unmount to avoid React race condition
    rootsRef.current.forEach((root, element) => {
      if (!currentElements.has(element)) {
        rootsRef.current.delete(element);
        // Defer unmount to next tick to avoid "unmount during render" warning
        setTimeout(() => {
          root.unmount();
        }, 0);
      }
    });
  }, [core]);

  useEffect(() => {
    if (!core) return;

    const container = core.getContainer();
    if (!container) return;

    const scheduleUpdate = () => {
      if (updateScheduledRef.current) return;
      updateScheduledRef.current = true;
      requestAnimationFrame(() => {
        updateScheduledRef.current = false;
        updatePlaceholders();
      });
    };

    // Initial check
    scheduleUpdate();

    // Observe for changes - only childList, not attributes
    const observer = new MutationObserver((mutations) => {
      // Only update if nodes were added/removed, not attribute changes
      const hasNodeChanges = mutations.some(m => m.addedNodes.length > 0 || m.removedNodes.length > 0);
      if (hasNodeChanges) {
        scheduleUpdate();
      }
    });
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      // Cleanup all roots - defer to avoid React race condition
      const roots = Array.from(rootsRef.current.values());
      rootsRef.current.clear();
      setTimeout(() => {
        roots.forEach((root) => root.unmount());
      }, 0);
    };
  }, [core, updatePlaceholders]);

  return null;
}
