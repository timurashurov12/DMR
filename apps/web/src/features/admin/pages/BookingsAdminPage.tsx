import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBookingsAdmin,
  updateBookingStatusAdmin,
  type BookingAdminRow,
} from '@/features/admin/lib/api';
import { useRestaurant } from '@/features/admin/context/RestaurantContext';
import { toast } from 'sonner';
import { Eye, X } from 'lucide-react';

const statusLabel: Record<BookingAdminRow['status'], string> = {
  PENDING: 'Новый',
  CONFIRMED: 'Подтверждён',
  CANCELLED: 'Отменён',
};

type OrderLine = { name: string; quantity: number; unitPrice: number };

function parseOrderLines(itemsJson: unknown): OrderLine[] {
  if (!itemsJson || typeof itemsJson !== 'object') return [];
  const o = itemsJson as { lines?: unknown };
  if (!Array.isArray(o.lines)) return [];
  const out: OrderLine[] = [];
  for (const item of o.lines) {
    if (!item || typeof item !== 'object') continue;
    const x = item as Record<string, unknown>;
    const name = typeof x.name === 'string' ? x.name : '';
    const quantity =
      typeof x.quantity === 'number' ? x.quantity : Number(x.quantity);
    const unitPrice =
      typeof x.unitPrice === 'number' ? x.unitPrice : Number(x.unitPrice);
    if (!name || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) continue;
    out.push({ name, quantity, unitPrice });
  }
  return out;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function BookingDetailModal({
  booking,
  onClose,
}: {
  booking: BookingAdminRow;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const lines = parseOrderLines(booking.itemsJson);
  const linesTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card max-h-[min(90vh,720px)] w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-800 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="booking-detail-title" className="text-lg font-semibold text-stone-100">
              Заказ №{booking.orderNumber}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Создан: {new Date(booking.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                booking.status === 'CONFIRMED'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : booking.status === 'CANCELLED'
                    ? 'bg-stone-700/80 text-stone-400'
                    : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {statusLabel[booking.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost rounded-lg p-2"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
              Контакт
            </h3>
            <dl className="space-y-1.5 text-stone-300">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <dt className="text-stone-500 shrink-0">Имя</dt>
                <dd className="min-w-0">{booking.guestName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <dt className="text-stone-500 shrink-0">Телефон</dt>
                <dd>
                  <a href={`tel:${booking.phone}`} className="text-app-accent hover:underline">
                    {booking.phone}
                  </a>
                </dd>
              </div>
              {booking.email ? (
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="text-stone-500 shrink-0">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${booking.email}`}
                      className="text-app-accent hover:underline break-all"
                    >
                      {booking.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
              Время и гости
            </h3>
            <dl className="space-y-1.5 text-stone-300">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <dt className="text-stone-500 shrink-0">Когда</dt>
                <dd>
                  {booking.scheduledAt
                    ? new Date(booking.scheduledAt).toLocaleString('ru-RU')
                    : '—'}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <dt className="text-stone-500 shrink-0">Гостей</dt>
                <dd>{booking.partySize}</dd>
              </div>
            </dl>
          </section>

          {booking.comment ? (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Комментарий
              </h3>
              <p className="whitespace-pre-wrap rounded-lg border border-stone-800 bg-stone-900/50 px-3 py-2 text-stone-300">
                {booking.comment}
              </p>
            </section>
          ) : null}

          {lines.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Позиции заказа
              </h3>
              <div className="overflow-hidden rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-900/60 text-stone-500">
                      <th className="px-3 py-2 font-medium">Наименование</th>
                      <th className="px-3 py-2 font-medium text-right w-16">Кол-во</th>
                      <th className="px-3 py-2 font-medium text-right w-24">Цена</th>
                      <th className="px-3 py-2 font-medium text-right w-28">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const sum = l.quantity * l.unitPrice;
                      return (
                        <tr key={`${l.name}-${i}`} className="border-b border-stone-800/80 last:border-0">
                          <td className="px-3 py-2 text-stone-200">{l.name}</td>
                          <td className="px-3 py-2 text-right text-stone-400">{l.quantity}</td>
                          <td className="px-3 py-2 text-right text-stone-400 tabular-nums">
                            {formatMoney(l.unitPrice)}
                          </td>
                          <td className="px-3 py-2 text-right text-stone-200 tabular-nums">
                            {formatMoney(sum)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-900/40">
                      <td colSpan={3} className="px-3 py-2 text-right font-medium text-stone-400">
                        Итого
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-app-accent tabular-nums">
                        {formatMoney(linesTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          ) : null}

          {booking.receiptText ? (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Текст чека
              </h3>
              <pre className="whitespace-pre-wrap rounded-lg border border-stone-800 bg-stone-950/60 p-3 font-sans text-xs text-stone-400 leading-relaxed">
                {booking.receiptText}
              </pre>
            </section>
          ) : null}

          {booking.departmentsSent ? (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Отправлено в отделы
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const sent = JSON.parse(booking.departmentsSent) as Record<string, boolean>;
                    return Object.entries(sent).map(([dept, ok]) => (
                      <span
                        key={dept}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                          ok
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {ok ? '✓' : '✗'} {dept}
                      </span>
                    ));
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </section>
          ) : null}

          {!booking.receiptText && lines.length === 0 && !booking.comment ? (
            <p className="text-stone-500 text-xs">Дополнительных данных нет.</p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-stone-800 px-5 py-3 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingsAdminPage() {
  const queryClient = useQueryClient();
  const { restaurantId } = useRestaurant();
  const [detailBooking, setDetailBooking] = useState<BookingAdminRow | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', restaurantId],
    queryFn: fetchBookingsAdmin,
    enabled: !!restaurantId,
  });

  const updateMu = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingAdminRow['status'] }) =>
      updateBookingStatusAdmin(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', restaurantId] });
      toast.success('Статус обновлён');
    },
    onError: (e: Error) => toast.error(e.message || 'Ошибка'),
  });

  if (!restaurantId) {
    return (
      <div className="text-stone-400 text-sm">Выберите ресторан в боковой панели.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-stone-400">
        <span className="inline-block w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
        Загрузка…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-stone-100">Заказы и брони</h1>
      {!rows?.length ? (
        <p className="text-stone-500 text-sm">Пока нет заявок.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/50 text-stone-400">
                <th className="px-3 py-2 font-medium w-28">Подробнее</th>
                <th className="px-3 py-2 font-medium">№</th>
                <th className="px-3 py-2 font-medium">Гость</th>
                <th className="px-3 py-2 font-medium">Телефон</th>
                <th className="px-3 py-2 font-medium">Время</th>
                <th className="px-3 py-2 font-medium">Гостей</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium">Создан</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-stone-800/80 hover:bg-stone-900/30">
                    <td className="px-3 py-2 align-middle">
                      <button
                        type="button"
                        title="Подробнее о заказе"
                        onClick={() => setDetailBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:border-app-accent/45 hover:text-app-accent"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Открыть
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-app-accent">{b.orderNumber}</td>
                    <td className="px-3 py-2 text-stone-200">{b.guestName}</td>
                    <td className="px-3 py-2 text-stone-400">{b.phone}</td>
                    <td className="px-3 py-2 text-stone-400 whitespace-nowrap">
                      {b.scheduledAt
                        ? new Date(b.scheduledAt).toLocaleString('ru-RU')
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-stone-400">{b.partySize}</td>
                    <td className="px-3 py-2">
                      <select
                        value={b.status}
                        disabled={updateMu.isPending}
                        onChange={(e) =>
                          updateMu.mutate({
                            id: b.id,
                            status: e.target.value as BookingAdminRow['status'],
                          })
                        }
                        className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-200 text-xs"
                      >
                        {(Object.keys(statusLabel) as BookingAdminRow['status'][]).map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-stone-500 whitespace-nowrap text-xs">
                      {new Date(b.createdAt).toLocaleString('ru-RU')}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detailBooking ? (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      ) : null}
    </div>
  );
}
