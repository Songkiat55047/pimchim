// src/pages/StudentSignup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/ui";
import useT from "../i18n/useT";
import LanguageToggle from "../components/LanguageToggle";

export default function StudentSignup() {
  const [form, setForm] = useState({ id: "", name: "", class: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const t = useT("studentSignup");
  const tc = useT("common");

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.class || !form.password) { toast(tc("fillAllFields"), "error"); return; }
    if (form.password.length < 6) { toast(tc("passwordMinLength"), "error"); return; }
    if (form.password !== form.confirm) { toast(tc("passwordMismatch"), "error"); return; }
    setLoading(true);
    try {
      await api.post("/auth/register-student", {
        id: form.id, name: form.name, class: form.class, password: form.password,
      });
      toast(t("success"), "success");
      navigate("/login/student");
    } catch (err) {
      toast(err.response?.data?.message || tc("genericError"), "error");
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageToggle />
          <button onClick={() => navigate("/login/teacher")}
            style={{ fontFamily: "'Mitr', sans-serif", fontSize: 13, color: "#abbf7c", background: "none", border: "none", cursor: "pointer" }}>
            {t("teacherLink")}
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 48px" }}>

        <div style={{ textAlign: "center", marginBottom: 24, width: "100%", maxWidth: 320 }}>
          <h1 style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 700, fontSize: 28, color: "#232a15", lineHeight: 1.5, margin: 0 }}>
            {t("title")}
          </h1>
          <p style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 400, fontSize: 13, color: "#abbf7c", marginTop: 6 }}>
            {t("subtitle")}
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inputStyle("id")} placeholder={t("studentIdPlaceholder")}
            value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
            onFocus={() => setFocused("id")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="username" />
          <input style={inputStyle("name")} placeholder={t("namePlaceholder")}
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="name" />
          <input style={inputStyle("class")} placeholder={t("classPlaceholder")}
            value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
            onFocus={() => setFocused("class")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} />
          <input type="password" style={inputStyle("password")} placeholder={tc("minPasswordPlaceholder")}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="new-password" />
          <input type="password" style={inputStyle("confirm")} placeholder={t("confirmPlaceholder")}
            value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
            onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
            onKeyDown={handleKey} autoComplete="new-password" />

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
            <span>{loading ? t("submitting") : t("submitButton")}</span>
            {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </div>

        <button onClick={() => navigate("/login/student")}
          style={{ fontFamily: "'Mitr', sans-serif", fontSize: 12, color: "#abbf7c", background: "none", border: "none", cursor: "pointer", marginTop: 24 }}>
          {t("loginLink")}
        </button>
      </div>
    </div>
  );
}
