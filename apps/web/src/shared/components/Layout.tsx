import { Link, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchSiteSettings, fetchMenuTypes } from '@/shared/lib/api';
import { useLocale } from '@/shared/context/LocaleContext';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ChevronLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function buildLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;
  const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

export function Layout() {
  const location = useLocation();
  const { locale } = useLocale();
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
  const siteName = settings?.siteName?.trim() || 'Ayvan Restaurant';
  const currentMenuName = menuTypes?.find((t) => t.id === menuTypeId)?.name ?? 'Меню';

  return (
    <div className="min-h-screen flex flex-col bg-ayvan-bg-dark">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 h-14 bg-ayvan-bg-dark/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMenuPage ? (
            <>
              <Link
                to="/"
                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-ayvan-panel text-ayvan-accent hover:bg-ayvan-accent/20 transition"
                aria-label="Назад к выбору меню"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
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
                <span className="text-ayvan-accent font-semibold text-lg sm:text-xl tracking-tight">
                  {siteName}
                </span>
              )}
            </Link>
          )}
        </div>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-auto py-6 px-4 border-t border-border bg-ayvan-bg-dark">
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
