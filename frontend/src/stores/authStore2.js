// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      requirePasswordChange: false,

      login: async (username, password, role) => {
        const { data } = await api.post("/auth/login", { username, password, role });
        localStorage.setItem("token", data.token);
        set({ token: data.token, user: data.user, requirePasswordChange: data.requirePasswordChange });
        return data;
      },

      changePassword: async (newPassword) => {
        await api.post("/auth/change-password", { newPassword });
        set({ requirePasswordChange: false });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null, requirePasswordChange: false });
      },

      isTeacher: () => get().user?.role === "TEACHER",
      isStudent: () => get().user?.role === "STUDENT",
    }),
    { name: "pimchim-auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

export default useAuthStore;
