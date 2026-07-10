// src/pages/teacher/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ students: 0, score: 0, announcements: 0, assignments: 0 });
  const [top, setTop] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/students"),
      api.get("/announcements"),
      api.get("/assignments"),
    ]).then(([s, a, as]) => {
      const students = s.data;
      setStats({
        students: students.length,
        score: students.reduce((acc, x) => acc + x.score, 0),
        announcements: a.data.length,
        assignments: as.data.length,
      });
      setTop(students[0] || null);
    }).catch(() => {});
  }, []);

  const StatCard = ({ icon, num, label, gradient }) => (
    <div className="card flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md ${gradient}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-serif font-black text-2xl text-green-900 leading-tight">{num}</div>
        <div className="text-xs text-green-500 truncate mt-0.5">{label}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-serif font-black text-2xl text-green-900 mb-1">
        สวัสดี, {user?.name} 👋
      </h1>
      <p className="text-green-500 text-sm mb-5">ภาพรวมระบบ PimChim+ วันนี้</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon="👥" num={stats.students} label="นักเรียนทั้งหมด" gradient="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard icon="⭐" num={stats.score.toLocaleString()} label="แต้มรวมทั้งหมด" gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
        <StatCard icon="📢" num={stats.announcements} label="ประกาศ" gradient="bg-gradient-to-br from-rose-400 to-pink-600" />
        <StatCard icon="📝" num={stats.assignments} label="งานมอบหมาย" gradient="bg-gradient-to-br from-sky-400 to-indigo-600" />
      </div>

      {top && (
        <div className="card relative overflow-hidden max-w-xs mx-auto text-center">
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-r from-amber-400 to-yellow-500 -mx-5 -mt-5" style={{ width: "calc(100% + 2.5rem)" }} />
          <div className="relative">
            <div className="text-4xl mb-1 drop-shadow">🥇</div>
            <div className="font-serif font-black text-lg text-green-900 mt-2">{top.name}</div>
            <div className="text-sm text-green-500">{top.id} · {top.class}</div>
            <div className="font-serif font-black text-4xl text-green-700 mt-2">{top.score.toLocaleString()}</div>
            <div className="text-xs text-green-400">คะแนนสูงสุด</div>
          </div>
        </div>
      )}
    </div>
  );
}
