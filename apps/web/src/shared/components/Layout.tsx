import { Link, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchSiteSettings, fetchMenuTypes, publicUploadUrl } from '@/shared/lib/api';
import { useLocale } from '@/shared/context/LocaleContext';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/shared/context/CartContext';
import { BRAND_NAME } from '@/shared/lib/brand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function buildLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;
  const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

export function Layout() {
  const location = useLocation();
  const { locale } = useLocale();
  const { itemCount } = useCart();
  const [logoError, setLogoError] = useState(false);

  const isMenuPage = location.pathname.startsWith('/menu/');
  const menuTypeId = isMenuPage ? location.pathname.split('/').filter(Boolean)[1] : undefined;

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });
  const { data: menuTypes } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
    enabled: isMenuPage && !!menuTypeId,
  });

  useEffect(() => {
    setLogoError(false);
  }, [settings?.logoPath]);

  const logoUrl = buildLogoUrl(settings?.logoPath ?? null);
  const showLogo = logoUrl && !logoError;
  const siteName = settings?.siteName?.trim() || BRAND_NAME;
  const currentMenu = menuTypes?.find((t) => t.id === menuTypeId);
  const currentMenuName = currentMenu?.name ?? 'Меню';
  const menuThumb = publicUploadUrl(currentMenu?.imagePath);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 h-14 bg-app-bg/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMenuPage ? (
            <>
              <Link
                to="/"
                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-app-panel text-app-accent hover:bg-app-accent/20 transition"
                aria-label="Назад к выбору меню"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              {menuThumb ? (
                <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-border bg-stone-900/40">
                  <img src={menuThumb} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <h1 className="text-base sm:text-lg font-semibold text-stone-100 truncate tracking-tight">
                {currentMenuName}
              </h1>
            </>
          ) : (
            <Link to="/" className="flex items-center min-w-0">
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-10 w-auto max-w-[220px] sm:h-9 sm:max-w-[200px] object-contain object-left"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-app-accent font-semibold text-lg sm:text-xl tracking-tight">
                  {siteName}
                </span>
              )}
            </Link>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Link
            to="/book"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-app-panel text-stone-200 hover:text-app-accent hover:bg-app-accent/10 border border-border transition"
            aria-label={itemCount > 0 ? `Корзина, ${itemCount} поз.` : 'Корзина и заказ'}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {itemCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-app-accent text-[10px] font-bold text-app-bg">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            ) : null}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-auto py-6 px-4 border-t border-border bg-app-bg">
        <div className="max-w-2xl mx-auto text-center space-y-1">
          {settings?.contactText?.trim() && (
            <p className="text-fg-muted text-sm whitespace-pre-wrap">
              {settings.contactText.trim()}
            </p>
          )}
          <p className="text-fg-subtle text-sm whitespace-pre-wrap">
            {settings?.footerText?.trim() || siteName}
          </p>
        </div>
      </footer>
    </div>
  );
}
