import { create } from 'zustand';

export const useSidebarFilterStore = create((set) => ({
  // Technology domains
  techDomains: [] as string[],
  setTechDomains: (techDomains: string[]) => set({ techDomains }),

  // Technology partners
  partners: [] as string[],
  setPartners: (partners: string[]) => set({ partners }),

  // Reset all filters
  resetFilters: () => set({ techDomains: [], partners: [] }),
}));

