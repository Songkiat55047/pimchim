// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      requirePasswordChange: false,

      login: async (username, password, role) => {
        const res = await axios.post(`${API}/api/auth/login`, { username, password, role });
        const { token, user, requirePasswordChange } = res.data;
        set({ token, user, requirePasswordChange: requirePasswordChange ?? false });
        return res.data;
      },

      changePassword: async (newPassword) => {
        const { token } = get();
        await axios.post(
          `${API}/api/auth/change-password`,
          { newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        set({ requirePasswordChange: false });
      },

      logout: () => {
        set({ token: null, user: null, requirePasswordChange: false });
      },

      updateUser: (patch) => {
        set((s) => ({ user: { ...s.user, ...patch } }));
      },

      isTeacher: () => get().user?.role === "TEACHER",
      isStudent: () => get().user?.role === "STUDENT",
    }),
    {
      name: "pimchim-auth",
      partialize: (s) => ({ token: s.token, user: s.user, requirePasswordChange: s.requirePasswordChange }),
    }
  )
);

export default useAuthStore;
