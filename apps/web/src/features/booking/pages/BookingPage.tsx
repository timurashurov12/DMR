import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createBooking } from '@/shared/lib/api';
import { useLocale } from '@/shared/context/LocaleContext';
import { cartToLines, useCart } from '@/shared/context/CartContext';
import { Loader2, Minus, Plus } from 'lucide-react';

function getCurrencyLabel(localeCode: string): string {
  const base = localeCode.toLowerCase().split('-')[0];
  if (base === 'ru') return 'сум';
  if (base === 'kk') return 'сом';
  if (base === 'uz') return "so'm";
  return 'som';
}

export function BookingPage() {
  const { locale } = useLocale();
  const { cart, setQty, totalSum, clearCart } = useCart();
  const currencyLabel = getCurrencyLabel(locale);

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [comment, setComment] = useState('');

  const mu = useMutation({
    mutationFn: () => {
      const lines = cartToLines(cart);
      return createBooking({
        guestName: guestName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        partySize: partySize || 1,
        comment: comment.trim() || undefined,
        ...(lines.length ? { lines } : {}),
      });
    },
    onSuccess: () => {
      clearCart();
    },
  });

  if (mu.isSuccess && mu.data) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-in">
        <h1 className="text-xl font-semibold text-stone-100 mb-2">Заявка принята</h1>
        <p className="text-fg-muted text-sm mb-4">
          Номер заказа:{' '}
          <span className="text-app-accent font-mono font-medium">{mu.data.orderNumber}</span>
        </p>
        <pre className="text-left text-sm text-stone-300 whitespace-pre-wrap bg-app-panel border border-border rounded-xl p-4 mb-6 overflow-x-auto">
          {mu.data.receiptText}
        </pre>
        <Link to="/" className="text-app-accent text-sm font-medium hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in">
      <h1 className="text-xl font-semibold text-stone-100 mb-2">Онлайн-заказ / бронь</h1>
      <p className="text-fg-muted text-sm mb-2">
        Добавьте блюда в корзину на странице меню, затем укажите контакты — ресторан получит заявку и чек.
      </p>
      <p className="text-sm mb-6">
        <Link to="/" className="text-app-accent hover:underline font-medium">
          ← Перейти к выбору меню
        </Link>
      </p>

      <section className="mb-8 rounded-xl border border-app-accent/30 bg-app-accent/5 p-4">
        <h2 className="text-sm font-medium text-stone-200 mb-3">Корзина</h2>
        {Object.keys(cart).length === 0 ? (
          <p className="text-fg-muted text-sm">
            Пока пусто — выберите раздел на главной и добавьте блюда. Можно оформить только бронь без
            блюд.
          </p>
        ) : (
          <ul className="space-y-3 mb-3">
            {Object.entries(cart).map(([id, l]) => (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-300"
              >
                <span className="min-w-0 flex-1">
                  {l.name}
                  <span className="text-fg-muted"> × </span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Меньше"
                    disabled={l.quantity <= 0}
                    onClick={() => setQty(id, l.name, l.unitPrice, l.quantity - 1)}
                    className="p-1.5 rounded-lg border border-border text-stone-300 hover:bg-stone-800 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center tabular-nums">{l.quantity}</span>
                  <button
                    type="button"
                    aria-label="Больше"
                    onClick={() => setQty(id, l.name, l.unitPrice, l.quantity + 1)}
                    className="p-1.5 rounded-lg border border-border text-stone-300 hover:bg-stone-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="shrink-0 tabular-nums w-full sm:w-auto sm:text-right">
                  {(l.quantity * l.unitPrice).toLocaleString(locale)} {currencyLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-stone-100 font-semibold text-sm border-t border-app-accent/20 pt-3">
          Итого:{' '}
          <span className="text-app-accent">
            {totalSum.toLocaleString(locale)} {currencyLabel}
          </span>
        </p>
      </section>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mu.mutate();
        }}
      >
        <h2 className="text-sm font-medium text-stone-300">Контакты</h2>
        <div>
          <label htmlFor="guestName" className="block text-sm text-fg-muted mb-1">
            Имя <span className="text-red-400">*</span>
          </label>
          <input
            id="guestName"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm text-fg-muted mb-1">
            Телефон <span className="text-red-400">*</span>
          </label>
          <input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-fg-muted mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div>
          <label htmlFor="scheduledAt" className="block text-sm text-fg-muted mb-1">
            Дата и время
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div>
          <label htmlFor="partySize" className="block text-sm text-fg-muted mb-1">
            Количество гостей
          </label>
          <input
            id="partySize"
            type="number"
            min={1}
            max={99}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm text-fg-muted mb-1">
            Комментарий
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-app-panel border border-border text-stone-100 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          />
        </div>
        {mu.isError && (
          <p className="text-sm text-red-400">
            {mu.error instanceof Error ? mu.error.message : 'Не удалось отправить'}
          </p>
        )}
        <button
          type="submit"
          disabled={mu.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
        >
          {mu.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Отправка...
            </>
          ) : (
            'Отправить заявку'
          )}
        </button>
      </form>
      <p className="mt-6 text-center">
        <Link to="/" className="text-sm text-fg-muted hover:text-stone-300">
          ← На главную
        </Link>
      </p>
    </div>
  );
}
