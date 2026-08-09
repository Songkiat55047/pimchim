// src/components/ui.jsx
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import useT from "../i18n/useT";

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
        {title && <h3 className="font-serif font-bold text-lg text-green-900 mb-4">{title}</h3>}
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
  const t = useT("common");
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🦕</div>
        <div className="font-[Nunito] font-black text-2xl text-green-800">PimChim<span className="text-pink-500">+</span></div>
        <div className="text-green-600 text-sm mt-1">{t("loading")}</div>
      </div>
    </div>
  );
}

// ──────────────── EMPTY STATE ────────────────
export function Empty({ icon = "📭", text }) {
  const t = useT("common");
  const displayText = text ?? t("noData");
  return (
    <div className="text-center py-12 text-green-400">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm">{displayText}</div>
    </div>
  );
}

// ──────────────── CONFIRM DIALOG ────────────────
export function useConfirm() {
  return (msg) => window.confirm(msg);
}

// ──────────────── CLASS GROUPING / TABS ────────────────
export function useClassGroups(items, classKey = "class") {
  const t = useT("common");
  const groups = items.reduce((acc, it) => {
    const key = it[classKey] || t("unclassified");
    (acc[key] ||= []).push(it);
    return acc;
  }, {});
  const classNames = Object.keys(groups).sort((a, b) => a.localeCompare(b, "th", { numeric: true }));
  return { groups, classNames };
}

export function ClassTabs({ classNames, groups, active, onChange, total }) {
  const t = useT("common");
  if (!classNames.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button onClick={() => onChange("all")} className={active === "all" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
        {t("all")} <span className="opacity-75">({total})</span>
      </button>
      {classNames.map((cls) => (
        <button key={cls} onClick={() => onChange(cls)} className={active === cls ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
          🏫 {cls} <span className="opacity-75">({groups[cls].length})</span>
        </button>
      ))}
    </div>
  );
}

// ──────────────── PAGINATION ────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function usePagination(total, resetKey) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => { setPage(1); }, [resetKey, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;

  return { page: clampedPage, setPage, pageSize, setPageSize, totalPages, start };
}

export function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange, total }) {
  const t = useT("common");
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-green-100 text-sm">
      <div className="flex items-center gap-2 text-green-600">
        <span>{t("show")}</span>
        <select
          className="border-2 border-green-100 rounded-lg px-2 py-1 text-sm bg-white"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>{t("rows")}</span>
        <span className="text-green-400 whitespace-nowrap">· {start}-{end} {t("of")} {total}</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>{t("prev")}</button>
        {totalPages <= 7
          ? Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => onPageChange(i + 1)} className={page === i + 1 ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
                {i + 1}
              </button>
            ))
          : <span className="px-2 text-green-600">{t("pageOf", { page, total: totalPages })}</span>}
        <button className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>{t("next")}</button>
      </div>
    </div>
  );
}
