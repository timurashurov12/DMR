/** Единый формат кода языка для сравнения (БД / API могут отличаться регистром). */
export function normalizeLocaleCode(code: string): string {
  return code.trim().toLowerCase();
}

/** Локали, которые есть у каждой из выбранных записей (пересечение). Для модалки массового перевода. */
export function localeIntersection<T extends { translations?: { locale: string }[] }>(
  rows: T[],
): string[] {
  if (rows.length === 0) return [];
  const sets = rows.map((r) =>
    new Set((r.translations ?? []).map((t) => normalizeLocaleCode(t.locale))),
  );
  const [first, ...rest] = sets;
  return [...first!].filter((loc) => rest.every((s) => s.has(loc)));
}
