// src/pages/shared/Announcements.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner } from "../../components/ui";
import useAuthStore from "../../stores/authStore";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const { isTeacher } = useAuthStore();
  const toast = useToast();
  const isT = isTeacher();

  const fetch = async () => {
    try { const { data } = await api.get("/announcements"); setList(data); }
    catch { toast("โหลดประกาศไม่ได้", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.body) return toast("กรุณากรอกข้อมูลให้ครบ", "error");
    setSaving(true);
    try {
      await api.post("/announcements", form);
      toast("เพิ่มประกาศสำเร็จ!", "success");
      setModal(false); setForm({ title: "", body: "" }); fetch();
    } catch { toast("เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ลบประกาศนี้?")) return;
    try { await api.delete(`/announcements/${id}`); toast("ลบประกาศแล้ว", "info"); fetch(); }
    catch { toast("ลบไม่ได้", "error"); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-black text-2xl text-green-900">📢 ประกาศ</h1>
        {isT && <button onClick={() => setModal(true)} className="btn-primary btn-sm">📢 เพิ่มประกาศ</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !list.length ? (
        <Empty icon="📭" text="ยังไม่มีประกาศ" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className={`card border-l-4 ${a.isRead === false ? "border-l-blue-400 bg-blue-50/30" : "border-l-green-400"} relative`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-bold text-green-900 flex items-center gap-2">
                    📌 {a.title}
                    {a.isRead === false && <span className="badge-blue text-xs">ใหม่</span>}
                  </div>
                  <div className="text-sm text-green-700 mt-1.5 leading-relaxed">{a.body}</div>
                  <div className="text-xs text-green-400 mt-2">📅 {fmtDate(a.createdAt)} · โดย {a.createdBy}</div>
                </div>
                {isT && (
                  <button onClick={() => handleDelete(a.id)} className="btn-danger btn-sm flex-shrink-0">🗑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="📢 เพิ่มประกาศใหม่"
        footer={<><button onClick={() => setModal(false)} className="btn-secondary">ยกเลิก</button><button onClick={handleAdd} disabled={saving} className="btn-primary">{saving ? "กำลังส่ง..." : "📢 ประกาศ"}</button></>}>
        <div className="mb-3"><label className="label">หัวข้อ</label><input className="input" placeholder="หัวข้อประกาศ" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="mb-3"><label className="label">เนื้อหา</label><textarea className="input min-h-24 resize-y" placeholder="รายละเอียด..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
      </Modal>
    </div>
  );
}
