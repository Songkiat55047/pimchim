// src/pages/teacher/Students.jsx
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner, useClassGroups, ClassTabs, usePagination, Pagination } from "../../components/ui";
import useT from "../../i18n/useT";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeClass, setActiveClass] = useState("all");
  const [modal, setModal] = useState(null); // "add" | "edit" | "import"
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", class: "" });
  const [importRows, setImportRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState([]);
  const [pendingBusyId, setPendingBusyId] = useState(null);
  const fileRef = useRef();
  const toast = useToast();
  const t = useT("teacherStudents");
  const tc = useT("common");

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/students", { params: { search } });
      setStudents(data);
    } catch { toast(tc("loadFail"), "error"); }
    finally { setLoading(false); }
  };

  const fetchPending = async () => {
    try {
      const { data } = await api.get("/students/pending");
      setPending(data);
    } catch { /* non-critical — silently skip if it fails to load */ }
  };

  useEffect(() => { fetchStudents(); }, [search]);
  useEffect(() => { fetchPending(); }, []);

  // ── PENDING REGISTRATIONS ──
  const handleApprove = async (id) => {
    setPendingBusyId(id);
    try {
      await api.post(`/students/${id}/approve`);
      toast(t("approveSuccess"), "success");
      setPending((p) => p.filter((s) => s.id !== id));
      fetchStudents();
    } catch (err) { toast(err.response?.data?.message || t("approveFail"), "error"); }
    finally { setPendingBusyId(null); }
  };

  const handleReject = async (s) => {
    if (!window.confirm(t("rejectConfirm", { name: s.name }))) return;
    setPendingBusyId(s.id);
    try {
      await api.delete(`/students/${s.id}`);
      toast(t("rejectSuccess"), "info");
      setPending((p) => p.filter((x) => x.id !== s.id));
    } catch { toast(tc("deleteFail"), "error"); }
    finally { setPendingBusyId(null); }
  };

  // ── GROUP BY CLASS ──
  const { groups, classNames } = useClassGroups(students);
  const visibleClassNames = activeClass === "all" ? classNames : classNames.filter((c) => c === activeClass);

  useEffect(() => {
    if (activeClass !== "all" && !classNames.includes(activeClass)) setActiveClass("all");
  }, [classNames.join("|")]);

  const isAllView = activeClass === "all";
  const activeGroupStudents = isAllView ? [] : (groups[activeClass] || []);
  const pagination = usePagination(activeGroupStudents.length, activeClass);
  const pagedStudents = isAllView ? [] : activeGroupStudents.slice(pagination.start, pagination.start + pagination.pageSize);

  // ── ADD ──
  const openAdd = () => { setForm({ id: "", name: "", class: "" }); setModal("add"); };
  const handleAdd = async () => {
    if (!form.id || !form.name || !form.class) return toast(tc("fillAllFields"), "error");
    setSaving(true);
    try {
      await api.post("/students", form);
      toast(t("addSuccess"), "success");
      setModal(null); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || tc("genericErrorShort"), "error"); }
    finally { setSaving(false); }
  };

  // ── EDIT ──
  const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, class: s.class, resetPassword: false }); setModal("edit"); };
  const handleEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/students/${editTarget.id}`, form);
      toast(tc("saveSuccess"), "success");
      setModal(null); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || tc("genericErrorShort"), "error"); }
    finally { setSaving(false); }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm", { id }))) return;
    try {
      await api.delete(`/students/${id}`);
      toast(t("deleted"), "info");
      fetchStudents();
    } catch { toast(tc("deleteFail"), "error"); }
  };

  // ── EXCEL IMPORT ──
  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const data = rows
        .filter((r) => { const id = String(r[0] || "").trim(); return id && !/^(รหัส|id|student)/i.test(id); })
        .map((r) => ({ id: String(r[0] || "").trim().toUpperCase(), name: String(r[1] || "").trim(), class: String(r[2] || "").trim() }))
        .filter((r) => r.id && r.name);
      setImportRows(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!importRows.length) return toast(t("noDataFound"), "error");
    setSaving(true);
    try {
      const blob = new Blob([/* re-use parsed rows as JSON */], { type: "application/json" });
      // Send as multipart upload — reuse the original file
      const fd = new FormData();
      fd.append("file", fileRef.current.files[0]);
      const { data } = await api.post("/students/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast(data.message, "success");
      setModal(null); setImportRows([]); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || t("importFail"), "error"); }
    finally { setSaving(false); }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [t("fieldStudentIdLabel"), t("fieldNameLabel"), t("fieldClassLabel")],
      ["STD001", "Example Student 1", "11/1"],
      ["STD002", "Example Student 2", "11/2"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "pimchim_template.xlsx");
  };

  return (
    <div>
      <h1 className="font-serif font-bold text-2xl text-green-900 mb-4">{t("title")}</h1>

      {/* Pending registrations */}
      {pending.length > 0 && (
        <div className="card p-0 overflow-hidden mb-4 border-yellow-200">
          <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border-b-2 border-yellow-100">
            <span className="font-serif font-bold text-yellow-900">{t("pendingTitle")}</span>
            <span className="badge-yellow">{t("pendingCount", { n: pending.length })}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-50/60 text-yellow-900 font-bold">
                <tr>
                  <th className="px-4 py-2.5 text-left whitespace-nowrap">{t("thId")}</th>
                  <th className="px-4 py-2.5 text-left whitespace-nowrap">{t("thName")}</th>
                  <th className="px-4 py-2.5 text-left whitespace-nowrap">{t("thClass")}</th>
                  <th className="px-4 py-2.5 text-left whitespace-nowrap">{t("thActions")}</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((s) => (
                  <tr key={s.id} className="border-t border-yellow-50">
                    <td className="px-4 py-3"><span className="badge-blue">{s.id}</span></td>
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3">{s.class}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => handleApprove(s.id)} disabled={pendingBusyId === s.id} className="btn-primary btn-sm">{t("approve")}</button>
                      <button onClick={() => handleReject(s)} disabled={pendingBusyId === s.id} className="btn-danger btn-sm">{t("reject")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border-2 border-green-100 rounded-full px-4 py-2">
          <span className="text-green-400">🔍</span>
          <input className="flex-1 outline-none text-sm bg-transparent" placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={openAdd} className="btn-primary btn-sm">{t("addOne")}</button>
        <button onClick={() => setModal("import")} className="btn-secondary btn-sm">{t("importExcel")}</button>
        <button onClick={downloadTemplate} className="btn-secondary btn-sm">{t("template")}</button>
      </div>

      {/* Class tabs */}
      {!loading && students.length > 0 && (
        <ClassTabs classNames={classNames} groups={groups} active={activeClass} onChange={setActiveClass} total={students.length} />
      )}

      {/* Tables grouped by class */}
      {loading ? (
        <div className="card flex justify-center py-8"><Spinner /></div>
      ) : !students.length ? (
        <div className="card"><Empty icon="👥" text={t("empty")} /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleClassNames.map((cls) => (
            <div key={cls} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-b-2 border-green-100">
                <span className="text-lg">🏫</span>
                <span className="font-serif font-bold text-green-900">{cls}</span>
                <span className="badge-green">{t("peopleCount", { n: groups[cls].length })}</span>
              </div>
              <div className={isAllView ? "overflow-auto max-h-[420px]" : "overflow-x-auto"}>
                <table className="w-full text-sm">
                  <thead className={`bg-green-50/60 text-green-800 font-bold ${isAllView ? "sticky top-0 z-10" : ""}`}>
                    <tr>
                      {["#", t("thId"), t("thName"), t("thScore"), "Level", t("thPassword"), t("thActions")].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(isAllView ? groups[cls] : pagedStudents).map((s, i) => (
                      <tr key={s.id} className="border-t border-green-50 hover:bg-green-50/50">
                        <td className="px-4 py-3 text-green-400">{isAllView ? i + 1 : pagination.start + i + 1}</td>
                        <td className="px-4 py-3"><span className="badge-blue">{s.id}</span></td>
                        <td className="px-4 py-3 font-semibold">{s.name}</td>
                        <td className="px-4 py-3 font-serif font-bold text-green-700 text-lg">{s.score.toLocaleString()}</td>
                        <td className="px-4 py-3"><span className="badge-green">Lv.{s.level}</span></td>
                        <td className="px-4 py-3">
                          <span className={s.passwordChanged ? "badge-green" : "badge-yellow"}>
                            {s.passwordChanged ? t("pwChanged") : t("pwDefault")}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button onClick={() => openEdit(s)} className="btn-secondary btn-sm">✏️</button>
                          <button onClick={() => handleDelete(s.id)} className="btn-danger btn-sm">🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isAllView && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                  total={activeGroupStudents.length}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add */}
      <Modal open={modal === "add"} onClose={() => setModal(null)} title={t("modalAddTitle")}
        footer={<><button onClick={() => setModal(null)} className="btn-secondary">{tc("cancel")}</button><button onClick={handleAdd} disabled={saving} className="btn-primary">{saving ? tc("saving") : t("addConfirm")}</button></>}>
        {[
          { key: "id", label: t("fieldStudentIdLabel"), type: "text", ph: t("fieldStudentIdPlaceholder") },
          { key: "name", label: t("fieldNameLabel"), type: "text", ph: t("fieldNamePlaceholder") },
          { key: "class", label: t("fieldClassLabel"), type: "text", ph: t("fieldClassPlaceholder") },
        ].map((f) => (
          <div key={f.key} className="mb-3">
            <label className="label">{f.label}</label>
            <input type={f.type} className="input" placeholder={f.ph} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          </div>
        ))}
      </Modal>

      {/* Modal: Edit */}
      <Modal open={modal === "edit"} onClose={() => setModal(null)} title={t("modalEditTitle", { id: editTarget?.id })}
        footer={<><button onClick={() => setModal(null)} className="btn-secondary">{tc("cancel")}</button><button onClick={handleEdit} disabled={saving} className="btn-primary">{saving ? tc("saving") : t("saveWithIcon")}</button></>}>
        <div className="mb-3"><label className="label">{t("fieldNameLabel")}</label><input className="input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="mb-3"><label className="label">{t("fieldClassLabel")}</label><input className="input" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="reset-pw" checked={form.resetPassword || false} onChange={(e) => setForm({ ...form, resetPassword: e.target.checked })} />
          <label htmlFor="reset-pw" className="text-sm text-green-700 cursor-pointer">{t("resetPasswordLabel")}</label>
        </div>
      </Modal>

      {/* Modal: Import Excel */}
      <Modal open={modal === "import"} onClose={() => { setModal(null); setImportRows([]); }} title={t("modalImportTitle")}
        footer={<>
          <button onClick={() => { setModal(null); setImportRows([]); }} className="btn-secondary">{tc("cancel")}</button>
          {importRows.length > 0 && <button onClick={handleImport} disabled={saving} className="btn-primary">{saving ? tc("saving") : t("importConfirm", { n: importRows.length })}</button>}
        </>}>
        <p className="text-sm text-green-600 mb-3 leading-relaxed">
          {t("excelColumnsPrefix")} <b>{t("excelColumnsBold")}</b>
        </p>
        <div
          className="border-2 border-dashed border-green-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]); }}
        >
          <div className="text-4xl mb-2">📂</div>
          <div className="text-sm text-green-600">{t("dropzoneText")}</div>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} />
        {importRows.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-green-700 font-semibold mb-2">{t("foundRows", { n: importRows.length })}</p>
            <div className="overflow-auto max-h-40 rounded-xl border border-green-100">
              <table className="w-full text-xs">
                <thead className="bg-green-50"><tr><th className="px-3 py-1.5 text-left">{t("thId")}</th><th className="px-3 py-1.5 text-left">{t("thName")}</th><th className="px-3 py-1.5 text-left">{t("thClass")}</th></tr></thead>
                <tbody>{importRows.slice(0, 20).map((r) => <tr key={r.id} className="border-t border-green-50"><td className="px-3 py-1">{r.id}</td><td className="px-3 py-1">{r.name}</td><td className="px-3 py-1">{r.class}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
