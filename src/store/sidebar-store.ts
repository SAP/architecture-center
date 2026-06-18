import { create } from 'zustand';

interface SidebarFilterState {
  techDomains: string[];
  setTechDomains: (techDomains: string[]) => void;

  partners: string[];
  setPartners: (partners: string[]) => void;

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

  // Start with all domains collapsed by default
  expandedDomains: [],
  setExpandedDomains: (expandedDomains) => set({ expandedDomains }),

  resetFilters: () => set({ techDomains: [], partners: [], expandedDomains: [] }),
}));
