// src/pages/TeacherLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useToast } from "../components/ui";
import useT from "../i18n/useT";
import LanguageToggle from "../components/LanguageToggle";

export default function TeacherLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const t = useT("teacherLogin");
  const tc = useT("common");

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      toast(tc("fillAllFields"), "error");
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password, "teacher");
      navigate("/teacher");
    } catch (err) {
      const msg = err.response?.data?.message || tc("genericError");
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageToggle />
          <button onClick={() => navigate("/login/student")}
            style={{ fontFamily: "'Mitr', sans-serif", fontSize: 13, color: "#abbf7c", background: "none", border: "none", cursor: "pointer" }}>
            {t("studentLink")}
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 48px" }}>

        {/* Hero image */}
        <div style={{ width: "100%", maxWidth: 300, marginBottom: 24, borderRadius: 28, overflow: "hidden", border: "2px solid #e5ead2", boxShadow: "0 8px 32px rgba(87,113,47,0.10)", background: "white" }}>
          <img src="/images/logoPim2.png" alt="PimChim+" style={{ width: "100%", display: "block", objectFit: "cover" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 700, fontSize: 30, color: "#232a15", lineHeight: 1.5, margin: 0 }}>
            {t("title")}
          </h1>
          <p style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 400, fontSize: 13, color: "#abbf7c", marginTop: 6 }}>
            {t("subtitle")}
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inputStyle("user")}
            placeholder="username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            onFocus={() => setFocused("user")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey}
            autoComplete="username"
          />
          <input
            type="password"
            style={inputStyle("pass")}
            placeholder="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey}
            autoComplete="current-password"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderRadius: 999, background: "#6f8d3d", color: "white",
              fontFamily: "'Mitr', sans-serif", fontSize: 15, fontWeight: 500,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, boxShadow: "0 4px 16px rgba(111,141,61,0.25)",
              transition: "background 0.15s", marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#57712f"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#6f8d3d"; }}
          >
            <span>{loading ? tc("loggingIn") : tc("login")}</span>
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>

        {/* Info box */}
        <div style={{
          marginTop: 24, padding: "12px 16px", borderRadius: 14,
          background: "white", border: "1.5px solid #e5ead2",
          maxWidth: 300, width: "100%",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#abbf7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p style={{ fontFamily: "'Mitr', sans-serif", fontSize: 12, color: "#abbf7c", margin: 0, lineHeight: 1.7 }}>
            {t("infoLine1")}<br />
            {t("infoLine2")}
          </p>
        </div>

      </div>
    </div>
  );
}