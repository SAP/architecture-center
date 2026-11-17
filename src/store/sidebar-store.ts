import { create } from 'zustand';

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
  setTechDomains: (techDomains) => set({ techDomains }),

  partners: [],
  setPartners: (partners) => set({ partners }),

  showArchived: false,
  setShowArchived: (showArchived) => set({ showArchived }),

  showCommunityContent: false,
  setShowCommunityContent: (showCommunityContent) => set({ showCommunityContent }),

  showRecentlyUpdated: false,
  setShowRecentlyUpdated: (showRecentlyUpdated) => set({ showRecentlyUpdated }),

  // Start with all domains collapsed by default
  expandedDomains: [],
  setExpandedDomains: (expandedDomains) => set({ expandedDomains }),

  resetFilters: () => set({ techDomains: [], partners: [], showArchived: false, showCommunityContent: false, showRecentlyUpdated: false, expandedDomains: [] }),
}));
