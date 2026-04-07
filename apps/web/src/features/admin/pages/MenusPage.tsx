import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMenusAdmin,
  createMenu,
  updateMenu,
  deleteMenu,
} from '@/features/admin/lib/api';
import { useRestaurant } from '@/features/admin/context/RestaurantContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function MenusPage() {
  const queryClient = useQueryClient();
  const { restaurantId, isLoading: restaurantLoading } = useRestaurant();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['admin', 'menus', restaurantId],
    queryFn: fetchMenusAdmin,
    enabled: !!restaurantId,
  });

  const createMu = useMutation({
    mutationFn: () => createMenu({ name: name.trim() || 'Новое меню' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menus'] });
      setName('');
      toast.success('Меню создано');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMu = useMutation({
    mutationFn: ({ id, n }: { id: string; n: string }) =>
      updateMenu(id, { name: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menus'] });
      setEditingId(null);
      toast.success('Сохранено');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMu = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menus'] });
      toast.success('Удалено');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (restaurantLoading || !restaurantId) {
    return <p className="text-stone-400">Загрузка…</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-stone-100">Меню</h1>
        <p className="text-sm text-fg-subtle mt-1">
          Несколько меню на ресторан (например основное и бар). Типы меню привязаны к выбранному меню.
        </p>
      </div>

      <div className="card p-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-sm text-stone-400">Название нового меню</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark w-full"
            placeholder="Например: Летнее меню"
          />
        </div>
        <button
          type="button"
          onClick={() => createMu.mutate()}
          disabled={createMu.isPending}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-stone-400">Загрузка…</p>
        ) : menus.length === 0 ? (
          <p className="p-6 text-stone-400">Нет меню — создайте первое.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-stone-500">
                <th className="p-3 font-medium">Название</th>
                <th className="p-3 font-medium w-24">Порядок</th>
                <th className="p-3 font-medium w-32">Активно</th>
                <th className="p-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {menus.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="p-3 text-stone-200">
                    {editingId === m.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-dark text-sm"
                      />
                    ) : (
                      m.name
                    )}
                  </td>
                  <td className="p-3 text-stone-400">{m.sortOrder}</td>
                  <td className="p-3">{m.isActive ? 'да' : 'нет'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {editingId === m.id ? (
                        <button
                          type="button"
                          className="btn-primary text-xs px-2 py-1"
                          onClick={() =>
                            updateMu.mutate({ id: m.id, n: editName })
                          }
                          disabled={updateMu.isPending}
                        >
                          OK
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost p-2"
                          title="Редактировать"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditName(m.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost p-2 text-red-400"
                        title="Удалить"
                        onClick={() => {
                          if (confirm('Удалить меню и все связанные типы/категории/блюда?'))
                            deleteMu.mutate(m.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
