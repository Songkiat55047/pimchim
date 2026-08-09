// src/pages/LandingPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useT from "../i18n/useT";

export default function LandingPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const t = useT("landing");

  const cards = [
    {
      key: "teacher",
      path: "/login/teacher",
      label: t("teacherLabel"),
      sub: t("teacherSub"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333f1e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      key: "student",
      path: "/login/student",
      label: t("studentLabel"),
      sub: t("studentSub"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333f1e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
  ];

  const cardStyle = (key) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1.5px solid #cbd7a8",
    background: hovered === key ? "#f4f6ee" : "white",
    cursor: "pointer",
    transition: "background 0.15s",
    boxShadow: "0 2px 10px rgba(87,113,47,0.07)",
    textAlign: "left",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6ee", fontFamily: "'Mitr', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600&family=Nunito:wght@900&display=swap" rel="stylesheet" />

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: "#232a15" }}>
          PimChim<span style={{ color: "#8ba656" }}>+</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#abbf7c" }}>{t("tagline")}</div>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 48px" }}>

        {/* Hero */}
        <div style={{ width: "100%", maxWidth: 340, marginBottom: 28, borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(87,113,47,0.12)" }}>
          <img src="/images/logoPim2.png" alt="PimChim+" style={{ width: "100%", display: "block" }} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 700, fontSize: 32, color: "#232a15", lineHeight: 1.5, margin: 0 }}>
            {t("title")}
          </h1>
          <p style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 400, fontSize: 14, color: "#abbf7c", marginTop: 6 }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
          {cards.map(({ key, path, label, sub, icon }) => (
            <button key={key} onClick={() => navigate(path)}
              onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)}
              style={cardStyle(key)}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f4f6ee", border: "1px solid #e5ead2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 600, fontSize: 15, color: "#232a15" }}>{label}</div>
                <div style={{ fontFamily: "'Mitr', sans-serif", fontWeight: 400, fontSize: 12, color: "#abbf7c", marginTop: 2 }}>{sub}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#abbf7c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'Mitr', sans-serif", fontSize: 11, color: "#cbd7a8", marginTop: 36 }}>© 2026 PimChim+</p>
      </div>
    </div>
  );
}