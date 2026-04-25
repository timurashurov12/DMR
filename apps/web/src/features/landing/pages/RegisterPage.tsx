import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/features/landing/lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.restaurantName.trim()) {
      newErrors.restaurantName = 'Введите название заведения';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!form.password) {
      newErrors.password = 'Введите пароль';
    } else if (form.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        restaurantName: form.restaurantName,
        email: form.email,
        password: form.password,
      });

      toast.success('Аккаунт создан! Теперь войдите в систему.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при регистрации');
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
            <h1 className="text-2xl font-bold text-dark mb-2">Создание аккаунта</h1>
            <p className="text-text-secondary">Начните использовать DMR бесплатно</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-semibold text-dark mb-2">
                Название заведения
              </label>
              <input
                id="restaurantName"
                type="text"
                className={`landing-input ${errors.restaurantName ? 'border-red-500' : ''}`}
                placeholder="Ресторан «Вкус»"
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              />
              {errors.restaurantName && (
                <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>
              )}
            </div>

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
                placeholder="Минимум 6 символов"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-dark mb-2">
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`landing-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
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
                'Создать аккаунт'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-accent-dark font-semibold hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Нажимая «Создать аккаунт», вы соглашаетесь с{' '}
          <a href="#" className="text-accent-dark hover:underline">условиями использования</a>
        </p>
      </div>
    </div>
  );
}