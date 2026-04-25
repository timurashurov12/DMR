import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/features/landing/lib/api';

export function LandingLoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    }
    if (!form.password) {
      newErrors.password = 'Введите пароль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem('restaurant-admin-token', response.access_token);

      toast.success('Добро пожаловать!');
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-accent" />
            </div>
            <span className="font-bold text-2xl text-dark">DMR</span>
          </Link>
        </div>

        <div className="landing-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Вход в аккаунт</h1>
            <p className="text-text-secondary">Управляйте своим цифровым меню</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-dark mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`landing-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-dark mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                className={`landing-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Ваш пароль"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Войти'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-accent-dark font-semibold hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}