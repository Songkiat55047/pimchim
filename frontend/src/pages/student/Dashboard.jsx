// src/pages/student/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import { Spinner } from "../../components/ui";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [me, setMe] = useState(null);
  const [history, setHistory] = useState([]);
  const [rank, setRank] = useState("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get(`/scores/${user?.id}/history`),
      api.get("/scores/leaderboard"),
    ]).then(([meRes, histRes, lbRes]) => {
      setMe(meRes.data);
      setHistory(histRes.data.slice(0, 5));
      const pos = lbRes.data.findIndex((s) => s.id === user?.id);
      setRank(pos >= 0 ? pos + 1 : "—");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!me) return null;

  const nextLevelXP = (me.level + 1) * 100;
  const currentLevelXP = me.level * 100;
  const xpPct = Math.min(100, Math.round(((me.score - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

  const fmtDate = (d) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-4">
      {/* Profile hero */}
      <div className="bg-gradient-to-br from-green-900 to-blue-700 rounded-3xl p-6 text-center text-white">
        <div className="text-5xl mb-2">🎓</div>
        <div className="font-[Nunito] font-black text-2xl">{me.name}</div>
        <div className="text-white/60 text-sm">{me.id} · {me.class}</div>
        <div className="mt-3 inline-block bg-yellow-400 text-yellow-900 font-[Nunito] font-black rounded-full px-4 py-1 text-sm">
          ⚡ Level {me.level}
        </div>
        {/* XP bar */}
        <div className="mt-3 max-w-xs mx-auto">
          <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full transition-all duration-700" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="text-xs text-white/60 mt-1">{me.score} XP · เป้าหมาย {nextLevelXP} XP สู่ Lv.{me.level + 1}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "⭐", val: me.score.toLocaleString(), label: "คะแนนสะสม" },
          { icon: "🏆", val: `#${rank}`, label: "อันดับ" },
          { icon: "🎮", val: `Lv.${me.level}`, label: "เลเวล" },
          { icon: "📜", val: history.length, label: "ประวัติล่าสุด" },
        ].map(({ icon, val, label }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-0.5">{icon}</div>
            <div className="font-[Nunito] font-black text-2xl text-green-800">{val}</div>
            <div className="text-xs text-green-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent history */}
      <div className="card">
        <h2 className="font-[Nunito] font-extrabold text-green-900 mb-3">📜 ประวัติล่าสุด</h2>
        {!history.length ? (
          <p className="text-sm text-green-400 text-center py-4">ยังไม่มีประวัติแต้ม</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5">
                <div className={`font-[Nunito] font-black text-lg min-w-[48px] text-center ${h.delta > 0 ? "text-green-700" : "text-red-500"}`}>
                  {h.delta > 0 ? "+" : ""}{h.delta}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{h.description}</div>
                  <div className="text-xs text-green-400">โดย {h.givenBy}</div>
                </div>
                <div className="text-xs text-green-300">{fmtDate(h.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
