// src/components/ui.jsx
import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ──────────────── TOAST ────────────────
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const colors = {
    success: "bg-green-800 text-white",
    error: "bg-red-700 text-white",
    info: "bg-blue-700 text-white",
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg animate-fade-in ${colors[t.type]}`}>
            {icons[t.type]} {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// ──────────────── MODAL ────────────────
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="font-[Nunito] font-extrabold text-lg text-green-900 mb-4">{title}</h3>}
        {children}
        {footer && <div className="flex gap-2 justify-end mt-4">{footer}</div>}
      </div>
    </div>
  );
}

// ──────────────── SPINNER ────────────────
export function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className={`${s} border-4 border-green-200 border-t-green-700 rounded-full animate-spin`} />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🦕</div>
        <div className="font-[Nunito] font-black text-2xl text-green-800">PimChim<span className="text-pink-500">+</span></div>
        <div className="text-green-600 text-sm mt-1">กำลังโหลด...</div>
      </div>
    </div>
  );
}

// ──────────────── EMPTY STATE ────────────────
export function Empty({ icon = "📭", text = "ไม่มีข้อมูล" }) {
  return (
    <div className="text-center py-12 text-green-400">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  );
}

// ──────────────── CONFIRM DIALOG ────────────────
export function useConfirm() {
  return (msg) => window.confirm(msg);
}
