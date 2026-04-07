import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/shared/context/LocaleContext';
import { useCart } from '@/shared/context/CartContext';
import { fetchLanguages, fetchMenu, publicUploadUrl } from '@/shared/lib/api';
import type { MenuItemDto } from '@/shared/lib/api';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ChefHat, Minus, Plus, Search, X } from 'lucide-react';

type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  items: MenuItemDto[];
};

function matchSearch(text: string | null, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

function filterMenuBySearch(menu: MenuCategory[], query: string): MenuCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          matchSearch(item.name, query) ||
          matchSearch(item.description, query)
      ),
    }))
    .filter((cat) => cat.items.length > 0);
}

function getCurrencyLabel(localeCode: string): string {
  const base = localeCode.toLowerCase().split('-')[0];
  if (base === 'ru') return 'сум';
  if (base === 'kk') return 'сом';
  if (base === 'uz') return "so'm";
  return 'som';
}

export function MenuPage() {
  const { menuTypeId } = useParams<{ menuTypeId: string }>();
  const { locale } = useLocale();
  const { cart, setQty } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const navLinkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', menuTypeId, locale],
    queryFn: () => fetchMenu(menuTypeId!, locale),
    enabled: !!menuTypeId,
  });
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  });

  const filteredMenu = useMemo(
    () => (menu ? filterMenuBySearch(menu, searchQuery) : []),
    [menu, searchQuery]
  );

  // Scroll spy
  useEffect(() => {
    if (!filteredMenu.length) return;

    const getSections = () =>
      filteredMenu
        .map((c) => ({ id: c.id, el: sectionRefs.current.get(`cat-${c.id}`) }))
        .filter((s): s is { id: string; el: HTMLElement } => !!s.el);

    const updateActive = () => {
      const sections = getSections();
      const headerOffset = 200;
      const scrollTop = window.scrollY + headerOffset;
      let current = sections[0]?.id ?? null;
      for (const { id, el } of sections) {
        if (el.offsetTop <= scrollTop) current = id;
      }
      setActiveCatId(current);
    };

    const sections = getSections();
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      () => updateActive(),
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ el }) => observer.observe(el));
    updateActive();

    window.addEventListener('scroll', updateActive, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateActive);
    };
  }, [filteredMenu]);

  useEffect(() => {
    if (!activeCatId) return;
    const link = navLinkRefs.current.get(activeCatId);
    link?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCatId]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxSrc]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-app-bg">
        <div className="p-4 max-w-2xl mx-auto pb-8 animate-in font-sans">
          <div className="h-10 bg-app-panel rounded-lg w-1/3 animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-border/50 bg-app-panel/40 p-3.5 animate-pulse"
              >
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-stone-800/80" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-stone-700/80 rounded w-3/4" />
                  <div className="h-3 bg-stone-800/80 rounded w-full" />
                  <div className="h-8 bg-stone-800/60 rounded-full w-28 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !menu?.length;
  const hasSearch = searchQuery.trim().length > 0;
  const showCategories = filteredMenu.length > 0;
  const currentLocaleCode = languages.find((l) => l.code === locale)?.code ?? locale;
  const currencyLabel = getCurrencyLabel(currentLocaleCode);
  const numberLocale = currentLocaleCode || 'ru-RU';

  return (
    <div className="min-h-full bg-app-bg font-sans">
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        {isEmpty ? (
          <p className="text-fg-muted text-center py-12">В этом разделе пока нет позиций.</p>
        ) : (
          <>
            {/* Поиск и категории — липкий блок под шапкой */}
            <div className="sticky top-14 z-20 bg-app-bg/95 backdrop-blur-md pb-4 -mx-4 px-4 pt-4 sm:mx-0 sm:px-0 mb-6 border-b border-border space-y-4 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)]">
              <label htmlFor="menu-search" className="sr-only">
                Поиск по меню
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" aria-hidden />
                <input
                  id="menu-search"
                  type="search"
                  placeholder="Поиск блюд и разделов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-panel border border-border text-stone-100 placeholder:text-fg-subtle text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40 focus:border-app-accent/55"
                />
              </div>

            {showCategories ? (
              <>
                <nav
                  className="overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide [-webkit-overflow-scrolling:touch]"
                  aria-label="Разделы меню"
                >
                  <ul className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-1">
                    {filteredMenu.map((cat) => (
                      <li key={cat.id} className="shrink-0">
                        <a
                          ref={(el) => {
                            if (el) navLinkRefs.current.set(cat.id, el);
                          }}
                          href={`#cat-${cat.id}`}
                          className={`block px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition ${
                            activeCatId === cat.id
                              ? 'bg-app-accent/15 border-app-accent/50 text-app-accent ring-2 ring-app-accent/25 shadow-[0_0_16px_-6px_rgba(201,169,98,0.35)]'
                              : 'bg-app-panel border-border text-fg-muted hover:border-app-accent/35 hover:text-stone-100'
                          }`}
                        >
                          {cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            ) : null}
            </div>

            {showCategories ? (
                <div className="space-y-8">
                  {filteredMenu.map((category) => {
                    const catImg = publicUploadUrl(category.imagePath);
                    return (
                    <section
                      key={category.id}
                      id={`cat-${category.id}`}
                      ref={(el) => {
                        if (el) sectionRefs.current.set(`cat-${category.id}`, el);
                      }}
                      className="scroll-mt-44"
                    >
                      <div className="mb-4 rounded-2xl border border-white/[0.07] bg-linear-to-br from-stone-900/55 via-app-panel/25 to-stone-950/40 p-4 shadow-[0_2px_24px_-10px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-5">
                        {catImg ? (
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
                            <button
                              type="button"
                              onClick={() => setLightboxSrc(catImg)}
                              className="relative aspect-5/3 w-full shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-stone-950 ring-1 ring-white/6 sm:aspect-auto sm:h-29 sm:w-40 cursor-zoom-in text-left transition hover:border-app-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
                              aria-label={`Увеличить фото раздела: ${category.name}`}
                            >
                              <img
                                src={catImg}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                              />
                            </button>
                            <div className="min-w-0 flex-1">
                              <h2 className="text-xl font-semibold leading-tight tracking-tight text-stone-50 sm:text-[1.35rem]">
                                {category.name}
                              </h2>
                              {category.description ? (
                                <p className="mt-2 text-sm leading-relaxed text-stone-400/95">
                                  {category.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span
                                className="h-8 w-1 shrink-0 rounded-full bg-linear-to-b from-app-accent/85 to-app-accent/15 sm:h-9"
                                aria-hidden
                              />
                              <h2 className="min-w-0 flex-1 text-xl font-semibold leading-tight tracking-tight text-stone-50 sm:text-[1.35rem]">
                                {category.name}
                              </h2>
                            </div>
                            {category.description ? (
                              <p className="ml-3 text-sm leading-relaxed text-stone-400/95">
                                {category.description}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <ul className="space-y-3">
                        {category.items.map((item) => {
                          const qty = cart[item.id]?.quantity ?? 0;
                          const itemImg = publicUploadUrl(item.imagePath);
                          return (
                            <li
                              key={item.id}
                              className="group flex gap-3.5 sm:gap-4 rounded-2xl border border-white/[0.07] bg-linear-to-br from-stone-900/50 via-app-panel/30 to-stone-950/40 p-3.5 sm:p-4 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-app-accent/20 hover:shadow-[0_8px_32px_-14px_rgba(201,169,98,0.08)]"
                            >
                              <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-2xl bg-stone-950 ring-1 ring-white/6 sm:h-28 sm:w-28">
                                {itemImg ? (
                                  <button
                                    type="button"
                                    onClick={() => setLightboxSrc(itemImg)}
                                    className="relative block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl border-0 bg-transparent p-0 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
                                    aria-label={`Увеличить фото: ${item.name}`}
                                  >
                                    <img
                                      src={itemImg}
                                      alt=""
                                      loading="lazy"
                                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                    />
                                  </button>
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone-800/90 to-stone-950">
                                    <ChefHat
                                      className="h-9 w-9 text-app-accent/20"
                                      strokeWidth={1.15}
                                      aria-hidden
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                                <div className="min-w-0 space-y-1">
                                  <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-stone-50 sm:text-base">
                                    {item.name}
                                  </h3>
                                  {item.description ? (
                                    <p className="line-clamp-2 text-[13px] leading-relaxed text-stone-400 sm:text-sm">
                                      {item.description}
                                    </p>
                                  ) : null}
                                  {item.weightOrVolume ? (
                                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
                                      {item.weightOrVolume}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
                                  <div className="min-w-0">
                                    <span className="text-lg font-semibold tabular-nums text-app-accent sm:text-xl">
                                      {Number(item.price).toLocaleString(numberLocale)}
                                    </span>
                                    <span className="ml-1.5 text-sm font-medium text-stone-500">
                                      {currencyLabel}
                                    </span>
                                  </div>

                                  <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-black/30 py-1 pl-1 pr-1 shadow-inner">
                                    <button
                                      type="button"
                                      aria-label="Убрать из корзины"
                                      disabled={qty <= 0}
                                      onClick={() =>
                                        setQty(item.id, item.name, item.price, qty - 1)
                                      }
                                      className="rounded-full p-2 text-stone-400 transition hover:bg-white/10 hover:text-stone-100 disabled:pointer-events-none disabled:opacity-35"
                                    >
                                      <Minus className="h-4 w-4" strokeWidth={2.25} />
                                    </button>
                                    <span className="min-w-7 text-center text-sm font-medium tabular-nums text-stone-200">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label="Добавить в корзину"
                                      onClick={() =>
                                        setQty(item.id, item.name, item.price, qty + 1)
                                      }
                                      className="rounded-full p-2 text-app-accent transition hover:bg-app-accent/15"
                                    >
                                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                    );
                  })}
                </div>
            ) : (
              <p className="text-fg-muted text-center py-12">
                {hasSearch ? 'По запросу ничего не найдено.' : 'В этом разделе пока нет позиций.'}
              </p>
            )}
          </>
        )}
      </div>

      {lightboxSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр изображения"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute right-3 top-3 rounded-full border border-white/15 bg-stone-900/90 p-2.5 text-stone-200 shadow-lg transition hover:bg-stone-800 hover:text-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[min(92vh,920px)] max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
          />
        </div>
      ) : null}
    </div>
  );
}
