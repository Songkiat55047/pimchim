import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useT from "../i18n/useT";
import LanguageToggle from "../components/LanguageToggle";

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const t = useT("setup");
  const tc = useT("common");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/setup", form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || tc("genericErrorShort"));
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-4 relative">
        <LanguageToggle style={{ position: "absolute", top: 16, right: 16 }} />
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800">{t("successTitle")}</h2>
        <p className="text-gray-500 text-sm">{t("usernameLabel")}: <strong>{form.username}</strong></p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700"
        >
          {t("goToLogin")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-6 relative">
        <LanguageToggle style={{ position: "absolute", top: 16, right: 16 }} />
        <div className="text-center">
          <div className="text-4xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("nameLabel")}</label>
            <input
              type="text"
              placeholder={t("namePlaceholder")}
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
              placeholder={t("usernamePlaceholder")}
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
              placeholder={tc("minPasswordPlaceholder")}
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
            {loading ? t("creating") : t("createButton")}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          {t("footnote")}
        </p>
      </div>
    </div>
  );
}
