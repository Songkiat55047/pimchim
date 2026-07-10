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
        navigate(tab === "teacher" ? "/teacher" : "/student/profile");
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

  const isStudent = tab === "student";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-500"
      style={{
        background: isStudent
          ? "linear-gradient(135deg, #fde8f5 0%, #e8f0ff 50%, #e0faf0 100%)"
          : "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f0fdf4 100%)",
      }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        style={{ background: isStudent ? "#f9a8d4" : "#86efac" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3 transition-all duration-500"
        style={{ background: isStudent ? "#c4b5fd" : "#93c5fd" }}
      />

      <div
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl border-2 transition-all duration-500 overflow-hidden"
        style={{
          borderColor: isStudent ? "#f0abfc" : "#bbf7d0",
          boxShadow: isStudent
            ? "0 25px 50px -12px rgba(216, 90, 180, 0.15)"
            : "0 25px 50px -12px rgba(34, 197, 94, 0.10)",
          padding: isStudent ? "0 0 1.5rem" : "2rem",
        }}
      >
        {/* Student: hero image at top */}
        {isStudent && (
          <div
            className="w-full relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)",
              paddingBottom: "0.5rem",
            }}
          >
            {/* Decorative stars */}
            <div className="absolute top-3 right-4 text-yellow-300 text-2xl select-none">★</div>
            <div className="absolute top-8 left-6 text-pink-300 text-lg select-none">✦</div>
            <div className="absolute bottom-4 right-10 text-purple-300 text-sm select-none">✦</div>

            <img
              src="/images/logoPim2.png"
              alt="PimChim+ Teacher"
              className="w-full object-contain"
              style={{ maxHeight: "200px", objectPosition: "center top" }}
            />
          </div>
        )}

        {/* Teacher: old avatar style */}
        {!isStudent && (
          <div className="text-center mb-6">
            <div className="login-avatar mx-auto mb-3">
              <img
                src="/assets/teacher-logo.png"
                alt="Teacher"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
            <div className="font-[Nunito] font-black text-3xl text-green-800">
              PimChim<span className="text-pink-500">+</span>
            </div>
            <div className="text-green-500 text-xs mt-1">สะสมแต้ม โชว์ความเก่ง ของนักเรียน</div>
          </div>
        )}

        {/* Student header below image */}
        {isStudent && (
          <div className="text-center mt-2 mb-4 px-6">
            <div className="font-[Nunito] font-black text-3xl" style={{ color: "#7c3aed" }}>
              PimChim<span style={{ color: "#ec4899" }}>+</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#a855f7" }}>
              🌟 ยินดีต้อนรับนักเรียนทุกคน!
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div
          className="flex rounded-full p-1 mb-5 gap-1 mx-6"
          style={{ background: isStudent ? "#f5f3ff" : "#f0fdf4" }}
        >
          {[["teacher", "👨‍🏫 ครู / แอดมิน"], ["student", "👨‍🎓 นักเรียน"]].map(([t, label]) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                tab === t
                  ? {
                      background: "white",
                      color: isStudent ? "#7c3aed" : "#166534",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }
                  : { color: isStudent ? "#c084fc" : "#4ade80" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="px-6 space-y-4">
          <div>
            <label
              className="label"
              style={{ color: isStudent ? "#7c3aed" : undefined }}
            >
              {tab === "teacher" ? "ชื่อผู้ใช้" : "รหัสนักเรียน"}
            </label>
            <input
              className="input"
              style={
                isStudent
                  ? { borderColor: "#d8b4fe", outlineColor: "#a855f7" }
                  : {}
              }
              placeholder={tab === "teacher" ? "username" : "เช่น STD001"}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label
              className="label"
              style={{ color: isStudent ? "#7c3aed" : undefined }}
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              className="input"
              style={
                isStudent
                  ? { borderColor: "#d8b4fe", outlineColor: "#a855f7" }
                  : {}
              }
              placeholder={tab === "student" ? "รหัสผ่านเริ่มต้น = รหัสนักเรียน" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-base text-white transition-all active:scale-95"
            style={{
              background: isStudent
                ? "linear-gradient(135deg, #a855f7, #ec4899)"
                : "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: isStudent
                ? "0 4px 15px rgba(168, 85, 247, 0.35)"
                : "0 4px 15px rgba(34, 197, 94, 0.35)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : isStudent ? "🌟 เข้าสู่ระบบ" : "🔑 เข้าสู่ระบบ"}
          </button>
        </div>

        <p
          className="text-center text-xs mt-4 px-6"
          style={{ color: isStudent ? "#c084fc" : "#4ade80" }}
        >
          Demo: ครู → teacher01 / 1234 | นักเรียน → STD001
        </p>
      </div>
    </div>
  );
}