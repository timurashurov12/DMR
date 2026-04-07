import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/shared/context/LocaleContext";
import { fetchLanguages } from "@/shared/lib/api";
import { ChevronDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!languages?.length) return null;

  const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 min-h-9 px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm font-medium hover:border-app-accent/45 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Выбрать язык"
      >
        <span className="truncate max-w-28 sm:max-w-32">
          {currentLang.name || currentLang.code}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-app-accent transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-40 w-[max(100%,--spacing(40))] max-w-[calc(100vw-2rem)] py-1 rounded-xl bg-app-panel border border-border shadow-card z-50 overflow-hidden"
          style={{ maxHeight: "min(16rem, 60vh)" }}
        >
          {languages.map((lang) => (
            <li
              key={lang.id}
              role="option"
              aria-selected={locale === lang.code}
            >
              <button
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  locale === lang.code
                    ? "bg-app-accent/15 text-app-accent font-medium"
                    : "text-stone-100 hover:bg-stone-800/80"
                }`}
                onClick={() => {
                  setLocale(lang.code);
                  setOpen(false);
                }}
              >
                {lang.name || lang.code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
