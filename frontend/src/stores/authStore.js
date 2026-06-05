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
        const res = await api.post("/auth/login", { username, password, role });
        const { token, user, requirePasswordChange } = res.data;
        localStorage.setItem("token", token);
        set({ token, user, requirePasswordChange });
        return { token, user, requirePasswordChange };
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
