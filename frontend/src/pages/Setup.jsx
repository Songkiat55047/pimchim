import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/setup", form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800">สร้างบัญชีครูสำเร็จ!</h2>
        <p className="text-gray-500 text-sm">username: <strong>{form.username}</strong></p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700"
        >
          ไปหน้า Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบครั้งแรก</h1>
          <p className="text-gray-500 text-sm mt-1">สร้างบัญชีครูผู้ดูแลระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อครู</label>
            <input
              type="text"
              placeholder="เช่น อาจารย์สมศรี ใจดี"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="เช่น teacher01"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              minLength={6}
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "กำลังสร้าง..." : "สร้างบัญชีครู"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          หน้านี้ใช้ได้ครั้งเดียว — จะถูกปิดหลังสร้างบัญชีแล้ว
        </p>
      </div>
    </div>
  );
}
