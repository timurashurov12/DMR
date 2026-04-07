import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/features/admin/context/AuthContext';
import { useRestaurant } from '@/features/admin/context/RestaurantContext';
import { fetchSiteSettingsAdmin } from '@/features/admin/lib/api';
import {
  LayoutGrid,
  FolderTree,
  UtensilsCrossed,
  Settings,
  LogOut,
  Github,
  BookOpen,
  CalendarClock,
} from 'lucide-react';
import { BRAND_SHORT } from '@/shared/lib/brand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const nav = [
  { to: '/admin/menus', label: 'Меню', icon: BookOpen },
  { to: '/admin/menu-types', label: 'Типы меню', icon: LayoutGrid },
  { to: '/admin/categories', label: 'Категории', icon: FolderTree },
  { to: '/admin/menu-items', label: 'Блюда', icon: UtensilsCrossed },
  { to: '/admin/bookings', label: 'Заказы', icon: CalendarClock },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
];

export function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const { restaurantId, restaurants, setRestaurantId, isLoading: restaurantsLoading } =
    useRestaurant();
  const { data: settings } = useQuery({
    queryKey: ['admin', 'site-settings', restaurantId],
    queryFn: fetchSiteSettingsAdmin,
    enabled: !!restaurantId,
  });
  const logoUrl = settings?.logoPath
    ? `${API_BASE}${settings.logoPath.startsWith('/') ? '' : '/'}${settings.logoPath}`
    : null;

  return (
    <div className="flex h-screen min-h-0 bg-app-bg relative">
      {/* Точки на фоне — как на странице входа */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
        aria-hidden
      />
      <aside className="relative z-10 w-60 h-screen shrink-0 flex flex-col border-r border-border bg-app-panel overflow-y-auto">
        <div className="shrink-0 border-b border-border p-5">
          {logoUrl ? (
            <img src={logoUrl} alt="Логотип" className="h-9 w-auto max-w-full object-contain object-left" />
          ) : (
            <h2 className="font-semibold text-lg text-stone-100 tracking-tight">{BRAND_SHORT}</h2>
          )}
          <p className="text-xs text-fg-subtle mt-0.5">Админ-панель</p>
          {restaurants.length > 0 && (
            <label className="block mt-4 text-xs text-stone-500">Ресторан</label>
          )}
          {restaurants.length > 0 && (
            <select
              value={restaurantId ?? ''}
              disabled={restaurantsLoading}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="mt-1 w-full text-sm rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-app-accent/15 text-app-accent border border-app-accent/30'
                    : 'text-stone-400 hover:bg-stone-800/80 hover:text-stone-200 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 p-3 border-t border-border">
          <button
            type="button"
            onClick={() => {
              toast.success('Вы вышли из аккаунта');
              logout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:bg-stone-800/80 hover:text-stone-200 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
            Выйти
          </button>
        </div>
      </aside>
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
        <main className="flex-1 min-h-0 p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="shrink-0 flex items-center justify-center gap-2 py-3 px-4 border-t border-border bg-app-bg/50">
          <a
            href="https://github.com/timurashurov12"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-fg-subtle hover:text-fg-muted transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Timur Ashurov</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
