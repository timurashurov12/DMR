import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMenuItemsAdmin,
  fetchCategoriesAdmin,
  fetchMenuTypesAdmin,
  fetchLanguagesAdmin,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkUpdateMenuItems,
  bulkDeleteMenuItems,
  bulkTranslateMenuItems,
  translateMenuItem,
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
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type SortField =
  | "name"
  | "category"
  | "menuType"
  | "price"
  | "weightOrVolume"
  | "isActive";
type SortDir = "asc" | "desc";
type ActiveFilter = "" | "active" | "inactive";

const SORT_FIELD_LABELS: Record<SortField, string> = {
  name: "Название",
  category: "Категория",
  menuType: "Тип меню",
  price: "Цена",
  weightOrVolume: "Вес/объём",
  isActive: "Активно",
};

type MenuItemRow = {
  id: string;
  categoryId: string;
  price: number;
  weightOrVolume?: string | null;
  sortOrder: number;
  isActive: boolean;
  imagePath?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

export function MenuItemsPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [menuTypeFilter, setMenuTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modal, setModal] = useState<"create" | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [translateModalItem, setTranslateModalItem] =
    useState<MenuItemRow | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryModal, setBulkCategoryModal] = useState(false);
  const [bulkTranslateOpen, setBulkTranslateOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => fetchCategoriesAdmin(),
  });

  const { data: menuTypes } = useQuery({
    queryKey: ["admin", "menu-types"],
    queryFn: fetchMenuTypesAdmin,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ["admin", "menu-items", categoryFilter],
    queryFn: () => fetchMenuItemsAdmin(categoryFilter || undefined),
  });
  const { data: languages = [] } = useQuery({
    queryKey: ["admin", "languages"],
    queryFn: fetchLanguagesAdmin,
  });

  const categoriesList = categories as
    | { id: string; menuTypeId: string; translations: { name: string }[] }[]
    | undefined;
  const menuTypesList = menuTypes as
    | {
        id: string;
        code: string;
        translations: { locale: string; name: string }[];
      }[]
    | undefined;

  const selectedRows = useMemo(() => {
    const raw = (list ?? []) as MenuItemRow[];
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
    const raw = (list ?? []) as MenuItemRow[];
    let filtered = raw;
    if (activeFilter === "active")
      filtered = raw.filter((i) => i.isActive !== false);
    else if (activeFilter === "inactive")
      filtered = raw.filter((i) => i.isActive === false);
    const getName = (item: MenuItemRow) =>
      item.translations?.find((t) => t.locale === "ru")?.name ?? "";
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((i) => getName(i).toLowerCase().includes(q));
    }
    if (menuTypeFilter) {
      const categoryIdsOfType = new Set(
        categoriesList
          ?.filter((c) => c.menuTypeId === menuTypeFilter)
          .map((c) => c.id) ?? [],
      );
      filtered = filtered.filter((i) => categoryIdsOfType.has(i.categoryId));
    }
    const getCategoryName = (categoryId: string) =>
      categoriesList?.find((c) => c.id === categoryId)?.translations?.[0]
        ?.name ?? "";
    return [...filtered].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (sortBy) {
        case "name":
          va = getName(a);
          vb = getName(b);
          break;
        case "category":
          va = getCategoryName(a.categoryId);
          vb = getCategoryName(b.categoryId);
          break;
        case "menuType": {
          const getMenuTypeName = (categoryId: string) => {
            const cat = categoriesList?.find((c) => c.id === categoryId);
            const mt = cat?.menuTypeId
              ? menuTypesList?.find((m) => m.id === cat.menuTypeId)
              : undefined;
            return (
              mt?.translations?.find((t) => t.locale === "ru")?.name ??
              mt?.code ??
              ""
            );
          };
          va = getMenuTypeName(a.categoryId);
          vb = getMenuTypeName(b.categoryId);
          break;
        }
        case "price":
          va = Number(a.price);
          vb = Number(b.price);
          break;
        case "weightOrVolume":
          va = a.weightOrVolume ?? "";
          vb = b.weightOrVolume ?? "";
          break;
        case "isActive":
          va = a.isActive !== false ? 1 : 0;
          vb = b.isActive !== false ? 1 : 0;
          break;
        default:
          return 0;
      }
      const cmp =
        typeof va === "string"
          ? va.localeCompare(vb as string)
          : (va as number) - (vb as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [
    list,
    categoriesList,
    menuTypesList,
    menuTypeFilter,
    activeFilter,
    searchQuery,
    sortBy,
    sortDir,
  ]);

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
    const ids = paginatedList.map((i: { id: string }) => i.id);
    const allSelected =
      ids.length > 0 && ids.every((id: string) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id: string) => next.delete(id));
      else ids.forEach((id: string) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const onCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };
  const onMenuTypeFilterChange = (value: string) => {
    setMenuTypeFilter(value);
    setPage(1);
  };
  const resetFiltersAndSort = () => {
    setCategoryFilter("");
    setMenuTypeFilter("");
    setActiveFilter("");
    setSearchQuery("");
    setSortBy("name");
    setSortDir("asc");
    setPage(1);
  };

  const createMu = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      setModal(null);
      toast.success("Блюдо добавлено");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось создать блюдо"),
  });

  const updateMu = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      updateMenuItem(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      setEditing(null);
      toast.success("Изменения сохранены");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось сохранить"),
  });

  const deleteMu = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      toast.success("Блюдо удалено");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось удалить"),
  });

  const translateMu = useMutation({
    mutationFn: ({
      id,
      targetLocales,
    }: {
      id: string;
      targetLocales?: string[];
    }) =>
      translateMenuItem(
        id,
        targetLocales?.length ? { targetLocales } : undefined,
      ),
    onMutate: ({ id }) => {
      setTranslatingId(id);
    },
    onSuccess: (data: TranslateResult) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      toast.success(getTranslateResultMessage(data), { duration: 5000 });
      setTranslateModalItem(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка перевода");
    },
    onSettled: () => setTranslatingId(null),
  });

  const bulkUpdateCategoryMu = useMutation({
    mutationFn: ({
      ids,
      categoryId,
    }: {
      ids: string[];
      categoryId: string;
    }) => bulkUpdateMenuItems({ ids, categoryId }),
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      clearSelection();
      setBulkCategoryModal(false);
      toast.success(`Категория обновлена для ${data.count} блюд`);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось обновить категорию"),
  });
  const bulkSetActiveMu = useMutation({
    mutationFn: ({
      ids,
      isActive,
    }: {
      ids: string[];
      isActive: boolean;
    }) => bulkUpdateMenuItems({ ids, isActive }),
    onSuccess: (data: { count: number }, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      clearSelection();
      toast.success(
        variables.isActive
          ? `Показано на сайте: ${data.count} блюд`
          : `Скрыто: ${data.count} блюд`,
      );
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось обновить видимость"),
  });
  const bulkDeleteMu = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteMenuItems(ids),
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      clearSelection();
      toast.success(`Удалено блюд: ${data.count}`);
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
      bulkTranslateMenuItems({
        ids,
        ...(targetLocales.length ? { targetLocales } : {}),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu-items"] });
      clearSelection();
      setBulkTranslateOpen(false);
      toastBulkTranslateResult(data, variables.ids.length);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка массового перевода");
    },
  });

  useEffect(() => {
    if (!editing?.id || !list) return;
    const arr = (list ?? []) as { id: string }[];
    const found = arr.find((x) => x.id === (editing as { id: string }).id);
    if (found) setEditing(found);
  }, [editing, list]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-stone-400">
        <span className="inline-block w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Загрузка...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-stone-100">Блюда</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Поиск по названию..."
              className="input-dark w-56 pl-9"
            />
          </div>
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

      {/* Offcanvas: фильтры и сортировка — портал в body, чтобы был от верха экрана */}
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
                    Фильтры
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Поиск по названию
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Введите название..."
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
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
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Категория
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => onCategoryFilterChange(e.target.value)}
                        className="input-dark"
                      >
                        <option value="">Все категории</option>
                        {(menuTypeFilter
                          ? categoriesList?.filter(
                              (c) => c.menuTypeId === menuTypeFilter,
                            )
                          : categoriesList
                        )?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.translations?.[0]?.name ?? c.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Статус
                      </label>
                      <select
                        value={activeFilter}
                        onChange={(e) => {
                          setActiveFilter(e.target.value as ActiveFilter);
                          setPage(1);
                        }}
                        className="input-dark"
                      >
                        <option value="">Все</option>
                        <option value="active">Только активные</option>
                        <option value="inactive">Только неактивные</option>
                      </select>
                    </div>
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
                          setSortBy(e.target.value as SortField);
                          setPage(1);
                        }}
                        className="input-dark"
                      >
                        {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map(
                          (key) => (
                            <option key={key} value={key}>
                              {SORT_FIELD_LABELS[key]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Направление
                      </label>
                      <select
                        value={sortDir}
                        onChange={(e) => {
                          setSortDir(e.target.value as SortDir);
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
                    resetFiltersAndSort();
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
              onClick={() => setBulkCategoryModal(true)}
              disabled={
                bulkUpdateCategoryMu.isPending || bulkTranslateMu.isPending
              }
              className="btn-secondary text-sm py-1.5"
            >
              Изменить категорию
            </button>
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
              onClick={() =>
                bulkSetActiveMu.mutate({
                  ids: Array.from(selectedIds),
                  isActive: true,
                })
              }
              disabled={
                bulkSetActiveMu.isPending || bulkTranslateMu.isPending
              }
              className="btn-secondary text-sm py-1.5"
            >
              Сделать активными
            </button>
            <button
              type="button"
              onClick={() =>
                bulkSetActiveMu.mutate({
                  ids: Array.from(selectedIds),
                  isActive: false,
                })
              }
              disabled={
                bulkSetActiveMu.isPending || bulkTranslateMu.isPending
              }
              className="btn-secondary text-sm py-1.5"
            >
              Сделать неактивными
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
        <div className="overflow-auto overflow-x-auto max-h-[calc(100vh-16rem)] min-h-0">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-ayvan-panel shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
              <tr className="border-b border-border">
                <th className="w-10 px-2 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedList.length > 0 &&
                      paginatedList.every((i: { id: string }) =>
                        selectedIds.has(i.id),
                      )
                    }
                    onChange={selectAllOnPage}
                    className="checkbox"
                    title="Выбрать все на странице"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-300 select-none"
                  onClick={() => {
                    setSortBy("name");
                    setSortDir((d) =>
                      sortBy === "name"
                        ? d === "asc"
                          ? "desc"
                          : "asc"
                        : "asc",
                    );
                    setPage(1);
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Название
                    {sortBy === "name" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : null}
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Описание
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-300 select-none"
                  onClick={() => {
                    setSortBy("category");
                    setSortDir((d) =>
                      sortBy === "category"
                        ? d === "asc"
                          ? "desc"
                          : "asc"
                        : "asc",
                    );
                    setPage(1);
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Категория
                    {sortBy === "category" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : null}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-300 select-none"
                  onClick={() => {
                    setSortBy("menuType");
                    setSortDir((d) =>
                      sortBy === "menuType"
                        ? d === "asc"
                          ? "desc"
                          : "asc"
                        : "asc",
                    );
                    setPage(1);
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Тип меню
                    {sortBy === "menuType" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : null}
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Вес/объём
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Локаль
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Активно
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {paginatedList.map(
                (item: {
                  id: string;
                  categoryId: string;
                  price: number;
                  weightOrVolume?: string | null;
                  sortOrder: number;
                  isActive: boolean;
                  imagePath?: string | null;
                  translations: {
                    locale: string;
                    name: string;
                    description?: string | null;
                  }[];
                }) => {
                  const category = categoriesList?.find(
                    (c) => c.id === item.categoryId,
                  );
                  const categoryName =
                    category?.translations?.[0]?.name ?? item.categoryId;
                  const menuType = category?.menuTypeId
                    ? menuTypesList?.find((mt) => mt.id === category.menuTypeId)
                    : undefined;
                  const menuTypeName =
                    menuType?.translations?.find((t) => t.locale === "ru")
                      ?.name ??
                    menuType?.code ??
                    "—";
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
                      <td className="px-4 py-3 max-w-[220px] align-top">
                        <div className="space-y-1.5">
                          {translations.length > 0 ? (
                            translations.map(
                              (t: { locale: string; name: string }) => (
                                <div
                                  key={t.locale}
                                  className="flex items-baseline gap-2"
                                >
                                  <span className="shrink-0 rounded bg-ayvan-bg-dark border border-border px-1.5 py-0.5 text-xs font-medium text-fg-muted">
                                    {t.locale}
                                  </span>
                                  <span
                                    className="text-stone-100 text-sm truncate"
                                    title={t.name}
                                  >
                                    {t.name || "—"}
                                  </span>
                                </div>
                              ),
                            )
                          ) : (
                            <span className="text-stone-500 text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[240px] align-top">
                        <div className="space-y-1.5">
                          {translations.length > 0 ? (
                            translations.map(
                              (t: {
                                locale: string;
                                description?: string | null;
                              }) => (
                                <div
                                  key={t.locale}
                                  className="flex gap-2 text-sm"
                                >
                                  <span className="shrink-0 rounded bg-ayvan-bg-dark border border-border px-1.5 py-0.5 text-xs font-medium text-fg-muted">
                                    {t.locale}
                                  </span>
                                  <span
                                    className="text-stone-400 line-clamp-2 min-w-0"
                                    title={
                                      (t as { description?: string })
                                        .description ?? undefined
                                    }
                                  >
                                    {(t as { description?: string })
                                      .description || "—"}
                                  </span>
                                </div>
                              ),
                            )
                          ) : (
                            <span className="text-stone-500 text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-400">
                        {categoryName}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-sm">
                        {menuTypeName}
                      </td>
                      <td className="px-4 py-3 text-stone-300 tabular-nums">
                        {Number(item.price).toLocaleString("ru-RU")} сум
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-sm">
                        {item.weightOrVolume ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-sm">
                        {item.translations?.map((t) => t.locale).join(", ") ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.isActive !== false
                              ? "text-emerald-400"
                              : "text-stone-500"
                          }
                        >
                          {item.isActive !== false ? "Да" : "Нет"}
                        </span>
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
                              translatingId != null ||
                              bulkTranslateMu.isPending
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
                },
              )}
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
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      {bulkCategoryModal && (
        <BulkChangeCategoryModal
          categories={categoriesList}
          menuTypes={menuTypesList}
          selectedCount={selectedIds.size}
          onConfirm={(categoryId) =>
            bulkUpdateCategoryMu.mutate({
              ids: Array.from(selectedIds),
              categoryId,
            })
          }
          onClose={() => setBulkCategoryModal(false)}
          isLoading={bulkUpdateCategoryMu.isPending}
        />
      )}

      {modal === "create" && (
        <CreateMenuItemModal
          categories={categoriesList}
          menuTypes={menuTypesList}
          onClose={() => setModal(null)}
          onSubmit={(body) => createMu.mutate(body)}
          isLoading={createMu.isPending}
        />
      )}

      {editing &&
        createPortal(
          <EditMenuItemModal
            initial={editing}
            categories={categoriesList}
            menuTypes={menuTypesList}
            onClose={() => setEditing(null)}
            onSubmit={(body) =>
              updateMu.mutate({ id: (editing as { id: string }).id, body })
            }
            isLoading={updateMu.isPending}
            onOpenTranslate={() =>
              setTranslateModalItem(editing as MenuItemRow)
            }
            isTranslating={translateMu.isPending || bulkTranslateMu.isPending}
          />,
          document.body,
        )}
      {translateModalItem &&
        createPortal(
          <TranslateModal
            open
            entityId={translateModalItem.id}
            title="Перевести блюдо"
            existingLocales={
              translateModalItem.translations?.map((t) => t.locale) ?? []
            }
            languages={languages}
            onConfirm={(targetLocales) =>
              translateMu.mutate({ id: translateModalItem.id, targetLocales })
            }
            onClose={() => setTranslateModalItem(null)}
            isPending={translateMu.isPending || bulkTranslateMu.isPending}
          />,
          document.body,
        )}
      {bulkTranslateOpen &&
        selectedRows.length > 0 &&
        createPortal(
          <TranslateModal
            open
            entityId={`bulk-${Array.from(selectedIds).sort().join("-")}`}
            title="Перевести выбранные блюда"
            description={`Записей: ${selectedRows.length}. Для каждой записи добавятся переводы на выбранные языки (если их ещё нет).`}
            existingLocales={bulkLocaleIntersection}
            languages={languages}
            onConfirm={(targetLocales) =>
              bulkTranslateMu.mutate({
                ids: selectedRows.map((r) => r.id),
                targetLocales,
              })
            }
            onClose={() => setBulkTranslateOpen(false)}
            isPending={bulkTranslateMu.isPending}
          />,
          document.body,
        )}
    </div>
  );
}

type CategoryOption = {
  id: string;
  menuTypeId: string;
  translations: { name: string }[];
};
type MenuTypeOption = {
  id: string;
  code: string;
  translations: { locale: string; name: string }[];
};

function BulkChangeCategoryModal({
  categories,
  menuTypes,
  selectedCount,
  onConfirm,
  onClose,
  isLoading,
}: {
  categories: CategoryOption[] | undefined;
  menuTypes: MenuTypeOption[] | undefined;
  selectedCount: number;
  onConfirm: (categoryId: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [menuTypeId, setMenuTypeId] = useState(menuTypes?.[0]?.id ?? "");
  const categoriesOfType = menuTypeId
    ? (categories?.filter((c) => c.menuTypeId === menuTypeId) ?? [])
    : (categories ?? []);
  const [categoryId, setCategoryId] = useState(categoriesOfType[0]?.id ?? "");
  useEffect(() => {
    const next = categories?.filter((c) => c.menuTypeId === menuTypeId) ?? [];
    setCategoryId((prev) =>
      next.some((c) => c.id === prev) ? prev : (next[0]?.id ?? ""),
    );
  }, [menuTypeId, categories]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const effectiveCategoryId = categoriesOfType.some((c) => c.id === categoryId)
    ? categoryId
    : (categoriesOfType[0]?.id ?? "");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card p-6 max-w-sm w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-100">
            Изменить категорию
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
        <p className="text-sm text-stone-400">
          Для {selectedCount} выбранных записей
        </p>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Тип меню
          </label>
          <select
            value={menuTypeId}
            onChange={(e) => setMenuTypeId(e.target.value)}
            className="input-dark"
          >
            {menuTypes?.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.translations?.find((t) => t.locale === "ru")?.name ??
                  mt.code}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Категория
          </label>
          <select
            value={effectiveCategoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-dark"
          >
            {categoriesOfType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.translations?.[0]?.name ?? c.id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(effectiveCategoryId)}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? "Применяю..." : "Применить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateMenuItemModal({
  categories,
  menuTypes,
  onClose,
  onSubmit,
  isLoading,
}: {
  categories: CategoryOption[] | undefined;
  menuTypes: MenuTypeOption[] | undefined;
  onClose: () => void;
  onSubmit: (body: unknown) => void;
  isLoading: boolean;
}) {
  const [menuTypeId, setMenuTypeId] = useState(menuTypes?.[0]?.id ?? "");
  const categoriesOfType = menuTypeId
    ? (categories?.filter((c) => c.menuTypeId === menuTypeId) ?? [])
    : (categories ?? []);
  const [categoryId, setCategoryId] = useState(categoriesOfType[0]?.id ?? "");
  const [nameRu, setNameRu] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [price, setPrice] = useState("");
  const [weightOrVolume, setWeightOrVolume] = useState("");
  const [isActive, setIsActive] = useState(true);

  const onMenuTypeChange = (id: string) => {
    setMenuTypeId(id);
    const next = id
      ? (categories?.filter((c) => c.menuTypeId === id) ?? [])
      : (categories ?? []);
    const stillValid = next.some((c) => c.id === categoryId);
    setCategoryId(stillValid ? categoryId : (next[0]?.id ?? ""));
  };

  const effectiveCategoryId = categoriesOfType.some((c) => c.id === categoryId)
    ? categoryId
    : (categoriesOfType[0]?.id ?? "");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-950/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card p-6 max-w-md w-full space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-100">Новое блюдо</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-400">
              Тип меню
            </label>
            <select
              value={menuTypeId}
              onChange={(e) => onMenuTypeChange(e.target.value)}
              className="input-dark"
            >
              {menuTypes?.map((mt) => (
                <option key={mt.id} value={mt.id}>
                  {mt.translations?.find((t) => t.locale === "ru")?.name ??
                    mt.code}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-400">
              Категория
            </label>
            <select
              value={effectiveCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-dark"
            >
              {categoriesOfType.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.translations?.[0]?.name ?? c.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Название
          </label>
          <input
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Описание
          </label>
          <textarea
            value={descriptionRu}
            onChange={(e) => setDescriptionRu(e.target.value)}
            className="input-dark resize-none"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-400">
              Цена
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-dark"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-400">
              Вес/объём (например 200 г)
            </label>
            <input
              value={weightOrVolume}
              onChange={(e) => setWeightOrVolume(e.target.value)}
              className="input-dark"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="checkbox"
          />
          <span className="text-sm font-medium text-stone-300">
            Активно (отображается в меню)
          </span>
        </label>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() =>
              onSubmit({
                categoryId: effectiveCategoryId,
                translations: [
                  {
                    locale: "ru",
                    name: nameRu,
                    description: descriptionRu || undefined,
                  },
                ],
                price: Number(price) || 0,
                weightOrVolume: weightOrVolume || undefined,
                isActive,
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

type TranslationEntry = { locale: string; name: string; description: string };

function EditMenuItemModal({
  initial,
  categories,
  menuTypes,
  onClose,
  onSubmit,
  isLoading,
  onOpenTranslate,
  isTranslating,
}: {
  initial: Record<string, unknown>;
  categories: CategoryOption[] | undefined;
  menuTypes: MenuTypeOption[] | undefined;
  onClose: () => void;
  onSubmit: (body: unknown) => void;
  isLoading: boolean;
  onOpenTranslate?: () => void;
  isTranslating?: boolean;
}) {
  const initialTranslations =
    (initial.translations as {
      locale: string;
      name: string;
      description?: string;
    }[]) ?? [];
  const [translations, setTranslations] = useState<TranslationEntry[]>(
    initialTranslations.length > 0
      ? initialTranslations.map((t) => ({
          locale: t.locale,
          name: t.name ?? "",
          description: t.description ?? "",
        }))
      : [{ locale: "ru", name: "", description: "" }],
  );

  const initialCategoryId = (initial.categoryId as string) ?? "";
  const initialMenuTypeId =
    categories?.find((c) => c.id === initialCategoryId)?.menuTypeId ??
    menuTypes?.[0]?.id ??
    "";
  const [menuTypeId, setMenuTypeId] = useState(initialMenuTypeId);
  const categoriesOfType = menuTypeId
    ? (categories?.filter((c) => c.menuTypeId === menuTypeId) ?? [])
    : (categories ?? []);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [price, setPrice] = useState(String(Number(initial.price) || 0));
  const [weightOrVolume, setWeightOrVolume] = useState(
    (initial.weightOrVolume as string) ?? "",
  );
  const [isActive, setIsActive] = useState(initial.isActive !== false);

  const [activeLocaleIndex, setActiveLocaleIndex] = useState(0);

  const updateTranslation = (
    index: number,
    field: "name" | "description",
    value: string,
  ) => {
    setTranslations((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  };

  const onMenuTypeChange = (id: string) => {
    setMenuTypeId(id);
    const next = id
      ? (categories?.filter((c) => c.menuTypeId === id) ?? [])
      : (categories ?? []);
    const stillValid = next.some((c) => c.id === categoryId);
    setCategoryId(stillValid ? categoryId : (next[0]?.id ?? ""));
  };

  const effectiveCategoryId = categoriesOfType.some((c) => c.id === categoryId)
    ? categoryId
    : (categoriesOfType[0]?.id ?? categoryId);

  useEffect(() => {
    const initialTr =
      (initial.translations as {
        locale: string;
        name: string;
        description?: string;
      }[]) ?? [];
    setTranslations((prev) => {
      if (initialTr.length <= prev.length) return prev;
      return initialTr.map((t) => ({
        locale: t.locale,
        name: t.name ?? "",
        description: t.description ?? "",
      }));
    });
  }, [initial.translations]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
        aria-labelledby="edit-dish-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-6 py-4">
          <h2
            id="edit-dish-title"
            className="text-lg font-semibold text-stone-100"
          >
            Изменить блюдо
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-400">
                Тип меню
              </label>
              <select
                value={menuTypeId}
                onChange={(e) => onMenuTypeChange(e.target.value)}
                className="input-dark"
              >
                {menuTypes?.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.translations?.find((t) => t.locale === "ru")?.name ??
                      mt.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-400">
                Категория
              </label>
              <select
                value={effectiveCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-dark"
              >
                {categoriesOfType.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.translations?.[0]?.name ?? c.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider">
              Переводы
            </h3>
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
                  title={
                    isTranslating ? "Перевод..." : "Перевести на другие языки"
                  }
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
            {translations[activeLocaleIndex] &&
              (() => {
                const t = translations[activeLocaleIndex];
                const index = activeLocaleIndex;
                return (
                  <div className="rounded-lg border border-border bg-ayvan-panel/50 p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-400">
                        Название
                      </label>
                      <input
                        value={t.name}
                        onChange={(e) =>
                          updateTranslation(index, "name", e.target.value)
                        }
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-stone-400">
                        Описание
                      </label>
                      <textarea
                        value={t.description}
                        onChange={(e) =>
                          updateTranslation(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        className="input-dark resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                );
              })()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-400">
                Цена
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-400">
                Вес/объём
              </label>
              <input
                value={weightOrVolume}
                onChange={(e) => setWeightOrVolume(e.target.value)}
                className="input-dark"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm font-medium text-stone-300">
              Активно (отображается в меню)
            </span>
          </label>
        </div>
        <div className="shrink-0 flex gap-2 justify-end border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({
                categoryId: effectiveCategoryId,
                translations: translations.map((t) => ({
                  locale: t.locale,
                  name: t.name,
                  description: t.description || undefined,
                })),
                price: Number(price) || 0,
                weightOrVolume: weightOrVolume || undefined,
                isActive,
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
