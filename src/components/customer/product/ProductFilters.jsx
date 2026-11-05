
"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function ProductFilters({
  categories = [],
  filters,
  onFilterChange,
  onReset,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedFilters = {
    categoryId: filters?.categoryId || "",
    minPrice: filters?.minPrice ?? "",
    maxPrice: filters?.maxPrice ?? "",
    inStock: filters?.inStock ?? false,
  };

  function updateFilter(key, value) {
    onFilterChange?.({
      ...selectedFilters,
      [key]: value,
    });
  }

  function resetFilters() {
    onReset?.();
    setMobileOpen(false);
  }

  function renderFilterContent() {
    return (
      <div className="space-y-6">
        {/* Category */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Category
          </h3>

          <select
            value={selectedFilters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <optgroup key={category.id} label={category.name}>
                <option value={category.id}>
                  {category.name}
                </option>

                {category.children?.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Price Range
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              value={selectedFilters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              value={selectedFilters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selectedFilters.inStock}
              onChange={(e) => updateFilter("inStock", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-green-600"
            />

            <span className="text-sm font-medium text-gray-700">
              Show only in-stock products
            </span>
          </label>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={resetFilters}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-green-500 hover:bg-green-50 hover:text-green-600"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-500 lg:hidden"
      >
        <SlidersHorizontal size={17} />
        Filters
      </button>

      {/* Desktop Filters - Parent handles border and background */}
      <aside className="hidden lg:block">
        {/* <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-green-600" />
          <h2 className="font-bold text-gray-900">Filters</h2>
        </div> */}

        {renderFilterContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Product Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-gray-100 p-2 transition hover:bg-gray-200"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {renderFilterContent()}
          </div>
        </div>
      )}
    </>
  );
}
