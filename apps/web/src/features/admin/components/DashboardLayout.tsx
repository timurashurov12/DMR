import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/features/admin/context/AuthContext';
import { fetchSiteSettings } from '@/features/admin/lib/api';
import { LayoutGrid, FolderTree, UtensilsCrossed, Settings, LogOut, Github } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const nav = [
  { to: '/admin/menu-types', label: 'Типы меню', icon: LayoutGrid },
  { to: '/admin/categories', label: 'Категории', icon: FolderTree },
  { to: '/admin/menu-items', label: 'Блюда', icon: UtensilsCrossed },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
];

export function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const { data: settings } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: fetchSiteSettings,
  });
  const logoUrl = settings?.logoPath
    ? `${API_BASE}${settings.logoPath.startsWith('/') ? '' : '/'}${settings.logoPath}`
    : null;

  return (
    <div className="flex h-screen min-h-0 bg-ayvan-bg-dark relative">
      {/* Точки на фоне — как на странице входа */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
        aria-hidden
      />
      <aside className="relative z-10 w-60 h-screen shrink-0 flex flex-col border-r border-border bg-ayvan-panel overflow-y-auto">
        <div className="shrink-0 border-b border-border p-5">
          {logoUrl ? (
            <img src={logoUrl} alt="Логотип" className="h-9 w-auto max-w-full object-contain object-left" />
          ) : (
            <h2 className="font-semibold text-lg text-stone-100 tracking-tight">Ayvan</h2>
          )}
          <p className="text-xs text-fg-subtle mt-0.5">Админ-панель</p>
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
                    ? 'bg-ayvan-accent/15 text-ayvan-accent border border-ayvan-accent/30'
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
        <footer className="shrink-0 flex items-center justify-center gap-2 py-3 px-4 border-t border-border bg-ayvan-bg-dark/50">
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
