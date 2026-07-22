import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileDrawer: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileDrawerOpen: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
}));
