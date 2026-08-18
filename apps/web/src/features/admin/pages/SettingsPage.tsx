import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSiteSettingsAdmin,
  uploadLogo,
  updateSiteSettings,
  fetchLanguagesAdmin,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  fetchUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  fetchRestaurantDomains,
  addRestaurantDomain,
  removeRestaurantDomain,
} from "@/features/admin/lib/api";
import { useRestaurant } from "@/features/admin/context/RestaurantContext";
import { toast } from "sonner";
import { BRAND_NAME } from "@/shared/lib/brand";
import {
  ImagePlus,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Globe,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

type LanguageRow = {
  id: string;
  code: string;
  name: string | null;
  sortOrder: number;
};
type UserRow = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type SettingsTab = "appearance" | "languages" | "users" | "domains";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { restaurantId } = useRestaurant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [footerDraft, setFooterDraft] = useState<string>("");
  const [siteNameDraft, setSiteNameDraft] = useState("");
  const [contactDraft, setContactDraft] = useState("");
  const [langModal, setLangModal] = useState<"create" | null>(null);
  const [editingLang, setEditingLang] = useState<LanguageRow | null>(null);
  const [deleteLangTarget, setDeleteLangTarget] = useState<LanguageRow | null>(
    null,
  );
  const [userModal, setUserModal] = useState<"create" | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserRow | null>(
    null,
  );
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");

  const [ownerTg, setOwnerTg] = useState("");
  const [staffTg, setStaffTg] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [deleteDomainTarget, setDeleteDomainTarget] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "site-settings", restaurantId],
    queryFn: fetchSiteSettingsAdmin,
    enabled: !!restaurantId,
  });

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ["admin", "languages"],
    queryFn: fetchLanguagesAdmin,
  });

  const createLangMu = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "languages"] });
      setLangModal(null);
      toast.success("Язык добавлен");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось добавить язык"),
  });

  const updateLangMu = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { code?: string; name?: string; sortOrder?: number };
    }) => updateLanguage(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "languages"] });
      setEditingLang(null);
      toast.success("Язык сохранён");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось сохранить язык"),
  });

  const deleteLangMu = useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "languages"] });
      toast.success("Язык удалён");
    },
    onError: (err: Error) => toast.error(err.message || "Не удалось удалить язык"),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchUsersAdmin,
  });

  const createUserMu = useMutation({
    mutationFn: createUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setUserModal(null);
      toast.success("Пользователь создан");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось создать пользователя"),
  });

  const updateUserMu = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { email?: string; password?: string };
    }) => updateUserAdmin(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditingUser(null);
      toast.success("Данные пользователя сохранены");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось сохранить пользователя"),
  });

  const deleteUserMu = useMutation({
    mutationFn: deleteUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Пользователь удалён");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось удалить пользователя"),
  });

  const uploadMu = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      fileInputRef.current?.form?.reset();
      toast.success("Логотип обновлён");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось загрузить логотип"),
  });

  const updateSettingsMu = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось сохранить настройки"),
  });

  const { data: domains, isLoading: domainsLoading } = useQuery<string[]>({
    queryKey: ["admin", "domains", restaurantId],
    queryFn: () => fetchRestaurantDomains(restaurantId!),
    enabled: !!restaurantId,
  });

  const addDomainMu = useMutation({
    mutationFn: ({ host }: { host: string }) =>
      addRestaurantDomain(restaurantId!, host),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "domains", restaurantId] });
      setNewDomain("");
      toast.success("Домен добавлен");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось добавить домен"),
  });

  const deleteDomainMu = useMutation({
    mutationFn: ({ host }: { host: string }) =>
      removeRestaurantDomain(restaurantId!, host),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "domains", restaurantId] });
      setDeleteDomainTarget(null);
      toast.success("Домен удалён");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Не удалось удалить домен"),
  });

  const validateAndUploadFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите файл изображения (PNG, JPEG, SVG, WebP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Размер файла не более 2 МБ");
      return;
    }
    uploadMu.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUploadFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    validateAndUploadFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveLogo = () => {
    updateSettingsMu.mutate(
      { logoPath: null },
      {
        onSuccess: () => {
          toast.success("Логотип удалён");
        },
      },
    );
  };

  const logoUrl = settings?.logoPath
    ? `${API_BASE}${settings.logoPath.startsWith("/") ? "" : "/"}${settings.logoPath}`
    : null;

  useEffect(() => {
    if (settings?.footerText !== undefined)
      setFooterDraft(settings.footerText ?? "");
  }, [settings?.footerText]);
  useEffect(() => {
    if (settings?.siteName !== undefined)
      setSiteNameDraft(settings.siteName ?? "");
  }, [settings?.siteName]);
  useEffect(() => {
    if (settings?.contactText !== undefined)
      setContactDraft(settings.contactText ?? "");
  }, [settings?.contactText]);
  useEffect(() => {
    if (settings?.ownerTelegramChatId !== undefined)
      setOwnerTg(settings.ownerTelegramChatId ?? "");
  }, [settings?.ownerTelegramChatId]);
  useEffect(() => {
    if (settings?.staffTelegramChatId !== undefined)
      setStaffTg(settings.staffTelegramChatId ?? "");
  }, [settings?.staffTelegramChatId]);

  const handleSaveFooter = () => {
    updateSettingsMu.mutate(
      { footerText: footerDraft.trim() || null },
      {
        onSuccess: () => toast.success("Текст футера сохранён"),
      },
    );
  };

  const handleSaveSiteName = () => {
    updateSettingsMu.mutate(
      { siteName: siteNameDraft.trim() || null },
      {
        onSuccess: () => toast.success("Название сайта сохранено"),
      },
    );
  };

  const handleSaveContact = () => {
    updateSettingsMu.mutate(
      { contactText: contactDraft.trim() || null },
      {
        onSuccess: () => toast.success("Контакты в футере сохранены"),
      },
    );
  };

  const footerPreviewText =
    footerDraft.trim() ||
    settings?.siteName?.trim() ||
    BRAND_NAME;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "appearance", label: "Внешний вид" },
    { id: "languages", label: "Языки" },
    { id: "users", label: "Пользователи" },
    { id: "domains", label: "Домены" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-stone-100">
          Настройки сайта
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Логотип, футер, языки и пользователи
        </p>
      </div>

      {/* Табы */}
      <div className="border-b border-stone-700/80">
        <nav className="flex gap-1" aria-label="Разделы настроек">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-app-accent text-app-accent bg-stone-800/50"
                  : "border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "appearance" && (
      <div className="rounded-2xl overflow-hidden border border-stone-700/60 bg-app-panel/80 shadow-lg">
        <div className="h-1.5 bg-app-accent" aria-hidden />
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-medium text-stone-200">
            Внешний вид сайта
          </h2>

          {/* Логотип */}
          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-2">
              Логотип
            </h3>
            <p className="text-sm text-stone-500 mb-3">
              Отображается в шапке. Форматы: PNG, JPEG, SVG, WebP. До 2 МБ.
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`rounded-xl border-2 border-dashed transition-colors ${
                dragOver
                  ? "border-app-accent/50 bg-app-accent/5"
                  : "border-stone-600 bg-stone-800/30"
              } p-6 flex flex-wrap items-end gap-6`}
            >
              <div className="flex flex-col gap-3">
                {isLoading ? (
                  <div className="w-48 h-24 border border-stone-700 rounded-lg bg-stone-800 flex items-center justify-center">
                    <span className="inline-block w-6 h-6 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : logoUrl ? (
                  <div className="relative">
                    <div className="w-48 h-24 border border-stone-700 rounded-lg overflow-hidden bg-stone-800 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Логотип"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-24 border border-dashed border-stone-600 rounded-lg flex items-center justify-center text-stone-500 text-sm">
                    Нет логотипа
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <form>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMu.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-app-accent/20 text-app-accent border border-app-accent/40 hover:bg-app-accent/30 disabled:opacity-50 text-sm font-medium"
                    >
                      {uploadMu.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImagePlus className="w-4 h-4" />
                      )}
                      {uploadMu.isPending ? "Загрузка..." : "Выбрать файл"}
                    </button>
                  </form>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={updateSettingsMu.isPending}
                      className="btn-secondary text-sm py-2"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
              <p className="text-stone-500 text-xs self-center">
                или перетащите файл сюда
              </p>
            </div>
          </div>

          {/* Название сайта */}
          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-2">
              Название сайта
            </h3>
            <p className="text-sm text-stone-500 mb-2">
              Показывается в шапке и футере, если нет логотипа или как подпись.
            </p>
            <div className="flex gap-2 flex-wrap items-center">
              <input
                type="text"
                value={siteNameDraft}
                onChange={(e) => setSiteNameDraft(e.target.value)}
                className="input-dark max-w-xs"
                placeholder={BRAND_NAME}
              />
              <button
                type="button"
                onClick={handleSaveSiteName}
                disabled={updateSettingsMu.isPending}
                className="btn-primary"
              >
                Сохранить
              </button>
            </div>
          </div>

          {/* Контакты в футере */}
          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-2">
              Контакты в футере
            </h3>
            <p className="text-sm text-stone-500 mb-2">
              Телефон, email или ссылки — отображаются над основным текстом футера.
            </p>
            <div className="flex gap-2 flex-wrap items-start">
              <textarea
                value={contactDraft}
                onChange={(e) => setContactDraft(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                rows={2}
                className="input-dark max-w-md resize-y min-h-[60px]"
              />
              <button
                type="button"
                onClick={handleSaveContact}
                disabled={updateSettingsMu.isPending}
                className="btn-primary"
              >
                Сохранить
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-2">
              Telegram (заказы)
            </h3>
            <p className="text-sm text-stone-500 mb-2">
              На сервере задайте <code className="text-stone-400">TELEGRAM_BOT_TOKEN</code> и
              зарегистрируйте webhook на <code className="text-stone-400">POST /telegram/webhook</code>{" "}
              (опционально <code className="text-stone-400">TELEGRAM_WEBHOOK_SECRET</code>).
            </p>
            {import.meta.env.VITE_TELEGRAM_BOT_USERNAME && restaurantId ? (
              <p className="text-sm text-stone-400 mb-3">
                <a
                  href={`https://t.me/${String(import.meta.env.VITE_TELEGRAM_BOT_USERNAME).replace(/^@/, "")}?start=owner_${restaurantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-app-accent hover:underline font-medium"
                >
                  Подключить Telegram (открыть бота и нажать Start)
                </a>
                <span className="block mt-1 text-xs text-stone-500">
                  Chat ID подставится автоматически после /start.
                </span>
              </p>
            ) : (
              <p className="text-xs text-stone-500 mb-3 max-w-md">
                Для автопривязки добавьте в <code className="text-stone-400">.env</code> веба{" "}
                <code className="text-stone-400">VITE_TELEGRAM_BOT_USERNAME</code> (имя бота без @)
                — появится ссылка. Или введите Chat ID вручную ниже.
              </p>
            )}
            <div className="space-y-2 max-w-md">
              <input
                type="text"
                value={ownerTg}
                onChange={(e) => setOwnerTg(e.target.value)}
                className="input-dark w-full"
                placeholder="Chat ID владельца"
              />
              <input
                type="text"
                value={staffTg}
                onChange={(e) => setStaffTg(e.target.value)}
                className="input-dark w-full"
                placeholder="Chat ID сотрудника (опционально)"
              />
              <button
                type="button"
                onClick={() =>
                  updateSettingsMu.mutate(
                    {
                      ownerTelegramChatId: ownerTg.trim() || null,
                      staffTelegramChatId: staffTg.trim() || null,
                    },
                    { onSuccess: () => toast.success("Telegram сохранён") },
                  )
                }
                disabled={updateSettingsMu.isPending}
                className="btn-primary"
              >
                Сохранить Telegram
              </button>
            </div>
          </div>

          {/* Футер */}
          <div>
            <h3 className="text-sm font-medium text-stone-300 mb-2">
              Текст футера
            </h3>
            <p className="text-sm text-stone-500 mb-2">
              Основная строка внизу страницы. Пусто — показывается название сайта.
            </p>
            <textarea
              value={footerDraft}
              onChange={(e) => {
                setFooterDraft(e.target.value);
              }}
              placeholder={`Например: © 2025 ${BRAND_NAME}`}
              rows={3}
              className="input-dark mb-2 resize-y min-h-[80px]"
            />
            <p className="text-xs text-stone-500 mb-2">
              Превью:{" "}
              <span className="text-stone-400 italic">
                {footerPreviewText || "—"}
              </span>
            </p>
            <button
              type="button"
              onClick={handleSaveFooter}
              disabled={updateSettingsMu.isPending}
              className="btn-primary"
            >
              {updateSettingsMu.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить футер"
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {activeTab === "languages" && (
      <section className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-stone-200">Языки</h2>
          <button
            type="button"
            onClick={() => setLangModal("create")}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Добавить
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Языки отображаются в переключателе на сайте. Код (ru, en, kk…) используется в переводах и в API.
        </p>
        {languagesLoading ? (
          <div className="flex items-center gap-2 text-stone-400 py-4">
            <span className="inline-block w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        ) : !languages?.length ? (
          <div className="rounded-xl border border-stone-700 border-dashed bg-stone-800/30 py-10 px-6 text-center">
            <p className="text-stone-500 mb-4">Пока нет языков</p>
            <button
              type="button"
              onClick={() => setLangModal("create")}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Добавить язык
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Код
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Порядок
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/80">
                {languages?.map((item: LanguageRow) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-stone-200 font-mono text-sm">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-stone-100">
                      {item.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-400">
                      {item.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingLang(item)}
                          className="btn-ghost text-app-accent hover:bg-app-accent/10"
                          title="Изменить"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteLangTarget(item)}
                          className="btn-danger"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {activeTab === "users" && (
      <section className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-stone-200">Пользователи</h2>
          <button
            type="button"
            onClick={() => setUserModal("create")}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Добавить
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Пользователи могут входить в админ-панель под своим email и паролем.
        </p>
        {usersLoading ? (
          <div className="flex items-center gap-2 text-stone-400 py-4">
            <span className="inline-block w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        ) : !users?.length ? (
          <div className="rounded-xl border border-stone-700 border-dashed bg-stone-800/30 py-10 px-6 text-center">
            <p className="text-stone-500 mb-4">Пока нет пользователей</p>
            <button
              type="button"
              onClick={() => setUserModal("create")}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Добавить пользователя
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Создан
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/80">
                {users?.map((item: UserRow) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-stone-100">{item.email}</td>
                    <td className="px-4 py-3 text-stone-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingUser(item)}
                          className="btn-ghost text-app-accent hover:bg-app-accent/10"
                          title="Изменить"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUserTarget(item)}
                          className="btn-danger"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {activeTab === "domains" && (
      <section className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-stone-400" />
          <h2 className="text-lg font-medium text-stone-200">Домен</h2>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Укажите субдомен, на котором будет открываться меню этого ресторана.
          Например: <code className="text-stone-300">moscow.example.com</code>
        </p>
        {domainsLoading ? (
          <div className="flex items-center gap-2 text-stone-400 py-4">
            <span className="inline-block w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        ) : domains && domains.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-lg bg-stone-800 font-mono text-stone-200">
              {domains[0]}
            </div>
            <button
              type="button"
              onClick={() => setDeleteDomainTarget(domains[0])}
              className="btn-ghost p-3 rounded-lg text-red-400 hover:bg-red-500/10"
              title="Удалить"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="subdomain.example.com"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => {
                if (newDomain.trim()) {
                  addDomainMu.mutate({ host: newDomain.trim() });
                }
              }}
              disabled={!newDomain.trim() || addDomainMu.isPending}
              className="btn-primary"
            >
              {addDomainMu.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Добавить
            </button>
          </div>
        )}
      </section>
      )}

      {langModal === "create" && (
        <CreateLanguageModal
          onClose={() => setLangModal(null)}
          onSubmit={(body) => createLangMu.mutate(body)}
          isLoading={createLangMu.isPending}
        />
      )}

      {editingLang && (
        <EditLanguageModal
          initial={editingLang}
          onClose={() => setEditingLang(null)}
          onSubmit={(body) => updateLangMu.mutate({ id: editingLang.id, body })}
          isLoading={updateLangMu.isPending}
        />
      )}

      {userModal === "create" && (
        <CreateUserModal
          onClose={() => setUserModal(null)}
          onSubmit={(body) => createUserMu.mutate(body)}
          isLoading={createUserMu.isPending}
        />
      )}

      {editingUser && (
        <EditUserModal
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(body) => updateUserMu.mutate({ id: editingUser.id, body })}
          isLoading={updateUserMu.isPending}
        />
      )}

      {deleteLangTarget && (
        <ConfirmDeleteModal
          title="Удалить язык?"
          description={`Язык «${deleteLangTarget.name ?? deleteLangTarget.code}» будет удалён. Это может затронуть переводы.`}
          onClose={() => setDeleteLangTarget(null)}
          onConfirm={() => {
            deleteLangMu.mutate(deleteLangTarget.id, {
              onSuccess: () => setDeleteLangTarget(null),
            });
          }}
          isLoading={deleteLangMu.isPending}
        />
      )}

      {deleteUserTarget && (
        <ConfirmDeleteModal
          title="Удалить пользователя?"
          description={`Пользователь ${deleteUserTarget.email} больше не сможет входить в админ-панель.`}
          onClose={() => setDeleteUserTarget(null)}
          onConfirm={() => {
            deleteUserMu.mutate(deleteUserTarget.id, {
              onSuccess: () => setDeleteUserTarget(null),
            });
          }}
          isLoading={deleteUserMu.isPending}
        />
      )}

      {deleteDomainTarget && (
        <ConfirmDeleteModal
          title="Удалить домен?"
          description={`Домен ${deleteDomainTarget} не будет открывать меню ресторана.`}
          onClose={() => setDeleteDomainTarget(null)}
          onConfirm={() => deleteDomainMu.mutate({ host: deleteDomainTarget })}
          isLoading={deleteDomainMu.isPending}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({
  title,
  description,
  onClose,
  onConfirm,
  isLoading,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
        <p className="text-sm text-stone-400">{description}</p>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateLanguageModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (body: { code: string; name?: string; sortOrder?: number }) => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
          <h2 className="text-lg font-semibold text-stone-100">Новый язык</h2>
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
            Код (ru, en, kk…)
          </label>
          <input
            ref={firstInputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-dark"
            placeholder="ru"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Название
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="Русский"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Порядок сортировки
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="input-dark"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({
                code: code || "ru",
                name: name || undefined,
                sortOrder,
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

function CreateUserModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (body: { email: string; password: string }) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            Новый пользователь
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
            placeholder="admin@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
            placeholder="не менее 6 символов"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => onSubmit({ email, password })}
            disabled={isLoading || !email || password.length < 6}
            className="btn-primary"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({
  initial,
  onClose,
  onSubmit,
  isLoading,
}: {
  initial: UserRow;
  onClose: () => void;
  onSubmit: (body: { email?: string; password?: string }) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState("");
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            Изменить пользователя
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Новый пароль (оставьте пустым, чтобы не менять)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••••••"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => onSubmit(password ? { email, password } : { email })}
            disabled={isLoading || !email}
            className="btn-primary"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function EditLanguageModal({
  initial,
  onClose,
  onSubmit,
  isLoading,
}: {
  initial: LanguageRow;
  onClose: () => void;
  onSubmit: (body: {
    code?: string;
    name?: string;
    sortOrder?: number;
  }) => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState(initial.code);
  const [name, setName] = useState(initial.name ?? "");
  const [sortOrder, setSortOrder] = useState(initial.sortOrder);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            Изменить язык
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
            Код
          </label>
          <input
            ref={firstInputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Название
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-400">
            Порядок сортировки
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="input-dark"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({ code, name: name || undefined, sortOrder })
            }
            disabled={isLoading}
            className="btn-primary"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
