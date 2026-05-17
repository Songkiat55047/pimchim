// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useToast } from "../components/ui";

export default function Login() {
  const [tab, setTab] = useState("teacher");
  const [form, setForm] = useState({ username: "teacher01", password: "1234" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.username, form.password, tab);
      if (data.requirePasswordChange) {
        navigate("/change-password");
      } else {
        navigate(tab === "teacher" ? "/teacher" : "/student");
      }
    } catch (err) {
      toast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  };

  function switchTab(t) {
    setTab(t);
    setForm(t === "teacher"
      ? { username: "teacher01", password: "1234" }
      : { username: "", password: "" }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-green-200 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-green-500/10 border-2 border-green-100">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🦕</div>
          <div className="font-[Nunito] font-black text-3xl text-green-800">
            PimChim<span className="text-pink-500">+</span>
          </div>
          <div className="text-green-500 text-xs mt-1">สะสมแต้ม โชว์ความเก่ง ของนักเรียน</div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-green-50 rounded-full p-1 mb-5 gap-1">
          {[["teacher", "👨‍🏫 ครู / แอดมิน"], ["student", "👨‍🎓 นักเรียน"]].map(([t, label]) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-green-800 shadow-sm" : "text-green-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{tab === "teacher" ? "ชื่อผู้ใช้" : "รหัสนักเรียน"}</label>
            <input
              className="input"
              placeholder={tab === "teacher" ? "username" : "เช่น STD001"}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input
              type="password"
              className="input"
              placeholder={tab === "student" ? "รหัสผ่านเริ่มต้น = รหัสนักเรียน" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? "กำลังเข้าสู่ระบบ..." : "🔑 เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center text-green-400 text-xs mt-4">
          Demo: ครู → teacher01 / 1234 | นักเรียน → STD001
        </p>
      </div>
    </div>
  );
}
