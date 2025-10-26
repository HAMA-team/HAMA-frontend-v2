import { create } from "zustand";

type AppMode = "live" | "demo";

interface AppModeStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useAppModeStore = create<AppModeStore>((set, get) => ({
  mode: (typeof window !== "undefined" && (localStorage.getItem("app_mode") as AppMode)) || "live",
  setMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_mode", mode);
    }
    set({ mode });
  },
  toggleMode: () => {
    const next = get().mode === "live" ? "demo" : "live";
    if (typeof window !== "undefined") {
      localStorage.setItem("app_mode", next);
    }
    set({ mode: next });
  },
}));

