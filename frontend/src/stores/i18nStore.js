import { create } from "zustand";
import { persist } from "zustand/middleware";

const useI18nStore = create(
  persist(
    (set, get) => ({
      lang: "th",
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((s) => ({ lang: s.lang === "th" ? "en" : "th" })),
    }),
    { name: "pimchim-lang" }
  )
);

export default useI18nStore;
