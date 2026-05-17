// src/pages/teacher/Scores.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner } from "../../components/ui";
import useAuthStore from "../../stores/authStore";

export default function Scores() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scoreModal, setScoreModal] = useState(null); // { student, dir }
  const [histModal, setHistModal] = useState(null);   // { student, logs }
  const [scoreForm, setScoreForm] = useState({ amount: 10, description: "" });
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/students", { params: { search } });
      setStudents(data);
    } catch { toast("โหลดข้อมูลไม่ได้", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const openScore = (student, dir) => {
    setScoreModal({ student, dir });
    setScoreForm({ amount: 10, description: "" });
  };

  const handleScore = async () => {
    const { amount, description } = scoreForm;
    if (!amount || amount <= 0) return toast("กรุณากรอกจำนวนแต้ม", "error");
    setSaving(true);
    try {
      const delta = scoreModal.dir * parseInt(amount);
      await api.post(`/scores/${scoreModal.student.id}`, { delta, description: description || "—" });
      toast(`${scoreModal.dir > 0 ? "ให้" : "หัก"}แต้ม ${amount} สำเร็จ`, "success");
      setScoreModal(null);
      fetchStudents();
    } catch (err) { toast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  const openHistory = async (student) => {
    try {
      const { data } = await api.get(`/scores/${student.id}/history`);
      setHistory(data);
      setHistModal(student);
    } catch { toast("โหลดประวัติไม่ได้", "error"); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <h1 className="font-[Nunito] font-black text-2xl text-green-900 mb-4">⭐ ให้คะแนนนักเรียน</h1>

      <div className="flex items-center gap-2 bg-white border-2 border-green-100 rounded-full px-4 py-2 mb-4 max-w-sm">
        <span className="text-green-400">🔍</span>
        <input className="flex-1 outline-none text-sm bg-transparent" placeholder="ค้นหานักเรียน..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800 font-bold">
              <tr>{["#", "ชื่อนักเรียน", "ชั้น", "คะแนน", "ให้/หักแต้ม", "ประวัติ"].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="flex justify-center py-8"><Spinner /></div></td></tr>
              ) : !students.length ? (
                <tr><td colSpan={6}><Empty icon="📋" text="ไม่มีนักเรียน" /></td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id} className="border-t border-green-50 hover:bg-green-50/50">
                  <td className="px-4 py-3 text-green-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-green-400">{s.id}</div>
                  </td>
                  <td className="px-4 py-3 text-green-600">{s.class}</td>
                  <td className="px-4 py-3 font-[Nunito] font-black text-green-700 text-xl">{s.score.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openScore(s, -1)} className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-400 text-white font-bold flex items-center justify-center hover:scale-110 transition-transform">−</button>
                      <button onClick={() => openScore(s, 1)} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-green-500 text-white font-bold flex items-center justify-center hover:scale-110 transition-transform">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openHistory(s)} className="btn-secondary btn-sm">📜 ดูประวัติ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score modal */}
      <Modal
        open={!!scoreModal}
        onClose={() => setScoreModal(null)}
        title={`${scoreModal?.dir > 0 ? "➕ ให้แต้ม" : "➖ หักแต้ม"} — ${scoreModal?.student?.name}`}
        footer={<>
          <button onClick={() => setScoreModal(null)} className="btn-secondary">ยกเลิก</button>
          <button onClick={handleScore} disabled={saving} className="btn-primary">{saving ? "กำลังบันทึก..." : "✅ ยืนยัน"}</button>
        </>}
      >
        <div className="mb-3">
          <label className="label">จำนวนแต้ม</label>
          <input type="number" min={1} className="input text-center text-2xl font-[Nunito] font-black" value={scoreForm.amount} onChange={(e) => setScoreForm({ ...scoreForm, amount: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="label">เหตุผล / หมายเหตุ</label>
          <input className="input" placeholder="เช่น ทำแบบฝึกหัดครบ" value={scoreForm.description} onChange={(e) => setScoreForm({ ...scoreForm, description: e.target.value })} />
        </div>
      </Modal>

      {/* History modal */}
      <Modal open={!!histModal} onClose={() => setHistModal(null)} title={`📜 ประวัติแต้ม — ${histModal?.name}`}
        footer={<button onClick={() => setHistModal(null)} className="btn-primary">ปิด</button>}>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {!history.length ? <Empty icon="📭" text="ยังไม่มีประวัติ" /> : history.map((h) => (
            <div key={h.id} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5">
              <div className={`font-[Nunito] font-black text-lg min-w-[50px] text-center ${h.delta > 0 ? "text-green-700" : "text-red-600"}`}>
                {h.delta > 0 ? "+" : ""}{h.delta}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold truncate">{h.description}</div>
                <div className="text-xs text-green-500">โดย {h.givenBy}</div>
              </div>
              <div className="text-xs text-green-400 whitespace-nowrap">{fmtDate(h.createdAt)}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
