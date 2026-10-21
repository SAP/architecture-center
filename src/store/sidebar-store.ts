import { create } from 'zustand';

// Shallow equality for string arrays. Used to make the array setters below
// idempotent: a setter that always stored a fresh array reference (e.g. from
// `param.split(',')`) would notify subscribers even when the contents were
// unchanged. Combined with memos that depend on these arrays and an effect that
// re-derives them from the URL, that reference churn produced an infinite
// "Maximum update depth exceeded" render loop (e.g. on /docs/ref-arch?partners=nvidia).
const sameStringArray = (a: string[], b: string[]): boolean =>
  a === b || (a.length === b.length && a.every((value, index) => value === b[index]));

interface SidebarFilterState {
  techDomains: string[];
  setTechDomains: (techDomains: string[]) => void;

  partners: string[];
  setPartners: (partners: string[]) => void;

  // Archived filter
  showArchived: boolean;
  setShowArchived: (showArchived: boolean) => void;

  // Community content filter
  showCommunityContent: boolean;
  setShowCommunityContent: (showCommunityContent: boolean) => void;

  // Recently updated filter (last 3 months)
  showRecentlyUpdated: boolean;
  setShowRecentlyUpdated: (showRecentlyUpdated: boolean) => void;

  // Expanded domain categories (for collapsible sidebar)
  expandedDomains: string[];
  setExpandedDomains: (domains: string[]) => void;

  resetFilters: () => void;
}

export const useSidebarFilterStore = create<SidebarFilterState>((set) => ({
  techDomains: [],
  setTechDomains: (techDomains) =>
    set((s) => (sameStringArray(s.techDomains, techDomains) ? s : { techDomains })),

  partners: [],
  setPartners: (partners) =>
    set((s) => (sameStringArray(s.partners, partners) ? s : { partners })),

  showArchived: false,
  setShowArchived: (showArchived) => set({ showArchived }),

  showCommunityContent: false,
  setShowCommunityContent: (showCommunityContent) => set({ showCommunityContent }),

  showRecentlyUpdated: false,
  setShowRecentlyUpdated: (showRecentlyUpdated) => set({ showRecentlyUpdated }),

  // Start with all domains collapsed by default
  expandedDomains: [],
  setExpandedDomains: (expandedDomains) =>
    set((s) => (sameStringArray(s.expandedDomains, expandedDomains) ? s : { expandedDomains })),

  resetFilters: () => set({ techDomains: [], partners: [], showArchived: false, showCommunityContent: false, showRecentlyUpdated: false, expandedDomains: [] }),
}));
