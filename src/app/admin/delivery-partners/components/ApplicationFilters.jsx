
import { Search } from "lucide-react";
import { FILTERS } from "./constants";

export default function ApplicationFilters({
  searchInput,
  setSearchInput,
  onSearch,
  status,
  onFilterChange,
}) {
  return (
    <div className="border-b border-slate-200 p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Applications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search by partner name, phone or vehicle number.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex w-full gap-2 xl:max-w-md">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search applications..."
              aria-label="Search delivery partners"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.value || "ALL"}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              status === filter.value
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
