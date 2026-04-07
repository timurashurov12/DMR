import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/shared/context/LocaleContext';
import { fetchLanguages, fetchMenu } from '@/shared/lib/api';
import type { MenuItemDto } from '@/shared/lib/api';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';

type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
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

  if (isLoading) {
    return (
      <div className="min-h-full bg-ayvan-bg-dark">
        <div className="p-4 max-w-2xl mx-auto pb-8 animate-in font-sans">
          <div className="h-10 bg-ayvan-panel rounded-lg w-1/3 animate-pulse mb-6" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-ayvan-panel rounded-lg animate-pulse" />
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
    <div className="min-h-full bg-ayvan-bg-dark font-sans">
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        {isEmpty ? (
          <p className="text-fg-muted text-center py-12">В этом разделе пока нет позиций.</p>
        ) : (
          <>
            {/* Поиск и категории — липкий блок под шапкой */}
            <div className="sticky top-14 z-20 bg-ayvan-bg-dark/95 backdrop-blur-md pb-4 -mx-4 px-4 pt-4 sm:mx-0 sm:px-0 mb-6 border-b border-border space-y-4 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.45)]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ayvan-panel border border-border text-stone-100 placeholder:text-fg-subtle text-sm focus:outline-none focus:ring-2 focus:ring-ayvan-accent/40 focus:border-ayvan-accent/55"
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
                              ? 'bg-ayvan-accent/15 border-ayvan-accent/50 text-ayvan-accent ring-2 ring-ayvan-accent/25 shadow-[0_0_16px_-6px_rgba(201,169,98,0.35)]'
                              : 'bg-ayvan-panel border-border text-fg-muted hover:border-ayvan-accent/35 hover:text-stone-100'
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
                  {filteredMenu.map((category) => (
                    <section
                      key={category.id}
                      id={`cat-${category.id}`}
                      ref={(el) => {
                        if (el) sectionRefs.current.set(`cat-${category.id}`, el);
                      }}
                      className="scroll-mt-44"
                    >
                      <h2 className="bg-ayvan-panel text-stone-100 text-lg px-4 py-2.5 rounded-xl mb-3 border border-border font-semibold shadow-[inset_0_1px_0_0_rgba(201,169,98,0.12)]">
                        {category.name}
                      </h2>
                      <ul className="space-y-3">
                        {category.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between items-start gap-4 py-2 border-b border-border"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-stone-100">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-fg-muted mt-0.5">{item.description}</p>
                              )}
                              {item.weightOrVolume && (
                                <p className="text-xs text-fg-subtle">{item.weightOrVolume}</p>
                              )}
                            </div>
                            <span className="shrink-0 bg-ayvan-panel/95 text-ayvan-accent font-semibold px-2.5 py-1 rounded-lg text-sm whitespace-nowrap border border-ayvan-accent/25">
                              {Number(item.price).toLocaleString(numberLocale)} {currencyLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
            ) : (
              <p className="text-fg-muted text-center py-12">
                {hasSearch ? 'По запросу ничего не найдено.' : 'В этом разделе пока нет позиций.'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
