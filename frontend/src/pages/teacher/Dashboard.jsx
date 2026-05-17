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

  const StatCard = ({ icon, num, label, color = "text-green-700" }) => (
    <div className="card hover:-translate-y-1 transition-transform">
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`font-[Nunito] font-black text-3xl ${color}`}>{num}</div>
      <div className="text-sm text-green-400 mt-0.5">{label}</div>
    </div>
  );

  return (
    <div>
      <h1 className="font-[Nunito] font-black text-2xl text-green-900 mb-1">
        สวัสดี, {user?.name} 👋
      </h1>
      <p className="text-green-500 text-sm mb-5">ภาพรวมระบบ PimChim+ วันนี้</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon="👥" num={stats.students} label="นักเรียนทั้งหมด" />
        <StatCard icon="⭐" num={stats.score.toLocaleString()} label="แต้มรวมทั้งหมด" />
        <StatCard icon="📢" num={stats.announcements} label="ประกาศ" />
        <StatCard icon="📝" num={stats.assignments} label="งานมอบหมาย" />
      </div>

      {top && (
        <div className="card text-center max-w-xs mx-auto">
          <div className="text-4xl mb-2">🥇</div>
          <div className="font-[Nunito] font-black text-lg text-green-900">{top.name}</div>
          <div className="text-sm text-green-500">{top.id} · {top.class}</div>
          <div className="font-[Nunito] font-black text-4xl text-green-700 mt-2">{top.score.toLocaleString()}</div>
          <div className="text-xs text-green-400">คะแนนสูงสุด</div>
        </div>
      )}
    </div>
  );
}
