// src/pages/teacher/Students.jsx
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import { Modal, useToast, Empty, Spinner, useClassGroups, ClassTabs, usePagination, Pagination } from "../../components/ui";

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
  const fileRef = useRef();
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      const { data } = await api.get("/students", { params: { search } });
      setStudents(data);
    } catch { toast("โหลดข้อมูลไม่ได้", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search]);

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
    if (!form.id || !form.name || !form.class) return toast("กรุณากรอกข้อมูลให้ครบ", "error");
    setSaving(true);
    try {
      await api.post("/students", form);
      toast("เพิ่มนักเรียนสำเร็จ!", "success");
      setModal(null); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  // ── EDIT ──
  const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, class: s.class, resetPassword: false }); setModal("edit"); };
  const handleEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/students/${editTarget.id}`, form);
      toast("บันทึกสำเร็จ!", "success");
      setModal(null); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm(`ลบนักเรียน ${id} ออกจากระบบ?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast("ลบนักเรียนแล้ว", "info");
      fetchStudents();
    } catch { toast("ลบไม่ได้", "error"); }
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
    if (!importRows.length) return toast("ไม่พบข้อมูล", "error");
    setSaving(true);
    try {
      const blob = new Blob([/* re-use parsed rows as JSON */], { type: "application/json" });
      // Send as multipart upload — reuse the original file
      const fd = new FormData();
      fd.append("file", fileRef.current.files[0]);
      const { data } = await api.post("/students/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast(data.message, "success");
      setModal(null); setImportRows([]); fetchStudents();
    } catch (err) { toast(err.response?.data?.message || "นำเข้าไม่ได้", "error"); }
    finally { setSaving(false); }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["รหัสนักเรียน", "ชื่อ-นามสกุล", "ชั้น/ห้อง"],
      ["STD001", "ตัวอย่าง นักเรียน", "ม.5/1"],
      ["STD002", "ตัวอย่าง สอง", "ม.5/2"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "pimchim_template.xlsx");
  };

  return (
    <div>
      <h1 className="font-serif font-black text-2xl text-green-900 mb-4">👥 จัดการนักเรียน</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border-2 border-green-100 rounded-full px-4 py-2">
          <span className="text-green-400">🔍</span>
          <input className="flex-1 outline-none text-sm bg-transparent" placeholder="ค้นหาชื่อหรือรหัสนักเรียน..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={openAdd} className="btn-primary btn-sm">➕ เพิ่มรายคน</button>
        <button onClick={() => setModal("import")} className="btn-secondary btn-sm">📊 นำเข้า Excel</button>
        <button onClick={downloadTemplate} className="btn-secondary btn-sm">⬇ Template</button>
      </div>

      {/* Class tabs */}
      {!loading && students.length > 0 && (
        <ClassTabs classNames={classNames} groups={groups} active={activeClass} onChange={setActiveClass} total={students.length} />
      )}

      {/* Tables grouped by class */}
      {loading ? (
        <div className="card flex justify-center py-8"><Spinner /></div>
      ) : !students.length ? (
        <div className="card"><Empty icon="👥" text="ยังไม่มีนักเรียน" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleClassNames.map((cls) => (
            <div key={cls} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-b-2 border-green-100">
                <span className="text-lg">🏫</span>
                <span className="font-serif font-black text-green-900">{cls}</span>
                <span className="badge-green">{groups[cls].length} คน</span>
              </div>
              <div className={isAllView ? "overflow-auto max-h-[420px]" : "overflow-x-auto"}>
                <table className="w-full text-sm">
                  <thead className={`bg-green-50/60 text-green-800 font-bold ${isAllView ? "sticky top-0 z-10" : ""}`}>
                    <tr>
                      {["#", "รหัส", "ชื่อ", "คะแนน", "Level", "รหัสผ่าน", "จัดการ"].map((h) => (
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
                        <td className="px-4 py-3 font-serif font-black text-green-700 text-lg">{s.score.toLocaleString()}</td>
                        <td className="px-4 py-3"><span className="badge-green">Lv.{s.level}</span></td>
                        <td className="px-4 py-3">
                          <span className={s.passwordChanged ? "badge-green" : "badge-yellow"}>
                            {s.passwordChanged ? "✅ เปลี่ยนแล้ว" : "⏳ ค่าเริ่มต้น"}
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
      <Modal open={modal === "add"} onClose={() => setModal(null)} title="➕ เพิ่มนักเรียน"
        footer={<><button onClick={() => setModal(null)} className="btn-secondary">ยกเลิก</button><button onClick={handleAdd} disabled={saving} className="btn-primary">{saving ? "กำลังบันทึก..." : "✅ เพิ่ม"}</button></>}>
        {["id:รหัสนักเรียน:text:เช่น STD010", "name:ชื่อ-นามสกุล:text:ชื่อนักเรียน", "class:ชั้น/ห้อง:text:เช่น ม.5/1"].map((f) => {
          const [key, label, type, ph] = f.split(":");
          return (
            <div key={key} className="mb-3">
              <label className="label">{label}</label>
              <input type={type} className="input" placeholder={ph} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          );
        })}
      </Modal>

      {/* Modal: Edit */}
      <Modal open={modal === "edit"} onClose={() => setModal(null)} title={`✏️ แก้ไข — ${editTarget?.id}`}
        footer={<><button onClick={() => setModal(null)} className="btn-secondary">ยกเลิก</button><button onClick={handleEdit} disabled={saving} className="btn-primary">{saving ? "กำลังบันทึก..." : "💾 บันทึก"}</button></>}>
        <div className="mb-3"><label className="label">ชื่อ-นามสกุล</label><input className="input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="mb-3"><label className="label">ชั้น/ห้อง</label><input className="input" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="reset-pw" checked={form.resetPassword || false} onChange={(e) => setForm({ ...form, resetPassword: e.target.checked })} />
          <label htmlFor="reset-pw" className="text-sm text-green-700 cursor-pointer">รีเซ็ตรหัสผ่านกลับเป็นรหัสนักเรียน</label>
        </div>
      </Modal>

      {/* Modal: Import Excel */}
      <Modal open={modal === "import"} onClose={() => { setModal(null); setImportRows([]); }} title="📊 นำเข้าจาก Excel"
        footer={<>
          <button onClick={() => { setModal(null); setImportRows([]); }} className="btn-secondary">ยกเลิก</button>
          {importRows.length > 0 && <button onClick={handleImport} disabled={saving} className="btn-primary">{saving ? "กำลังนำเข้า..." : `✅ นำเข้า ${importRows.length} คน`}</button>}
        </>}>
        <p className="text-sm text-green-600 mb-3 leading-relaxed">
          คอลัมน์ในไฟล์ Excel: <b>A = รหัสนักเรียน | B = ชื่อ-นามสกุล | C = ชั้น/ห้อง</b>
        </p>
        <div
          className="border-2 border-dashed border-green-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-600 hover:bg-green-50 transition-all"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0]); }}
        >
          <div className="text-4xl mb-2">📂</div>
          <div className="text-sm text-green-600">คลิกหรือลากไฟล์ .xlsx มาวางที่นี่</div>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} />
        {importRows.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-green-700 font-semibold mb-2">✅ พบ {importRows.length} รายการ</p>
            <div className="overflow-auto max-h-40 rounded-xl border border-green-100">
              <table className="w-full text-xs">
                <thead className="bg-green-50"><tr><th className="px-3 py-1.5 text-left">รหัส</th><th className="px-3 py-1.5 text-left">ชื่อ</th><th className="px-3 py-1.5 text-left">ชั้น</th></tr></thead>
                <tbody>{importRows.slice(0, 20).map((r) => <tr key={r.id} className="border-t border-green-50"><td className="px-3 py-1">{r.id}</td><td className="px-3 py-1">{r.name}</td><td className="px-3 py-1">{r.class}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
