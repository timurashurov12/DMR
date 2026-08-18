import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/shared/context/LocaleContext';
import { fetchMenuTypes, fetchSiteSettings, publicUploadUrl, fetchRestaurantsPublic, type PublicRestaurant } from '@/shared/lib/api';
import { BRAND_NAME } from '@/shared/lib/brand';
import { ChevronRight, UtensilsCrossed, Globe } from 'lucide-react';

export function HomePage() {
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['current-restaurant'],
    queryFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/restaurants/current`)
        .then((r) => r.json()) as Promise<PublicRestaurant | null>;
    },
  });

  if (restaurantLoading) {
    return (
      <div className="min-h-full bg-app-bg font-sans">
        <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-6">
          <div className="mb-10 space-y-3 text-center">
            <div className="mx-auto h-3 w-32 rounded-full bg-app-panel animate-pulse" />
            <div className="mx-auto h-8 w-56 rounded-lg bg-app-panel animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (restaurant) {
    return <MenuHomePage restaurant={restaurant} />;
  }

  return <LandingHomePage />;
}

function MenuHomePage({ restaurant }: { restaurant: PublicRestaurant }) {
  const { locale } = useLocale();
  const { data: menuTypes, isLoading } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
  });
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });

  const siteLabel = siteSettings?.siteName?.trim() || null;

  if (isLoading) {
    return (
      <div className="min-h-full bg-app-bg font-sans">
        <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-6">
          <div className="mb-10 space-y-3 text-center">
            <div className="mx-auto h-3 w-32 rounded-full bg-app-panel animate-pulse" />
            <div className="mx-auto h-8 w-56 rounded-lg bg-app-panel animate-pulse" />
            <div className="mx-auto h-4 w-full max-w-md rounded bg-app-panel/70 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/5 bg-app-panel/30">
                <div className="aspect-5/3 bg-stone-800/80 animate-pulse" />
                <div className="flex justify-between gap-3 p-4">
                  <div className="h-5 flex-1 rounded bg-stone-700/60 animate-pulse" />
                  <div className="h-5 w-5 rounded bg-stone-700/40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app-bg font-sans">
      <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-6 sm:px-5">
        <header className="mb-8 text-center sm:mb-10">
          {siteLabel ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-app-accent/85">
              {siteLabel}
            </p>
          ) : (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
              {restaurant.name}
            </p>
          )}
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-stone-50 sm:text-[1.75rem]">
            Выберите раздел
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-400">
            Откройте нужное меню, добавляйте блюда в корзину через иконку в шапке, затем оформите заказ.
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          <Link
            to="/book"
            className="group inline-flex items-center gap-2 rounded-2xl border border-app-accent/35 bg-app-accent/10 px-5 py-3 text-sm font-medium text-app-accent shadow-[0_4px_24px_-12px_rgba(201,169,98,0.35)] transition hover:border-app-accent/55 hover:bg-app-accent/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            Онлайн-заказ и бронь
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {menuTypes && menuTypes.length === 0 ? (
          <p className="text-center text-fg-muted py-12">Разделы меню пока не настроены.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {menuTypes?.map((type) => {
              const img = publicUploadUrl(type.imagePath);
              return (
                <Link
                  key={type.id}
                  to={`/menu/${type.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-linear-to-br from-stone-900/50 via-app-panel/30 to-stone-950/40 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-app-accent/25 hover:shadow-[0_8px_32px_-14px_rgba(201,169,98,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg active:scale-[0.99]"
                >
                  {img ? (
                    <div className="relative aspect-5/3 w-full overflow-hidden bg-stone-950">
                      <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" aria-hidden />
                    </div>
                  ) : (
                    <div className="flex aspect-5/3 w-full items-center justify-center bg-linear-to-br from-stone-800/90 to-stone-950">
                      <UtensilsCrossed className="h-14 w-14 text-app-accent/22" strokeWidth={1.1} aria-hidden />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-white/6 bg-black/15 px-4 py-4">
                    <span className="min-w-0 text-left text-base font-semibold leading-snug tracking-tight text-stone-100 sm:text-[17px]">
                      {type.name}
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-app-accent/55 transition group-hover:translate-x-0.5 group-hover:text-app-accent" strokeWidth={2} aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LandingHomePage() {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurantsPublic,
  });

  return (
    <div className="min-h-full bg-app-bg font-sans">
      <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-6 sm:px-5">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-500">{BRAND_NAME}</p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-stone-50 sm:text-[1.75rem]">Выберите ресторан</h1>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/5 bg-app-panel/30">
                <div className="aspect-5/3 bg-stone-800/80 animate-pulse" />
                <div className="flex justify-between gap-3 p-4">
                  <div className="h-5 flex-1 rounded bg-stone-700/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !restaurants?.length ? (
          <p className="text-center text-fg-muted py-12">Нет доступных ресторанов.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {restaurants.map((r) => {
              const domain = r.domains[0] || null;
              return (
                <a
                  key={r.id}
                  href={domain ? `https://${domain}` : '#'}
                  className={`group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-linear-to-br from-stone-900/50 via-app-panel/30 to-stone-950/40 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-app-accent/25 hover:shadow-[0_8px_32px_-14px_rgba(201,169,98,0.1)] ${!domain ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex aspect-5/3 w-full items-center justify-center bg-linear-to-br from-stone-800/90 to-stone-950">
                    <Globe className="h-14 w-14 text-app-accent/22" strokeWidth={1.1} aria-hidden />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/6 bg-black/15 px-4 py-4">
                    <span className="min-w-0 text-left text-base font-semibold leading-snug tracking-tight text-stone-100 sm:text-[17px]">{r.name}</span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-app-accent/55" strokeWidth={2} aria-hidden />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}