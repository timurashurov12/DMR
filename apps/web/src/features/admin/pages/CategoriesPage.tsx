import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategoriesAdmin,
  fetchMenuTypesAdmin,
  fetchLanguagesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  bulkTranslateCategories,
  translateCategory,
  getTranslateResultMessage,
  type TranslateResult,
} from "@/features/admin/lib/api";
import {
  localeIntersection,
  normalizeLocaleCode,
} from "@/features/admin/lib/locale-intersection";
import { toastBulkTranslateResult } from "@/features/admin/lib/translate-toasts";
import { toast } from "sonner";
import { TranslateModal } from "@/features/admin/components/TranslateModal";
import { TablePagination } from "@/features/admin/components/TablePagination";
import {
  Plus,
  Pencil,
  Languages,
  Trash2,
  SlidersHorizontal,
  X,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type CategoryRow = {
  id: string;
  menuTypeId: string;
  translations: { locale: string; name: string }[];
};
type MenuTypeOption = {
  id: string;
  code: string;
  translations?: { locale: string; name: string }[];
};

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuTypeFilter, setMenuTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"menuType" | "name">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modal, setModal] = useState<"create" | null>(null);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [translateModalItem, setTranslateModalItem] =
    useState<CategoryRow | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTranslateOpen, setBulkTranslateOpen] = useState(false);

  const { data: menuTypes } = useQuery({
    queryKey: ["admin", "menu-types"],
    queryFn: fetchMenuTypesAdmin,
  });
  const { data: list, isLoading } = useQuery({
    queryKey: ["admin", "categories", menuTypeFilter],
    queryFn: () => fetchCategoriesAdmin(menuTypeFilter || undefined),
  });
  const { data: languages = [] } = useQuery({
    queryKey: ["admin", "languages"],
    queryFn: fetchLanguagesAdmin,
  });

  const menuTypesList = menuTypes as MenuTypeOption[] | undefined;

  const selectedRows = useMemo(() => {
    const raw = (list ?? []) as CategoryRow[];
    return raw.filter((r) => selectedIds.has(r.id));
  }, [list, selectedIds]);

  const bulkLocaleIntersection = useMemo(
    () => localeIntersection(selectedRows),
    [selectedRows],
  );

  const canBulkTranslate = useMemo(() => {
    if (selectedRows.length === 0 || languages.length === 0) return false;
    return languages.some(
      (l) => !bulkLocaleIntersection.includes(normalizeLocaleCode(l.code)),
    );
  }, [selectedRows.length, languages, bulkLocaleIntersection]);

  const filteredAndSortedList = useMemo(() => {
    const raw = (list ?? []) as CategoryRow[];
    let filtered = raw;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = raw.filter((item) => {
        const name =
          item.translations?.find((t) => t.locale === "ru")?.name ?? "";
        return name.toLowerCase().includes(q);
      });
    }
    const getTypeName = (menuTypeId: string) =>
      menuTypesList
        ?.find((t) => t.id === menuTypeId)
        ?.translations?.find((t) => t.locale === "ru")?.name ??
      menuTypesList?.find((t) => t.id === menuTypeId)?.code ??
      menuTypeId;
    const getName = (item: CategoryRow) =>
      item.translations?.find((t) => t.locale === "ru")?.name ?? "";
    return [...filtered].sort((a, b) => {
      const va = sortBy === "menuType" ? getTypeName(a.menuTypeId) : getName(a);
      const vb = sortBy === "menuType" ? getTypeName(b.menuTypeId) : getName(b);
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [list, menuTypesList, searchQuery, sortBy, sortDir]);

  const total = filteredAndSortedList.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedList = filteredAndSortedList.slice(start, start + pageSize);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllOnPage = () => {
    const ids = paginatedList.map((i) => i.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const onMenuTypeFilterChange = (v: string) => {
    setMenuTypeFilter(v);
    setPage(1);
  };
  const resetFilters = () => {
    setSearchQuery("");
    setMenuTypeFilter("");
    setSortBy("name");
    setSortDir("asc");
    setPage(1);
  };

  const createMu = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setModal(null);
      toast.success("Категория создана");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось создать категорию"),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setEditing(null);
      toast.success("Изменения сохранены");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось сохранить"),
  });
  const deleteMu = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Категория удалена");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось удалить"),
  });
  const bulkDeleteMu = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteCategories(ids),
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      clearSelection();
      toast.success(`Удалено категорий: ${data.count}`);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось удалить записи"),
  });

  const bulkTranslateMu = useMutation({
    mutationFn: async ({
      ids,
      targetLocales,
    }: {
      ids: string[];
      targetLocales: string[];
    }) =>
      bulkTranslateCategories({
        ids,
        ...(targetLocales.length ? { targetLocales } : {}),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      clearSelection();
      setBulkTranslateOpen(false);
      toastBulkTranslateResult(data, variables.ids.length);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка массового перевода");
    },
  });

  const translateMu = useMutation({
    mutationFn: ({
      id,
      targetLocales,
    }: {
      id: string;
      targetLocales?: string[];
    }) =>
      translateCategory(id, targetLocales?.length ? { targetLocales } : undefined),
    onMutate: ({ id }) => {
      setTranslatingId(id);
    },
    onSuccess: (data: TranslateResult) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success(getTranslateResultMessage(data), { duration: 5000 });
      setTranslateModalItem(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка перевода");
    },
    onSettled: () => setTranslatingId(null),
  });

  useEffect(() => {
    if (!editing?.id || !list) return;
    const arr = (list ?? []) as CategoryRow[];
    const found = arr.find((x) => x.id === editing.id);
    if (found) setEditing(found);
  }, [list, editing?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-stone-400">
        <span className="inline-block w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Загрузка...
      </div>
    );
  }

  const getTypeName = (menuTypeId: string) =>
    menuTypesList
      ?.find((t) => t.id === menuTypeId)
      ?.translations?.find((t) => t.locale === "ru")?.name ??
    menuTypesList?.find((t) => t.id === menuTypeId)?.code ??
    menuTypeId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-stone-100">Категории</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по названию..."
            className="input-dark w-56"
          />
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="btn-secondary"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Фильтры и сортировка
          </button>
          <button onClick={() => setModal("create")} className="btn-primary">
            <Plus className="w-5 h-5" />
            Добавить
          </button>
        </div>
      </div>

      {filterOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40"
              onClick={() => setFilterOpen(false)}
              aria-hidden
            />
            <div className="fixed top-0 right-0 h-screen w-[min(100%,28rem)] max-w-full flex flex-col bg-ayvan-panel border-l border-border shadow-2xl z-50">
              <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-border bg-ayvan-panel">
                <h2 className="text-lg font-semibold text-stone-100 truncate pr-2">
                  Фильтры и сортировка
                </h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="btn-ghost p-2 rounded-lg shrink-0"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                <section>
                  <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-3">
                    Поиск
                  </h3>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Название категории..."
                    className="input-dark"
                  />
                </section>
                <section>
                  <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-3">
                    Фильтры
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-sm text-stone-400">
                      Тип меню
                    </label>
                    <select
                      value={menuTypeFilter}
                      onChange={(e) => onMenuTypeFilterChange(e.target.value)}
                      className="input-dark"
                    >
                      <option value="">Все типы меню</option>
                      {menuTypesList?.map((mt) => (
                        <option key={mt.id} value={mt.id}>
                          {mt.translations?.find((t) => t.locale === "ru")
                            ?.name ?? mt.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-3">
                    Сортировка
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Поле
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as "menuType" | "name");
                          setPage(1);
                        }}
                        className="input-dark"
                      >
                        <option value="name">Название</option>
                        <option value="menuType">Тип меню</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Направление
                      </label>
                      <select
                        value={sortDir}
                        onChange={(e) => {
                          setSortDir(e.target.value as "asc" | "desc");
                          setPage(1);
                        }}
                        className="input-dark"
                      >
                        <option value="asc">По возрастанию</option>
                        <option value="desc">По убыванию</option>
                      </select>
                    </div>
                  </div>
                </section>
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setFilterOpen(false);
                  }}
                  className="btn-secondary w-full"
                >
                  Сбросить всё
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}

      <div className="card overflow-hidden flex flex-col">
        {selectedIds.size > 0 && (
          <div className="shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border bg-ayvan-panel/50">
            <span className="text-sm text-stone-300">
              Выбрано: {selectedIds.size}
            </span>
            <button
              type="button"
              onClick={() => setBulkTranslateOpen(true)}
              disabled={
                !canBulkTranslate ||
                bulkTranslateMu.isPending ||
                bulkDeleteMu.isPending
              }
              className="btn-secondary text-sm py-1.5 inline-flex items-center gap-1.5"
              title={
                !canBulkTranslate
                  ? "Нет языков для перевода (у всех выбранных уже есть все языки)"
                  : undefined
              }
            >
              <Languages className="w-4 h-4" />
              Перевести
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Удалить выбранные записи (${selectedIds.size})?`))
                  bulkDeleteMu.mutate(Array.from(selectedIds));
              }}
              disabled={bulkDeleteMu.isPending || bulkTranslateMu.isPending}
              className="btn-danger text-sm py-1.5"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="btn-ghost text-sm py-1.5"
            >
              Снять выбор
            </button>
          </div>
        )}
        <div className="overflow-auto max-h-[calc(100vh-16rem)] min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-ayvan-panel shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
              <tr className="border-b border-border">
              <th className="w-10 px-2 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedList.length > 0 &&
                    paginatedList.every((i) => selectedIds.has(i.id))
                  }
                  onChange={selectAllOnPage}
                  className="checkbox"
                  title="Выбрать все на странице"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                Тип меню
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                Название
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {paginatedList.map((item) => {
              const typeName = getTypeName(item.menuTypeId);
              const translations = item.translations ?? [];
              return (
                <tr
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`hover:bg-ayvan-panel/50 transition-colors cursor-pointer ${selectedIds.has(item.id) ? "bg-ayvan-accent/8" : ""}`}
                  onClick={() => setEditing(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditing(item);
                    }
                  }}
                  title="Нажмите для редактирования"
                >
                  <td
                    className="w-10 px-2 py-3 align-top"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="checkbox"
                    />
                  </td>
                  <td className="px-4 py-3 text-stone-400 font-mono text-sm">
                    {typeName}
                  </td>
                  <td className="px-4 py-3 max-w-[220px] align-top">
                    <div className="space-y-1.5">
                      {translations.length > 0 ? translations.map((t) => (
                        <div key={t.locale} className="flex items-baseline gap-2">
                          <span className="shrink-0 rounded bg-ayvan-bg-dark border border-border px-1.5 py-0.5 text-xs font-medium text-fg-muted">{t.locale}</span>
                          <span className="text-stone-100 text-sm truncate" title={t.name}>{t.name || '—'}</span>
                        </div>
                      )) : <span className="text-stone-500 text-sm">—</span>}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(item);
                        }}
                        className="btn-ghost text-ayvan-accent hover:bg-ayvan-accent/10"
                        title="Изменить"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTranslateModalItem(item);
                        }}
                        disabled={
                          translatingId != null || bulkTranslateMu.isPending
                        }
                        className="btn-ghost text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                        title={
                          translatingId === item.id
                            ? "Перевод..."
                            : "Перевести на выбранные языки"
                        }
                      >
                        {translatingId === item.id ? (
                          <span className="inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Удалить?")) deleteMu.mutate(item.id);
                        }}
                        className="btn-danger"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
        {total > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            start={start}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={goToPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        )}
      </div>

      {modal === "create" && (
        <CreateCategoryModal
          menuTypes={menuTypesList}
          onClose={() => setModal(null)}
          onSubmit={(body) => createMu.mutate(body)}
          isLoading={createMu.isPending}
        />
      )}
      {editing &&
        createPortal(
          <EditCategoryModal
            initial={editing}
            menuTypes={menuTypesList}
            onClose={() => setEditing(null)}
            onSubmit={(body) => updateMu.mutate({ id: editing.id, body })}
            isLoading={updateMu.isPending}
            onOpenTranslate={() => setTranslateModalItem(editing)}
            isTranslating={translateMu.isPending || bulkTranslateMu.isPending}
          />,
          document.body
        )}
      {translateModalItem &&
        createPortal(
          <TranslateModal
            open
            entityId={translateModalItem.id}
            title="Перевести категорию"
            existingLocales={
              translateModalItem.translations?.map((t: { locale: string }) => t.locale) ?? []
            }
            languages={languages}
            onConfirm={(targetLocales: string[]) =>
              translateMu.mutate({
                id: translateModalItem.id,
                targetLocales,
              })
            }
            onClose={() => setTranslateModalItem(null)}
            isPending={translateMu.isPending || bulkTranslateMu.isPending}
          />,
          document.body
        )}
      {bulkTranslateOpen &&
        selectedRows.length > 0 &&
        createPortal(
          <TranslateModal
            open
            entityId={`bulk-${Array.from(selectedIds).sort().join("-")}`}
            title="Перевести выбранные категории"
            description={`Записей: ${selectedRows.length}. Для каждой записи добавятся переводы на выбранные языки (если их ещё нет).`}
            existingLocales={bulkLocaleIntersection}
            languages={languages}
            onConfirm={(targetLocales: string[]) =>
              bulkTranslateMu.mutate({
                ids: selectedRows.map((r) => r.id),
                targetLocales,
              })
            }
            onClose={() => setBulkTranslateOpen(false)}
            isPending={bulkTranslateMu.isPending}
          />,
          document.body
        )}
    </div>
  );
}

function CreateCategoryModal({
  menuTypes,
  onClose,
  onSubmit,
  isLoading,
}: {
  menuTypes: MenuTypeOption[] | undefined;
  onClose: () => void;
  onSubmit: (body: unknown) => void;
  isLoading: boolean;
}) {
  const [menuTypeId, setMenuTypeId] = useState(menuTypes?.[0]?.id ?? "");
  const [nameRu, setNameRu] = useState("");
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card p-6 max-w-md w-full space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-100">
            Новая категория
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Тип меню
          </label>
          <select
            value={menuTypeId}
            onChange={(e) => setMenuTypeId(e.target.value)}
            className="input-dark"
          >
            {menuTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.translations?.find((x) => x.locale === "ru")?.name ?? t.code}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Название (RU)
          </label>
          <input
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() =>
              onSubmit({
                menuTypeId,
                translations: [{ locale: "ru", name: nameRu }],
              })
            }
            disabled={isLoading}
            className="btn-primary"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

type TranslationEntry = { locale: string; name: string };

function EditCategoryModal({
  initial,
  menuTypes,
  onClose,
  onSubmit,
  isLoading,
  onOpenTranslate,
  isTranslating,
}: {
  initial: CategoryRow;
  menuTypes: MenuTypeOption[] | undefined;
  onClose: () => void;
  onSubmit: (body: unknown) => void;
  isLoading: boolean;
  onOpenTranslate?: () => void;
  isTranslating?: boolean;
}) {
  const initialTranslations = initial.translations ?? [];
  const [translations, setTranslations] = useState<TranslationEntry[]>(
    initialTranslations.length > 0
      ? initialTranslations.map((t) => ({ locale: t.locale, name: t.name ?? "" }))
      : [{ locale: "ru", name: "" }]
  );
  const [activeLocaleIndex, setActiveLocaleIndex] = useState(0);
  const [menuTypeId, setMenuTypeId] = useState(initial.menuTypeId);

  const updateTranslation = (index: number, value: string) => {
    setTranslations((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name: value } : t))
    );
  };

  useEffect(() => {
    const initialTr = initial.translations ?? [];
    setTranslations((prev) => {
      if (initialTr.length <= prev.length) return prev;
      return initialTr.map((t) => ({ locale: t.locale, name: t.name ?? "" }));
    });
  }, [initial.translations.length, initial.id, initial.translations]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 z-50 h-full w-[50vw] min-w-[320px] max-w-full flex flex-col border-l border-border bg-ayvan-panel shadow-2xl offcanvas-slide-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-category-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-6 py-4">
          <h2 id="edit-category-title" className="text-lg font-semibold text-stone-100">
            Изменить категорию
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2 rounded-lg shrink-0" aria-label="Закрыть">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-400">Тип меню</label>
            <select value={menuTypeId} onChange={(e) => setMenuTypeId(e.target.value)} className="input-dark">
              {menuTypes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.translations?.find((x) => x.locale === "ru")?.name ?? t.code}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Переводы</h3>
            <div className="flex flex-wrap items-center gap-1 border-b border-border pb-0">
              {translations.map((t, index) => (
                <button
                  key={t.locale}
                  type="button"
                  onClick={() => setActiveLocaleIndex(index)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                    activeLocaleIndex === index
                      ? "border-ayvan-accent text-ayvan-accent bg-ayvan-panel/80"
                      : "border-transparent text-stone-400 hover:text-stone-300 hover:bg-ayvan-panel/50"
                  }`}
                >
                  {t.locale.toUpperCase()}
                </button>
              ))}
              {onOpenTranslate && (
                <button
                  type="button"
                  onClick={onOpenTranslate}
                  disabled={isTranslating}
                  className="ml-auto px-3 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px border-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50 inline-flex items-center gap-1.5"
                  title={isTranslating ? "Перевод..." : "Перевести на другие языки"}
                >
                  {isTranslating ? (
                    <span className="inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4" />
                  )}
                  Перевести на язык
                </button>
              )}
            </div>
            {translations[activeLocaleIndex] && (() => {
              const t = translations[activeLocaleIndex];
              const index = activeLocaleIndex;
              return (
                <div className="rounded-lg border border-border bg-ayvan-panel/50 p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-400">Название</label>
                    <input
                      value={t.name}
                      onChange={(e) => updateTranslation(index, e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        <div className="shrink-0 flex gap-2 justify-end border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({
                menuTypeId,
                translations: translations.map((t) => ({ locale: t.locale, name: t.name })),
              })
            }
            disabled={isLoading}
            className="btn-primary"
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
