import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/features/admin/context/AuthContext';
import { fetchSiteSettings } from '@/features/admin/lib/api';
import { LogIn } from 'lucide-react';
import { BRAND_NAME, BRAND_SHORT, BRAND_TAGLINE } from '@/shared/lib/brand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });

  const logoUrl = settings?.logoPath
    ? `${API_BASE}${settings.logoPath.startsWith('/') ? '' : '/'}${settings.logoPath}`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Вход выполнен');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">
      {/* Точки на фоне */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-88 animate-in">
        {/* Карточка: золотая полоса сверху + контент */}
        <div className="rounded-2xl overflow-hidden border border-border bg-app-panel shadow-card ring-1 ring-black/20">
          {/* Полоса-акцент с лёгким градиентом */}
          <div
            className="h-2 bg-linear-to-r from-app-accent/90 via-app-accent to-app-accent/90"
            aria-hidden
          />

          <div className="p-8 pt-8">
            {/* Лого по центру */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center min-h-14 px-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Логотип"
                    className="max-h-14 w-auto max-w-[200px] object-contain object-center"
                  />
                ) : (
                  <div className="text-center max-w-[280px]">
                    <span className="block text-2xl font-semibold text-app-accent tracking-tight">
                      {BRAND_SHORT}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-stone-400 leading-snug">
                      {BRAND_TAGLINE}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-fg-muted text-sm font-medium mb-6">
              Вход в админ-панель · {BRAND_NAME}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-medium text-fg-subtle">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-dark"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-fg-subtle">
                  Пароль
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-dark"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-5 flex items-center justify-center gap-2 rounded-xl"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-app-bg/30 border-t-app-bg rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" strokeWidth={2} />
                )}
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-fg-subtle text-xs mt-5">
          Только для авторизованных сотрудников
        </p>
      </div>
    </div>
  );
}
