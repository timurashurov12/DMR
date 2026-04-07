import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/shared/context/LocaleContext';
import { fetchMenuTypes } from '@/shared/lib/api';

export function HomePage() {
  const { locale } = useLocale();
  const { data: menuTypes, isLoading } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-in">
        <div className="h-6 w-48 mx-auto bg-ayvan-panel rounded animate-pulse mb-2" />
        <div className="h-4 w-64 mx-auto bg-ayvan-panel/70 rounded animate-pulse mb-10" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-ayvan-panel rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in">
      <h2 className="text-stone-100 text-center text-xl font-medium mb-2">
        Выберите меню
      </h2>
      <p className="text-fg-muted text-center text-sm mb-10">
        Выберите раздел, чтобы посмотреть блюда и цены
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {menuTypes?.map((type) => (
          <Link
            key={type.id}
            to={`/menu/${type.id}`}
            className="block p-6 rounded-xl bg-ayvan-panel border border-border text-center font-medium text-lg text-stone-100 shadow-card hover:border-ayvan-accent/45 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayvan-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ayvan-bg-dark"
          >
            {type.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
