
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  pagination,
  onPageChange,
}) {
  const start =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;

  const end = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-800">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800">
          {pagination.total}
        </span>{" "}
        applications
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="min-w-24 text-center text-sm font-medium text-slate-600">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={
            pagination.page >= pagination.totalPages ||
            pagination.totalPages === 0
          }
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
