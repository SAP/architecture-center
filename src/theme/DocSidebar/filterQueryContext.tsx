import React, { createContext, useContext } from 'react';

const SidebarFilterQueryContext = createContext('');

export const SidebarFilterQueryProvider = SidebarFilterQueryContext.Provider;

export function useSidebarFilterQuery(): string {
  return useContext(SidebarFilterQueryContext);
}

/**
 * Add the active sidebar-filter query to an internal sidebar link without
 * changing the sidebar item's canonical href. Keeping the item itself intact
 * ensures Docusaurus can still compare it with location.pathname to determine
 * the active entry.
 */
export function appendSidebarFilterQuery(href: string, filterQuery: string): string {
  if (!filterQuery || href.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) {
    return href;
  }

  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const hrefWithoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = hrefWithoutHash.indexOf('?');
  const pathname = queryIndex >= 0 ? hrefWithoutHash.slice(0, queryIndex) : hrefWithoutHash;
  const params = new URLSearchParams(queryIndex >= 0 ? hrefWithoutHash.slice(queryIndex + 1) : '');

  new URLSearchParams(filterQuery).forEach((value, key) => params.set(key, value));

  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}${hash}`;
}
