// src/pages/teacher/Profile.jsx
import { useEffect, useRef, useState } from "react";
import api, { BASE_URL } from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import { useToast, Spinner } from "../../components/ui";

export default function TeacherProfile() {
  const { updateUser } = useAuthStore();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ students: 0, announcements: 0, assignments: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cacheBust, setCacheBust] = useState(Date.now());

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => { setProfile(data); setName(data.name); }).catch(() => {});
    Promise.all([api.get("/students"), api.get("/announcements"), api.get("/assignments")])
      .then(([s, a, as]) => setStats({ students: s.data.length, announcements: a.data.length, assignments: as.data.length }))
      .catch(() => {});
  }, []);

  const avatarSrc = profile?.avatarUrl ? `${BASE_URL}${profile.avatarUrl}?v=${cacheBust}` : null;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("กรุณาเลือกไฟล์รูปภาพเท่านั้น", "error");
    if (file.size > 2 * 1024 * 1024) return toast("ไฟล์ต้องมีขนาดไม่เกิน 2MB", "error");

    const fd = new FormData();
    fd.append("avatar", file);
    setUploading(true);
    try {
      const { data } = await api.post("/auth/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile((p) => ({ ...p, avatarUrl: data.avatarUrl }));
      updateUser({ avatarUrl: data.avatarUrl });
      setCacheBust(Date.now());
      toast("อัปโหลดรูปโปรไฟล์สำเร็จ", "success");
    } catch (err) {
      toast(err.response?.data?.message || "อัปโหลดไม่สำเร็จ", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return toast("กรุณากรอกชื่อ", "error");
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", { name });
      setProfile(data);
      updateUser({ name: data.name });
      setEditing(false);
      toast("บันทึกชื่อสำเร็จ", "success");
    } catch (err) {
      toast(err.response?.data?.message || "บันทึกไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  const joined = new Date(profile.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  const StatPill = ({ icon, num, label }) => (
    <div className="flex-1 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="font-serif font-black text-xl text-green-800">{num}</div>
      <div className="text-xs text-green-500">{label}</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif font-black text-2xl text-green-900 mb-1">โปรไฟล์ของฉัน</h1>
      <p className="text-green-500 text-sm mb-5">จัดการข้อมูลบัญชีครู</p>

      {/* Header card */}
      <div className="card relative overflow-hidden mb-4">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-green-700 to-green-500 -mx-5 -mt-5" style={{ width: "calc(100% + 2.5rem)" }} />
        <div className="relative flex flex-col items-center pt-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-4xl">👨‍🏫</span>}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-700 border-2 border-white text-white flex items-center justify-center text-sm shadow hover:bg-green-800 transition-all disabled:opacity-60"
              title="เปลี่ยนรูปโปรไฟล์"
            >
              {uploading ? "…" : "📷"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="mt-3 text-center">
            {editing ? (
              <input
                className="input !w-56 text-center"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="font-serif font-black text-xl text-green-900">{profile.name}</div>
            )}
            <div className="text-sm text-green-500 mt-0.5">@{profile.username}</div>
            <span className="badge-green mt-2 inline-flex">ครู / แอดมิน</span>
          </div>

          <div className="mt-4">
            {editing ? (
              <div className="flex gap-2">
                <button className="btn-primary btn-sm" onClick={handleSaveName} disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button className="btn-secondary btn-sm" onClick={() => { setEditing(false); setName(profile.name); }}>
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ แก้ไขชื่อ</button>
            )}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="card mb-4">
        <div className="font-serif font-bold text-green-900 mb-3">ข้อมูลบัญชี</div>
        <div className="flex items-center justify-between py-2 border-b border-green-50 text-sm">
          <span className="text-green-500">ชื่อผู้ใช้</span>
          <span className="font-semibold text-green-900">{profile.username}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-green-50 text-sm">
          <span className="text-green-500">สิทธิ์การใช้งาน</span>
          <span className="font-semibold text-green-900">ครู / แอดมิน</span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-green-500">เข้าร่วมเมื่อ</span>
          <span className="font-semibold text-green-900">{joined}</span>
        </div>
      </div>

      {/* Quick stats pulled from real database */}
      <div className="card flex">
        <StatPill icon="👥" num={stats.students} label="นักเรียนที่ดูแล" />
        <StatPill icon="📢" num={stats.announcements} label="ประกาศที่สร้าง" />
        <StatPill icon="📝" num={stats.assignments} label="งานที่มอบหมาย" />
      </div>
    </div>
  );
}
