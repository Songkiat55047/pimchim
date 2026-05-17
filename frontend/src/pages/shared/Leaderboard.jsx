// src/pages/shared/Leaderboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Empty, Spinner } from "../../components/ui";

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const ranks = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    api.get("/scores/leaderboard")
      .then(({ data }) => setStudents(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-[Nunito] font-black text-2xl text-green-900 mb-4">🏆 อันดับคะแนนสะสม</h1>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800 font-bold">
              <tr>{["อันดับ", "ชื่อ", "ชั้น", "Level", "คะแนน"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="flex justify-center py-8"><Spinner /></div></td></tr>
              ) : !students.length ? (
                <tr><td colSpan={5}><Empty icon="🏆" text="ยังไม่มีข้อมูล" /></td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id} className={`border-t border-green-50 ${i < 3 ? "bg-yellow-50/50" : "hover:bg-green-50/50"}`}>
                  <td className="px-4 py-3 font-[Nunito] font-black text-xl">{i < 3 ? ranks[i] : `#${i + 1}`}</td>
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-green-500">{s.class}</td>
                  <td className="px-4 py-3"><span className="badge-green">Lv.{s.level}</span></td>
                  <td className="px-4 py-3 font-[Nunito] font-black text-xl text-green-700">{s.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
