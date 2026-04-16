import { create } from 'zustand';

// All domain IDs for expand/collapse functionality
const ALL_DOMAIN_IDS = ['ai', 'appdev', 'data', 'integration', 'opsec'];

interface SidebarFilterState {
  techDomains: string[];
  setTechDomains: (techDomains: string[]) => void;

  partners: string[];
  setPartners: (partners: string[]) => void;

  // Expanded domain categories (for collapsible sidebar)
  expandedDomains: string[];
  setExpandedDomains: (domains: string[]) => void;
  toggleDomain: (domainId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

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
  toggleDomain: (domainId) =>
    set((state) => ({
      expandedDomains: state.expandedDomains.includes(domainId)
        ? state.expandedDomains.filter((id) => id !== domainId)
        : [...state.expandedDomains, domainId],
    })),
  expandAll: () => set({ expandedDomains: [...ALL_DOMAIN_IDS] }),
  collapseAll: () => set({ expandedDomains: [] }),

  resetFilters: () => set({ techDomains: [], partners: [], expandedDomains: [] }),
}));
