// src/pages/ChangePassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useToast } from "../components/ui";

export default function ChangePassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "error");
    if (pw !== pw2) return toast("รหัสผ่านไม่ตรงกัน", "error");
    setLoading(true);
    try {
      await changePassword(pw);
      toast("เปลี่ยนรหัสผ่านสำเร็จ! 🎉", "success");
      navigate("/student");
    } catch (err) {
      toast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border-2 border-green-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="font-[Nunito] font-black text-xl text-green-900">ตั้งรหัสผ่านใหม่</h2>
          <p className="text-green-500 text-sm mt-1">เพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านก่อนใช้งาน</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? "กำลังบันทึก..." : "✅ บันทึกรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
