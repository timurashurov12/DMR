import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDepartmentsAdmin,
  createDepartmentAdmin,
  updateDepartmentAdmin,
  deleteDepartmentAdmin,
  type DepartmentDto,
} from '@/features/admin/lib/api';
import { useRestaurant } from '@/features/admin/context/RestaurantContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Printer, Send, Check, X } from 'lucide-react';

const typeLabel: Record<DepartmentDto['type'], string> = {
  KITCHEN: 'Кухня',
  RECEPTION: 'Ресепшн',
  BAR: 'Бар',
};

function DepartmentForm({
  department,
  onClose,
  onSave,
}: {
  department?: DepartmentDto;
  onClose: () => void;
  onSave: (data: {
    name: string;
    type: DepartmentDto['type'];
    telegramChatId?: string;
    printerIp?: string;
    printerPort?: number;
    isActive?: boolean;
    sortOrder?: number;
  }) => void;
}) {
  const [name, setName] = useState(department?.name || '');
  const [type, setType] = useState<DepartmentDto['type']>(
    department?.type || 'KITCHEN',
  );
  const [telegramChatId, setTelegramChatId] = useState(
    department?.telegramChatId || '',
  );
  const [printerIp, setPrinterIp] = useState(department?.printerIp || '');
  const [printerPort, setPrinterPort] = useState(
    department?.printerPort?.toString() || '',
  );
  const [isActive, setIsActive] = useState(department?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Введите название');
      return;
    }
    onSave({
      name: name.trim(),
      type,
      telegramChatId: telegramChatId.trim() || undefined,
      printerIp: printerIp.trim() || undefined,
      printerPort: printerPort ? parseInt(printerPort, 10) : undefined,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Название
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          placeholder="Кухня"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Тип</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DepartmentDto['type'])}
          className="w-full rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
        >
          <option value="KITCHEN">Кухня</option>
          <option value="RECEPTION">Ресепшн</option>
          <option value="BAR">Бар</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Telegram Chat ID
        </label>
        <input
          type="text"
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          className="w-full rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
          placeholder="123456789"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            IP принтера
          </label>
          <input
            type="text"
            value={printerIp}
            onChange={(e) => setPrinterIp(e.target.value)}
            className="w-full rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
            placeholder="192.168.1.100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">
            Порт
          </label>
          <input
            type="number"
            value={printerPort}
            onChange={(e) => setPrinterPort(e.target.value)}
            className="w-full rounded-lg bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-app-accent/40"
            placeholder="9100"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded bg-stone-900 border-stone-700"
        />
        <label htmlFor="isActive" className="text-sm text-stone-300">
          Активен
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-app-accent text-white rounded-lg hover:bg-app-accent/90 transition-colors"
        >
          <Check className="w-4 h-4" />
          Сохранить
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Отмена
        </button>
      </div>
    </form>
  );
}

export function DepartmentsPage() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DepartmentDto | null>(null);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['admin', 'departments', restaurantId],
    queryFn: fetchDepartmentsAdmin,
    enabled: !!restaurantId,
  });

  const createMut = useMutation({
    mutationFn: createDepartmentAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      setShowForm(false);
      toast.success('Отдел добавлен');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateDepartmentAdmin>[1];
    }) => updateDepartmentAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      setEditing(null);
      toast.success('Отдел обновлён');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDepartmentAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      toast.success('Отдел удалён');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSave = (data: Parameters<typeof createDepartmentAdmin>[0]) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data });
    } else {
      createMut.mutate(data);
    }
  };

  if (!restaurantId) {
    return (
      <div className="text-center text-stone-500 py-10">
        Выберите ресторан в настройках
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Отделы</h1>
          <p className="text-stone-500 mt-1">
            Кухня, ресепшн, бар — для печати чеков
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-app-accent text-white rounded-lg hover:bg-app-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить отдел
        </button>
      </div>

      {(showForm || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md m-4 shadow-2xl border border-stone-700">
            <h2 className="text-lg font-semibold text-stone-100 mb-4">
              {editing ? 'Редактировать отдел' : 'Новый отдел'}
            </h2>
            <DepartmentForm
              department={editing || undefined}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-stone-500 py-10">Загрузка...</div>
      ) : departments.length === 0 ? (
        <div className="text-center text-stone-500 py-10">
          Нет отделов. Добавьте кухню, ресепшн или бар.
        </div>
      ) : (
        <div className="grid gap-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-lg border border-stone-700/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-200">{dept.name}</span>
                  {!dept.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-stone-700 text-stone-400 rounded">
                      Неактивен
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    {typeLabel[dept.type]}
                  </span>
                  {dept.telegramChatId && (
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Telegram
                    </span>
                  )}
                  {dept.printerIp && (
                    <span className="flex items-center gap-1">
                      <Printer className="w-3 h-3" />
                      {dept.printerIp}:{dept.printerPort}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(dept)}
                  className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Удалить отдел?')) {
                      deleteMut.mutate(dept.id);
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}