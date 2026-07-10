// src/pages/StudentLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useToast } from "../components/ui";

export default function StudentLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!form.username || !form.password) { toast("กรุณากรอกข้อมูลให้ครบ", "error"); return; }
    setLoading(true);
    try {
      const data = await login(form.username, form.password, "student");
      if (form.password === form.username || data?.requirePasswordChange) navigate("/change-password");
      else navigate("/student/profile");
    } catch (err) {
      toast(err.response?.data?.message || "รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง", "error");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const inputStyle = (name) => ({
    width: "100%", padding: "13px 20px", borderRadius: 999,
    border: `1.5px solid ${focused === name ? "#8ba656" : "#cbd7a8"}`,
    fontSize: 14, outline: "none", background: "white", color: "#232a15",
    boxSizing: "border-box", fontFamily: "'Mitr', sans-serif",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6ee", fontFamily: "'Mitr', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600&family=Nunito:wght@900&display=swap" rel="stylesheet" />

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: "#232a15" }}>
            PimChim<span style={{ color: "#8ba656" }}>+</span>
          </div>
        </button>
        <button onClick={() => navigate("/login/teacher")}
          style={{ fontFamily: "'Mitr', sans-serif", fontSize: 13, color: "#abbf7c", background: "none", border: "none", cursor: "pointer" }}>
          ครู →
        </button>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 48px" }}>

        <div style={{ width: "100%", maxWidth: 340, marginBottom: 24, borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(87,113,47,0.12)" }}>
          <img src="/images/logoPim2.png" alt="PimChim+" style={{ width: "100%", display: "block" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 24, width: "100%", maxWidth: 300 }}>
          <h1 style={{ fontFamily: "'Noto Serif Thai', serif", fontWeight: 700, fontSize: 28, color: "#232a15", lineHeight: 1.3, margin: 0 }}>
            เข้าสู่ระบบนักเรียน
          </h1>
          <p style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 400, fontSize: 13, color: "#abbf7c", marginTop: 6 }}>
            ใช้รหัสที่ครูให้มาเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inputStyle("username")} placeholder="รหัสนักเรียน เช่น STD001"
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            onFocus={() => setFocused("username")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="username" />
          <input type="password" style={inputStyle("password")} placeholder="รหัสผ่าน"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="current-password" />

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderRadius: 999, background: "#6f8d3d", color: "white",
              fontFamily: "'Mitr', sans-serif", fontSize: 15, fontWeight: 500,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, boxShadow: "0 4px 16px rgba(111,141,61,0.25)",
              transition: "background 0.15s", marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#57712f"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#6f8d3d"; }}>
            <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
            {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>

        <p style={{ fontFamily: "'Mitr', sans-serif", fontSize: 12, color: "#abbf7c", marginTop: 24, textAlign: "center", lineHeight: 1.8 }}>
          เข้าครั้งแรก? ใช้รหัสนักเรียนเป็นรหัสผ่าน<br />
          ไม่มีบัญชี? ติดต่อครูเพื่อ add เข้าระบบ
        </p>
      </div>
    </div>
  );
}