
import { RefreshCw } from "lucide-react";

export default function AdminHeader({
  onRefresh,
  refreshing,
  disabled,
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-orange-600">
          ADMINISTRATION
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Delivery Partners
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review and manage delivery partner applications.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60 sm:self-auto"
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </header>
  );
}
