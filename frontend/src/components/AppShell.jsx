// src/components/AppShell.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const TEACHER_NAV = [
  { to: "/teacher",              icon: "🏠", label: "หน้าหลัก"         },
  { to: "/teacher/students",     icon: "👥", label: "จัดการนักเรียน"   },
  { to: "/teacher/scores",       icon: "⭐", label: "ให้คะแนน"         },
  { to: "/teacher/leaderboard",  icon: "🏆", label: "อันดับคะแนน"      },
  { to: "/teacher/announcements",icon: "📢", label: "ประกาศ"            },
  { to: "/teacher/assignments",  icon: "📝", label: "งานที่มอบหมาย"    },
];

const STUDENT_NAV = [
  { to: "/student",              icon: "🏠", label: "หน้าหลัก"         },
  { to: "/student/scores",       icon: "⭐", label: "คะแนนของฉัน"      },
  { to: "/student/leaderboard",  icon: "🏆", label: "อันดับ"           },
  { to: "/student/announcements",icon: "📢", label: "ประกาศ"            },
  { to: "/student/assignments",  icon: "📝", label: "งาน"              },
];

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout, isTeacher } = useAuthStore();
  const navigate = useNavigate();
  const nav = isTeacher() ? TEACHER_NAV : STUDENT_NAV;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const Sidebar = () => (
    <aside className="w-60 bg-gradient-to-b from-green-900 to-green-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="font-[Nunito] font-black text-2xl text-white">
          PimChim<span className="text-pink-400">+</span>
        </div>
        <div className="text-white/50 text-xs mt-0.5">ระบบจัดการคะแนน</div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
          {isTeacher() ? "👨‍🏫" : "👨‍🎓"}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
          <div className="text-white/50 text-xs">{isTeacher() ? "ครู / แอดมิน" : `นักเรียน · ${user?.class || ""}`}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 2}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all ${
                isActive
                  ? "bg-white/20 text-white font-bold"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="w-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 rounded-full py-2 text-sm font-medium transition-all">
          🚪 ออกจากระบบ
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
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
        {/* Topbar */}
        <header className="bg-white border-b-2 border-green-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button className="lg:hidden text-green-800 text-xl p-1" onClick={() => setOpen(true)}>☰</button>
          <div className="font-[Nunito] font-extrabold text-green-900">
            PimChim<span className="text-pink-500">+</span>
          </div>
          <div className="flex-1" />
          <NavLink to={isTeacher() ? "/teacher" : "/student/announcements"} className="relative">
            <span className="text-xl">🔔</span>
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
