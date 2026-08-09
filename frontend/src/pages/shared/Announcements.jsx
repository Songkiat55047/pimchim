// src/pages/shared/Announcements.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner } from "../../components/ui";
import useAuthStore from "../../stores/authStore";
import useT, { useLang } from "../../i18n/useT";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const { isTeacher } = useAuthStore();
  const toast = useToast();
  const isT = isTeacher();
  const t = useT("announcements");
  const tc = useT("common");
  const lang = useLang();

  const fetch = async () => {
    try { const { data } = await api.get("/announcements"); setList(data); }
    catch { toast(t("loadFail"), "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.body) return toast(tc("fillAllFields"), "error");
    setSaving(true);
    try {
      await api.post("/announcements", form);
      toast(t("addSuccess"), "success");
      setModal(false); setForm({ title: "", body: "" }); fetch();
    } catch { toast(tc("genericErrorShort"), "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try { await api.delete(`/announcements/${id}`); toast(t("deleted"), "info"); fetch(); }
    catch { toast(tc("deleteFail"), "error"); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-bold text-2xl text-green-900">{t("title")}</h1>
        {isT && <button onClick={() => setModal(true)} className="btn-primary btn-sm">{t("addButton")}</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !list.length ? (
        <Empty icon="📭" text={t("empty")} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className={`card border-l-4 ${a.isRead === false ? "border-l-blue-400 bg-blue-50/30" : "border-l-green-400"} relative`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-bold text-green-900 flex items-center gap-2">
                    📌 {a.title}
                    {a.isRead === false && <span className="badge-blue text-xs">{t("newBadge")}</span>}
                  </div>
                  <div className="text-sm text-green-700 mt-1.5 leading-relaxed">{a.body}</div>
                  <div className="text-xs text-green-400 mt-2">📅 {fmtDate(a.createdAt)} · {tc("byLine", { name: a.createdBy })}</div>
                </div>
                {isT && (
                  <button onClick={() => handleDelete(a.id)} className="btn-danger btn-sm flex-shrink-0">🗑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={t("modalTitle")}
        footer={<><button onClick={() => setModal(false)} className="btn-secondary">{tc("cancel")}</button><button onClick={handleAdd} disabled={saving} className="btn-primary">{saving ? t("sending") : t("postButton")}</button></>}>
        <div className="mb-3"><label className="label">{t("titleLabel")}</label><input className="input" placeholder={t("titlePlaceholder")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="mb-3"><label className="label">{t("bodyLabel")}</label><textarea className="input min-h-24 resize-y" placeholder={t("bodyPlaceholder")} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
      </Modal>
    </div>
  );
}
