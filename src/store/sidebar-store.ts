import { create } from 'zustand';

interface SidebarFilterState {
  techDomains: string[];
  setTechDomains: (techDomains: string[]) => void;

  partners: string[];
  setPartners: (partners: string[]) => void;

  resetFilters: () => void;
}

interface SidebarContext {
  sidebarContext: any;
  setSidebarContext: (sidebarContext: any) => void;
}

export const useSidebarFilterStore = create<SidebarFilterState>((set) => ({
  techDomains: [],
  setTechDomains: (techDomains) => set({ techDomains }),

  partners: [],
  setPartners: (partners) => set({ partners }),

  resetFilters: () => set({ techDomains: [], partners: [] }),
}));

export const useDocSidebarContext = create<SidebarContext>((set) => ({
  sidebarContext: null,
  setSidebarContext: (sidebarContext) => set({ sidebarContext }),
}));
