// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MOCK_USERS = {
  teacher: { id: "T001", name: "อาจารย์สมศรี ใจดี", role: "TEACHER" },
  student: { id: "STD001", name: "น้องพิมพ์", role: "STUDENT", class: "ม.5/1" },
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      requirePasswordChange: false,

      login: async (username, password, role) => {
        // Mock login — ไม่ต้องการ backend
        await new Promise((r) => setTimeout(r, 400)); // simulate delay
        if (role === "teacher" && username === "teacher01" && password === "1234") {
          const user = MOCK_USERS.teacher;
          set({ token: "mock-token-teacher", user, requirePasswordChange: false });
          return { token: "mock-token-teacher", user, requirePasswordChange: false };
        }
        if (role === "student" && username.toUpperCase() === "STD001") {
          const user = MOCK_USERS.student;
          const isFirstLogin = password === "STD001";
          set({ token: "mock-token-student", user, requirePasswordChange: isFirstLogin });
          return { token: "mock-token-student", user, requirePasswordChange: isFirstLogin };
        }
        throw { response: { data: { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" } } };
      },

      changePassword: async (newPassword) => {
        await new Promise((r) => setTimeout(r, 300));
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