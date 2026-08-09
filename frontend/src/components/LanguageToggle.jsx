// src/components/LanguageToggle.jsx
import useI18nStore from "../stores/i18nStore";

export default function LanguageToggle({ style, className }) {
  const { lang, toggleLang } = useI18nStore();

  return (
    <button
      onClick={toggleLang}
      className={className}
      style={{
        fontFamily: "'Mitr', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: "#57712f",
        background: "white",
        border: "1.5px solid #cbd7a8",
        borderRadius: 999,
        padding: "5px 12px",
        cursor: "pointer",
        ...style,
      }}
      title={lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
    >
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
