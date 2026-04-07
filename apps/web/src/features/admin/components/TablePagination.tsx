import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const result: (number | 'ellipsis')[] = [1];
  if (currentPage > 3) result.push('ellipsis');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  if (currentPage < totalPages - 2) result.push('ellipsis');
  if (totalPages > 1) result.push(totalPages);
  return result;
}

type Props = {
  currentPage: number;
  totalPages: number;
  total: number;
  start: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function TablePagination({
  currentPage,
  totalPages,
  total,
  start,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const end = Math.min(start + pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-border bg-app-bg/40">
      <div className="flex items-center gap-3 text-sm text-stone-400">
        <span>
          Показано {start + 1}–{end} из {total}
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="input-dark w-auto py-1.5 text-sm"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n} на странице
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-ghost p-2 disabled:opacity-30 disabled:pointer-events-none rounded-lg"
          title="Назад"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0.5">
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-stone-500">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[2rem] h-8 px-2 text-sm font-medium rounded-lg ${
                  p === currentPage
                    ? 'bg-app-accent text-app-bg'
                    : 'text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-ghost p-2 disabled:opacity-30 disabled:pointer-events-none rounded-lg"
          title="Вперёд"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-stone-600">
          <span className="text-xs text-stone-500 whitespace-nowrap">Стр.</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) onPageChange(Math.max(1, Math.min(v, totalPages)));
            }}
            className="input-dark w-14 py-1 text-center text-sm"
          />
          <span className="text-xs text-stone-500">из {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
