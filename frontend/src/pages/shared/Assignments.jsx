// src/pages/shared/Assignments.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner } from "../../components/ui";
import useAuthStore from "../../stores/authStore";
import useT, { useLang } from "../../i18n/useT";

export default function Assignments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const { isTeacher } = useAuthStore();
  const toast = useToast();
  const isT = isTeacher();
  const t = useT("assignments");
  const tc = useT("common");
  const lang = useLang();

  const fetch = async () => {
    try { const { data } = await api.get("/assignments"); setList(data); }
    catch { toast(t("loadFail"), "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.dueDate) return toast(t("fieldsRequired"), "error");
    setSaving(true);
    try {
      await api.post("/assignments", form);
      toast(t("addSuccess"), "success");
      setModal(false); setForm({ title: "", description: "", dueDate: "" }); fetch();
    } catch { toast(tc("genericErrorShort"), "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try { await api.delete(`/assignments/${id}`); toast(t("deleted"), "info"); fetch(); }
    catch { toast(tc("deleteFail"), "error"); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const isOverdue = (d) => new Date(d) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-bold text-2xl text-green-900">{t("title")}</h1>
        {isT && <button onClick={() => setModal(true)} className="btn-primary btn-sm">{t("addButton")}</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !list.length ? (
        <Empty icon="📝" text={t("empty")} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const overdue = isOverdue(a.dueDate);
            return (
              <div key={a.id} className={`card border-l-4 ${overdue ? "border-l-red-400" : "border-l-green-400"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-bold text-green-900">{a.title}</div>
                    {a.description && <div className="text-sm text-green-600 mt-1">{a.description}</div>}
                    <div className="mt-2">
                      <span className={`badge ${overdue ? "badge-red" : "badge-green"}`}>
                        {t("dueLabel", { date: fmtDate(a.dueDate) })} {overdue ? t("overdueSuffix") : ""}
                      </span>
                    </div>
                    <div className="text-xs text-green-400 mt-1">{t("assignedBy", { name: a.createdBy })}</div>
                  </div>
                  {isT && <button onClick={() => handleDelete(a.id)} className="btn-danger btn-sm flex-shrink-0">🗑</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={t("modalTitle")}
        footer={<><button onClick={() => setModal(false)} className="btn-secondary">{tc("cancel")}</button><button onClick={handleAdd} disabled={saving} className="btn-primary">{saving ? tc("saving") : t("submitButton")}</button></>}>
        <div className="mb-3"><label className="label">{t("titleFieldLabel")}</label><input className="input" placeholder={t("titleFieldPlaceholder")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="mb-3"><label className="label">{t("descLabel")}</label><textarea className="input min-h-20 resize-y" placeholder={t("descPlaceholder")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="mb-3"><label className="label">{t("dueDateLabel")}</label><input type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
      </Modal>
    </div>
  );
}
