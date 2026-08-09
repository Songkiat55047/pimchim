// src/pages/student/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useT, { useLang } from "../../i18n/useT";
import LanguageToggle from "../../components/LanguageToggle";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeColors = {
  "แบบฝึกหัด": { bg: "#e0f2fe", text: "#0369a1" },
  "ทดสอบ":     { bg: "#fef3c7", text: "#92400e" },
  "งาน":       { bg: "#ede9fe", text: "#5b21b6" },
  "รายงาน":    { bg: "#e5ead2", text: "#333f1e" },
  "โครงงาน":   { bg: "#fce7f3", text: "#9d174d" },
};

// ─── Custom hook ──────────────────────────────────────────────────────────────
function useApiFetch(path, deps = []) {
  const { token } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !path) return;
    setLoading(true);
    fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, deps);

  return { data, loading, error };
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingCard() {
  return (
    <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", opacity: 0.6 }}>
      <div style={{ background: "#e5ead2", borderRadius: 8, height: 16, width: "60%", marginBottom: 10 }} />
      <div style={{ background: "#e5ead2", borderRadius: 8, height: 12, width: "40%" }} />
    </div>
  );
}

// ─── Avatar component (ใช้ร่วมกันหลายที่) ────────────────────────────────────
function Avatar({ avatarUrl, size = 72, fontSize = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#e5ead2", border: "3px solid #6f8d3d", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize }}>
      {avatarUrl
        ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : "👦"}
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
function ProfilePage({ profile, token, avatarUrl, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const t = useT("studentDashboard");

  const displayAvatar = preview || avatarUrl;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // local preview ทันที
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);
    setSuccess(false);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch(`${API}/api/students/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      onAvatarUpdate(`${API}${data.avatarUrl}`);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <LoadingCard />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Avatar card */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

        {/* Avatar + edit button */}
        <div style={{ position: "relative" }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#e5ead2", border: "3px solid #6f8d3d", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
            {displayAvatar
              ? <img src={displayAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👦"}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "#57712f", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {uploading
              ? <div style={{ width: 12, height: 12, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            }
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 20, color: "#232a15" }}>{profile.name}</div>
          <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#57712f", marginTop: 4 }}>{profile.class}</div>
        </div>

        {error   && <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#dc2626", background: "#fee2e2", padding: "8px 14px", borderRadius: 99 }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#57712f", background: "#e5ead2", padding: "8px 14px", borderRadius: 99 }}>{t("avatarUploadSuccess")}</div>}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "white", background: "#57712f", border: "none", padding: "10px 24px", borderRadius: 99, cursor: uploading ? "not-allowed" : "pointer", fontWeight: 500, opacity: uploading ? 0.7 : 1 }}>
          {uploading ? t("uploading") : t("changeAvatar")}
        </button>

        <p style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af" }}>{t("avatarHint")}</p>
      </div>

      {/* Info card */}
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 14 }}>{t("infoTitle")}</div>
        {[
          { label: t("fieldId"), value: profile.id },
          { label: t("fieldName"), value: profile.name },
          { label: t("fieldClass"),    value: profile.class },
          { label: t("fieldScore"),   value: t("scoreValue", { score: profile.score }) },
          { label: t("fieldLevel"),        value: `Level ${profile.level}` },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f6ee" : "none" }}>
            <span style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#6b7280" }}>{item.label}</span>
            <span style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#232a15", fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage({ profile, scores, assignments, avatarUrl, onTabChange }) {
  const t = useT("studentDashboard");
  const lang = useLang();
  if (!profile) return <LoadingCard />;

  const scorePct  = Math.round((profile.score / 1000) * 100);
  const targetScore = 900;
  const targetPct = Math.min(100, Math.round((profile.score / targetScore) * 100));
  const stars = Math.min(5, profile.level || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Profile hero */}
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* ✅ คลิกรูปไปหน้า profile */}
          <div onClick={() => onTabChange("profile")} style={{ cursor: "pointer" }}>
            <Avatar avatarUrl={avatarUrl} size={72} fontSize={32} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 18, color: "#232a15" }}>{profile.name}</div>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#57712f", marginTop: 2 }}>{profile.class}</div>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#a3a3a3", marginTop: 2 }}>{t("idPrefix", { id: profile.id })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f4f6ee" }}>
          <span style={{ fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#57712f" }}>{t("fieldLevel")}</span>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ fontSize: 18 }}>{i < stars ? "⭐" : "☆"}</span>
            ))}
          </div>
          <span style={{ fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#6f8d3d", fontWeight: 600, marginLeft: "auto" }}>Level {profile.level}</span>
        </div>
      </div>

      {/* Score summary */}
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 14 }}>{t("scoreSummaryTitle")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: t("totalScoreLabel"), value: profile.score, icon: "⭐", color: "#fef9c3", textColor: "#854d0e" },
            { label: t("targetLabel"),     value: targetScore,   icon: "🎯", color: "#f4f6ee", textColor: "#333f1e" },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 24, color: s.textColor, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: s.textColor, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {[
          { label: t("scoreProgressLabel", { score: profile.score }), pct: scorePct, color: "#6f8d3d" },
          { label: t("targetProgressLabel", { remain: Math.max(0, targetScore - profile.score) }), pct: targetPct, color: "#8ba656" },
        ].map(bar => (
          <div key={bar.label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Mitr',sans-serif", fontSize: 12, color: "#6b7280", marginBottom: 5 }}>
              <span>{bar.label}</span>
              <span style={{ color: bar.color, fontWeight: 600 }}>{bar.pct}%</span>
            </div>
            <div style={{ background: "#e5ead2", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${bar.pct}%`, height: "100%", background: bar.color, borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent scores */}
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 14 }}>{t("recentScoresTitle")}</div>
        {!scores ? <LoadingCard /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scores.slice(0, 3).map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#232a15", fontWeight: 500 }}>{s.description}</div>
                  <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                    {t("scoreMetaBy", { date: new Date(s.createdAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-US"), name: s.givenBy })}
                  </div>
                </div>
                <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 15, color: s.delta > 0 ? "#57712f" : "#dc2626" }}>
                  {s.delta > 0 ? "+" : ""}{s.delta}
                </div>
              </div>
            ))}
            {scores.length === 0 && <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>{t("noScores")}</div>}
          </div>
        )}
      </div>

      {/* Pending assignments */}
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 14 }}>{t("pendingAssignmentsTitle")}</div>
        {!assignments ? <LoadingCard /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assignments.filter(a => new Date(a.dueDate) >= new Date()).slice(0, 3).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fafafa", borderRadius: 12, border: "1px solid #f4f6ee" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#232a15", fontWeight: 500 }}>{a.title}</div>
                  <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#f97316", marginTop: 2 }}>
                    {t("dueWithin", { date: new Date(a.dueDate).toLocaleDateString(lang === "th" ? "th-TH" : "en-US") })}
                  </div>
                </div>
              </div>
            ))}
            {assignments.filter(a => new Date(a.dueDate) >= new Date()).length === 0 && (
              <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>{t("noPendingAssignments")}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ScoresPage ───────────────────────────────────────────────────────────────
function ScoresPage({ scores }) {
  const t = useT("studentDashboard");
  const lang = useLang();
  if (!scores) return <LoadingCard />;
  const total = scores.reduce((s, r) => s + r.delta, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 4 }}>{t("scoresSummaryTitle")}</div>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#57712f", marginBottom: 14 }}>{t("totalRecords", { n: scores.length })}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "#f4f6ee", borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 22, color: "#57712f" }}>{total}</div>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#57712f" }}>{t("totalPointsLabel")}</div>
          </div>
          <div style={{ flex: 1, background: "#fafafa", borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 22, color: "#6b7280" }}>{scores.length}</div>
            <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af" }}>{t("recordsLabel")}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15", marginBottom: 14 }}>{t("scoreHistoryTitle")}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {scores.map((s, i) => (
            <div key={s.id} style={{ padding: "14px 0", borderBottom: i < scores.length - 1 ? "1px solid #f4f6ee" : "none", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#232a15", fontWeight: 500 }}>{s.description}</div>
                <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  {t("scoreMeta", { date: new Date(s.createdAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-US"), name: s.givenBy })}
                </div>
              </div>
              <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 700, fontSize: 18, color: s.delta > 0 ? "#57712f" : "#dc2626" }}>
                {s.delta > 0 ? "+" : ""}{s.delta}
              </div>
            </div>
          ))}
          {scores.length === 0 && (
            <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>{t("noScoreHistory")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AnnouncementsPage ────────────────────────────────────────────────────────
function AnnouncementsPage({ announcements, token }) {
  const t = useT("studentDashboard");
  const lang = useLang();
  if (!announcements) return <LoadingCard />;

  const markRead = async (id) => {
    await fetch(`${API}/api/announcements/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {announcements.length === 0 && (
        <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>{t("noAnnouncements")}</div>
      )}
      {announcements.map(a => (
        <div key={a.id} onClick={() => markRead(a.id)}
          style={{ background: a.isRead ? "white" : "#f4f6ee", borderRadius: 20, padding: 20, border: `1px solid ${a.isRead ? "#e5ead2" : "#abbf7c"}`, boxShadow: "0 2px 12px rgba(87,113,47,0.07)", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {!a.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6f8d3d", flexShrink: 0 }} />}
            <span style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
              {new Date(a.createdAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}
            </span>
          </div>
          <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 15, color: "#232a15", marginBottom: 6 }}>{a.title}</div>
          <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>{a.body}</div>
          <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#9ca3af", marginTop: 8 }}>{t("byLine", { name: a.createdBy })}</div>
        </div>
      ))}
    </div>
  );
}

// ─── AssignmentsPage ──────────────────────────────────────────────────────────
function AssignmentsPage({ assignments }) {
  if (!assignments) return <LoadingCard />;

  const now = new Date();
  const pending = assignments.filter(a => new Date(a.dueDate) >= now);
  const overdue = assignments.filter(a => new Date(a.dueDate) <  now);

  const Item = ({ a, isPending }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isPending ? "#fffbeb" : "#fafafa", borderRadius: 14, border: `1px solid ${isPending ? "#fde68a" : "#e8f5e9"}` }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPending ? "#f97316" : "#9ca3af", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#232a15", fontWeight: 500 }}>{a.title}</div>
        {a.description && <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: "#6b7280", marginTop: 2 }}>{a.description}</div>}
        <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 11, color: isPending ? "#f97316" : "#9ca3af", marginTop: 3 }}>
          {isPending ? "⚡ ส่งภายใน " : "⏰ หมดเวลา "}{new Date(a.dueDate).toLocaleDateString("th-TH")}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
          <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15" }}>งานที่ยังไม่ถึงกำหนด</div>
          <span style={{ background: "#fee2e2", color: "#991b1b", fontFamily: "'Mitr',sans-serif", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, marginLeft: "auto" }}>{pending.length} ชิ้น</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pending.map(a => <Item key={a.id} a={a} isPending />)}
          {pending.length === 0 && <div style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>ไม่มีงานค้าง 🎉</div>}
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e5ead2", boxShadow: "0 2px 12px rgba(87,113,47,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9ca3af" }} />
            <div style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 600, fontSize: 14, color: "#232a15" }}>หมดกำหนดแล้ว</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overdue.map(a => <Item key={a.id} a={a} isPending={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav Icons ────────────────────────────────────────────────────────────────
const NavIcon = ({ tab }) => {
  const icons = {
    home:          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    scores:        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    announcements: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    assignments:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    profile:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[tab] || null;
};

const TAB_IDS = ["home", "scores", "announcements", "assignments", "profile"];
const TAB_KEYS = {
  home: "tabHome",
  scores: "tabScores",
  announcements: "tabAnnouncements",
  assignments: "tabAssignments",
  profile: "tabProfile",
};
const TITLE_KEYS = {
  home: "titleHome",
  scores: "titleScores",
  announcements: "titleAnnouncements",
  assignments: "titleAssignments",
  profile: "titleProfile",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const t = useT("studentDashboard");
  const [activeTab, setActiveTab]   = useState("home");
  const [avatarUrl, setAvatarUrl]   = useState(null); // ✅ state รูป avatar
  const { user, token, logout }     = useAuthStore();
  const navigate = useNavigate();

  const tabs = TAB_IDS.map((id) => ({ id, label: t(TAB_KEYS[id]) }));
  const pageTitles = Object.fromEntries(TAB_IDS.map((id) => [id, t(TITLE_KEYS[id])]));

  const { data: profile }       = useApiFetch("/api/auth/me", [token]);
  const { data: scores }        = useApiFetch(user ? `/api/scores/${user.id}/history` : null, [user?.id]);
  const { data: announcements } = useApiFetch("/api/announcements", [token]);
  const { data: assignments }   = useApiFetch("/api/assignments", [token]);

  // ✅ sync avatar จาก profile ครั้งแรก
  useEffect(() => {
    if (profile?.avatarUrl) setAvatarUrl(`${API}${profile.avatarUrl}`);
  }, [profile]);

  const handleLogout = () => { logout(); navigate("/"); };

  const pageContent = {
    home:          <HomePage profile={profile} scores={scores} assignments={assignments} avatarUrl={avatarUrl} onTabChange={setActiveTab} />,
    scores:        <ScoresPage scores={scores} />,
    announcements: <AnnouncementsPage announcements={announcements} token={token} />,
    assignments:   <AssignmentsPage assignments={assignments} />,
    profile:       <ProfilePage profile={profile} token={token} avatarUrl={avatarUrl} onAvatarUpdate={setAvatarUrl} />, // ✅
  };

  // ✅ Avatar ใน sidebar/header — แสดงรูปจริงถ้ามี
  const SidebarAvatar = () => (
    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
      {avatarUrl
        ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : "👦"}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600&family=Nunito:wght@900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f6ee; }
        .sidebar-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-radius: 12px; border: none; font-family: 'Mitr', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-align: left; }
        .sidebar-btn.active   { background: rgba(255,255,255,0.18); color: white; }
        .sidebar-btn.inactive { background: transparent; color: rgba(255,255,255,0.6); }
        .sidebar-btn.inactive:hover { background: rgba(255,255,255,0.10); color: white; }
        .bottom-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; background: none; border: none; cursor: pointer; font-family: 'Mitr', sans-serif; font-size: 10px; transition: color 0.15s; }
        .desktop-toggle { display: none; }
        @media (min-width: 768px) {
          .layout { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
          .sidebar { display: flex !important; }
          .mobile-header { display: none !important; }
          .bottom-nav { display: none !important; }
          .main-content { padding: 32px 28px; }
          .desktop-toggle { display: inline-flex !important; }
        }
        @media (max-width: 767px) {
          .layout { display: block; }
          .sidebar { display: none !important; }
          .main-content { padding: 16px; padding-bottom: 80px; }
        }
      `}</style>

      <div className="layout" style={{ fontFamily: "'Mitr', sans-serif", background: "#f4f6ee" }}>

        {/* ── Sidebar ── */}
        <div className="sidebar" style={{ flexDirection: "column", background: "#333f1e", padding: "24px 16px", gap: 4, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 22, color: "white", marginBottom: 24, paddingLeft: 8 }}>
            PimChim<span style={{ color: "#57712f" }}>+</span>
          </div>

          {/* Mini profile */}
          <div
            onClick={() => setActiveTab("profile")}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.12)", borderRadius: 14, marginBottom: 20, cursor: "pointer" }}>
            <SidebarAvatar /> {/* ✅ รูปจริง */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.name || user?.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{profile?.class || user?.class}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {tabs.map(tb => (
              <button key={tb.id} className={`sidebar-btn ${activeTab === tb.id ? "active" : "inactive"}`} onClick={() => setActiveTab(tb.id)}>
                <span style={{ opacity: activeTab === tb.id ? 1 : 0.7, display: "flex" }}><NavIcon tab={tb.id} /></span>
                {tb.label}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} style={{ width: "100%", padding: "11px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.2)", background: "none", fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {t("logout")}
          </button>
        </div>

        {/* ── Main ── */}
        <div style={{ position: "relative" }}>
          <LanguageToggle className="desktop-toggle" style={{ position: "absolute", top: 24, right: 28, zIndex: 10 }} />

          {/* Mobile header */}
          <div className="mobile-header" style={{ background: "white", borderBottom: "1px solid #e5ead2", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: "#232a15" }}>PimChim<span style={{ color: "#57712f" }}>+</span></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#232a15" }}>{pageTitles[activeTab]}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LanguageToggle style={{ fontSize: 11, padding: "4px 10px" }} />
              {/* ✅ คลิกรูปใน mobile header ไปหน้า profile */}
              <div onClick={() => setActiveTab("profile")} style={{ cursor: "pointer", width: 32, height: 32, borderRadius: "50%", background: "#e5ead2", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {avatarUrl
                  ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "👦"}
              </div>
            </div>
          </div>

          <div className="main-content">
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Mitr',sans-serif", fontWeight: 700, fontSize: 24, color: "#232a15" }}>{pageTitles[activeTab]}</h1>
              <p style={{ fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "#57712f", marginTop: 2 }}>
                {activeTab === "home"          && t("greeting", { name: profile?.name || user?.name })}
                {activeTab === "scores"        && t("scoresSubtitle", { n: scores?.length || 0 })}
                {activeTab === "announcements" && t("announcementsSubtitle", { n: announcements?.length || 0 })}
                {activeTab === "assignments"   && t("assignmentsSubtitle", { n: assignments?.length || 0 })}
                {activeTab === "profile"       && t("profileSubtitle")}
              </p>
            </div>
            {pageContent[activeTab]}
          </div>
        </div>

        {/* ── Bottom nav (mobile) ── */}
        <div className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5ead2", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {tabs.map(tb => (
            <button key={tb.id} className="bottom-nav-btn" style={{ color: activeTab === tb.id ? "#57712f" : "#9ca3af" }} onClick={() => setActiveTab(tb.id)}>
              <NavIcon tab={tb.id} />
              {tb.label}
              {activeTab === tb.id && <div style={{ width: 4, height: 4, background: "#57712f", borderRadius: "50%" }} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}