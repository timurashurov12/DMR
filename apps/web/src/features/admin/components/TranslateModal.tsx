import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { normalizeLocaleCode } from "@/features/admin/lib/locale-intersection";

type Language = {
  id: string;
  code: string;
  name: string | null;
  sortOrder: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Подзаголовок (например, для массового действия) */
  description?: string;
  /** Идентификатор сущности — при смене сбрасывается выбор языков */
  entityId?: string;
  existingLocales: string[];
  languages: Language[];
  onConfirm: (targetLocales: string[]) => void;
  isPending: boolean;
};

export function TranslateModal({
  open,
  onClose,
  title,
  description,
  entityId,
  existingLocales,
  languages,
  onConfirm,
  isPending,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const existingNorm = useMemo(
    () => new Set(existingLocales.map(normalizeLocaleCode)),
    [existingLocales],
  );

  const missing = languages.filter(
    (l) => !existingNorm.has(normalizeLocaleCode(l.code)),
  );

  const languagesKey = useMemo(
    () => languages.map((l) => l.code).join("\0"),
    [languages],
  );
  const existingKey = useMemo(
    () => [...existingNorm].sort().join("|"),
    [existingNorm],
  );

  useEffect(() => {
    if (!open) return;
    const codes = languages
      .filter((l) => !existingNorm.has(normalizeLocaleCode(l.code)))
      .map((l) => l.code);
    setSelected(new Set(codes));
  }, [open, entityId, languagesKey, existingKey, languages, existingNorm]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(missing.map((l) => l.code)));
  const selectNone = () => setSelected(new Set());

  const handleConfirm = () => {
    const list = Array.from(selected);
    if (list.length) onConfirm(list);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card p-6 max-w-md w-full space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {description ? (
          <p className="text-sm text-stone-500 -mt-1">{description}</p>
        ) : null}

        {missing.length === 0 ? (
          <p className="text-sm text-stone-400">
            Переводы уже есть для всех языков.
          </p>
        ) : (
          <>
            <p className="text-sm text-stone-400">
              Выберите языки, на которые нужно перевести:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-ayvan-accent hover:underline"
              >
                Выбрать все
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="text-sm text-stone-400 hover:underline"
              >
                Снять выбор
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {missing.map((lang) => (
                <li key={lang.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`translate-${lang.code}`}
                    checked={selected.has(lang.code)}
                    onChange={() => toggle(lang.code)}
                    className="checkbox"
                  />
                  <label
                    htmlFor={`translate-${lang.code}`}
                    className="text-sm text-stone-200 cursor-pointer"
                  >
                    {lang.name ?? lang.code} ({lang.code})
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          {missing.length > 0 && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || selected.size === 0}
              className="btn-primary"
            >
              {isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-2" />
                  Перевод...
                </>
              ) : (
                `Перевести на выбранные (${selected.size})`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
