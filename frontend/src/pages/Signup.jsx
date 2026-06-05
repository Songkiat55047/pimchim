import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        username: form.username,
        password: form.password,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4">
      <div className="absolute top-0 left-0 w-80 h-80 bg-green-200 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-green-500/10 border-2 border-green-100 space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🦕</div>
          <div className="font-[Nunito] font-black text-3xl text-green-800">
            PimChim<span className="text-pink-500">+</span>
          </div>
          <p className="text-green-500 text-xs mt-1">สมัครสมาชิกสำหรับครู</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">ชื่อ-นามสกุล</label>
            <input
              className="input"
              placeholder="เช่น อาจารย์สมศรี ใจดี"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              placeholder="เช่น teacher01"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input
              type="password"
              className="input"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="label">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              className="input"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-green-400 text-xs">
          มีบัญชีแล้ว?{" "}
          <Link to="/login" className="text-indigo-500 font-semibold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
