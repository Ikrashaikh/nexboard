import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
  const total = Math.max(totalPages, 1);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
      <span className="text-caption">
        {totalElements !== undefined ? `${totalElements} total` : `Page ${page + 1} of ${total}`}
        {totalElements !== undefined && ` · Page ${page + 1} of ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ChevronLeft size={14} aria-hidden="true" /> Prev
        </button>
        <button
          type="button"
          disabled={page >= total - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Next <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
