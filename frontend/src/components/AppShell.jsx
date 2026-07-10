// src/components/AppShell.jsx
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { BASE_URL } from "../api/axios";

const NAV = [
  { to: "/teacher",               tab: "home",          label: "หน้าหลัก" },
  { to: "/teacher/students",      tab: "students",      label: "จัดการนักเรียน" },
  { to: "/teacher/scores",        tab: "scores",        label: "ให้คะแนน" },
  { to: "/teacher/analytics",     tab: "analytics",     label: "วิเคราะห์ข้อมูล" },
  { to: "/teacher/leaderboard",   tab: "leaderboard",   label: "อันดับคะแนน" },
  { to: "/teacher/announcements", tab: "announcements", label: "ประกาศ" },
  { to: "/teacher/assignments",   tab: "assignments",   label: "งานที่มอบหมาย" },
];

const PAGE_TITLES = {
  "/teacher": "หน้าหลัก",
  "/teacher/students": "จัดการนักเรียน",
  "/teacher/scores": "ให้คะแนน",
  "/teacher/analytics": "วิเคราะห์ข้อมูล",
  "/teacher/leaderboard": "อันดับคะแนน",
  "/teacher/announcements": "ประกาศ",
  "/teacher/assignments": "งานที่มอบหมาย",
  "/teacher/profile": "โปรไฟล์ของฉัน",
};

const NavIcon = ({ tab }) => {
  const icons = {
    home:          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    students:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    scores:        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    analytics:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
    leaderboard:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88"/></svg>,
    announcements: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    assignments:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    profile:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[tab] || null;
};

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login/teacher");
  }

  const isActive = (to) => (to === "/teacher" ? location.pathname === "/teacher" : location.pathname.startsWith(to));
  const pageTitle = PAGE_TITLES[location.pathname] || "PimChim+";

  const Sidebar = () => (
    <div style={{ display: "flex", flexDirection: "column", background: "#333f1e", padding: "24px 16px", gap: 4, height: "100%", overflowY: "auto" }}>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 22, color: "white", marginBottom: 24, paddingLeft: 8 }}>
        PimChim<span style={{ color: "#8ba656" }}>+</span>
      </div>

      <NavLink
        to="/teacher/profile"
        onClick={() => setOpen(false)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.12)", borderRadius: 14, marginBottom: 20, textDecoration: "none" }}
      >
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {user?.avatarUrl
            ? <img src={`${BASE_URL}${user.avatarUrl}`} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "👨‍🏫"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>ครู / แอดมิน</div>
        </div>
      </NavLink>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV.map((item) => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/teacher"}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 12,
                fontFamily: "'Mitr',sans-serif", fontSize: 14, fontWeight: 500, textDecoration: "none",
                background: active ? "rgba(255,255,255,0.18)" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.65)",
              }}
            >
              <span style={{ display: "flex", opacity: active ? 1 : 0.85 }}><NavIcon tab={item.tab} /></span>
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        style={{ width: "100%", padding: "11px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.2)", background: "none", fontFamily: "'Mitr',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}
      >
        <NavIcon tab="logout" />
        ออกจากระบบ
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#f4f6ee" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay (full nav via hamburger) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header
          className="flex lg:hidden"
          style={{ background: "white", borderBottom: "1px solid #e5ead2", padding: "16px 20px", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}
        >
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "#333f1e", fontSize: 20, padding: 0, cursor: "pointer" }}>☰</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#232a15" }}>{pageTitle}</div>
          <NavLink to="/teacher/profile" style={{ width: 32, height: 32, borderRadius: "50%", background: "#e5ead2", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {user?.avatarUrl
              ? <img src={`${BASE_URL}${user.avatarUrl}`} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👨‍🏫"}
          </NavLink>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex bg-white border-b-2 border-green-100 px-6 h-14 items-center gap-3 sticky top-0 z-20">
          <div className="font-serif font-extrabold text-green-900">{pageTitle}</div>
          <div className="flex-1" />
          <NavLink to="/teacher" className="relative text-green-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
