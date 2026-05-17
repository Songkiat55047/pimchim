// src/pages/student/Scores.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import { Spinner, Empty } from "../../components/ui";

export default function StudentScores() {
  const { user } = useAuthStore();
  const [me, setMe] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/auth/me"), api.get(`/scores/${user?.id}/history`)])
      .then(([meRes, histRes]) => { setMe(meRes.data); setHistory(histRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="font-[Nunito] font-black text-2xl text-green-900 mb-4">⭐ คะแนนของฉัน</h1>

      {me && (
        <div className="card text-center mb-4">
          <div className="font-[Nunito] font-black text-6xl text-green-700">{me.score.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">คะแนนสะสมทั้งหมด</div>
        </div>
      )}

      <div className="card">
        <h2 className="font-[Nunito] font-extrabold text-green-900 mb-3">📜 ประวัติการได้รับ / หักแต้ม</h2>
        {!history.length ? (
          <Empty icon="📭" text="ยังไม่มีประวัติแต้ม" />
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5">
                <div className={`font-[Nunito] font-black text-xl min-w-[56px] text-center ${h.delta > 0 ? "text-green-700" : "text-red-500"}`}>
                  {h.delta > 0 ? "+" : ""}{h.delta}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-semibold truncate">{h.description}</div>
                  <div className="text-xs text-green-400">โดย {h.givenBy} · {fmtDate(h.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
