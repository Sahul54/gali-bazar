
import { RefreshCw, Truck } from "lucide-react";

export default function StatusHeader({ onRefresh, refreshing }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
          <Truck size={25} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Gali Bazar
          </h1>
          <p className="text-sm text-slate-500">
            Delivery Partner Portal
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin" : ""}
        />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </header>
  );
}
