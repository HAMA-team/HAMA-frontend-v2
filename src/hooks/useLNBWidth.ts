import { create } from 'zustand';

interface LNBStore {
  isCollapsed: boolean;
  width: number;
  setCollapsed: (collapsed: boolean) => void;
}

export const useLNBWidth = create<LNBStore>((set) => ({
  isCollapsed: false,
  width: 260,
  setCollapsed: (collapsed) =>
    set({ isCollapsed: collapsed, width: collapsed ? 60 : 260 }),
}));
