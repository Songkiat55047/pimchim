import useI18nStore from "../stores/i18nStore";
import translations from "./translations";

export function useLang() {
  return useI18nStore((s) => s.lang);
}

export default function useT(ns) {
  const lang = useI18nStore((s) => s.lang);
  return (key, vars) => {
    const entry = translations[ns]?.[key];
    let str = entry ? (entry[lang] ?? entry.th ?? key) : key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  };
}
