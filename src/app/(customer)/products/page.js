
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import useProducts from "@/hooks/customer/useProducts";
import useCategories from "@/hooks/customer/useCategories";
import ProductGrid from "@/components/customer/product/ProductGrid";
import ProductFilters from "@/components/customer/product/ProductFilters";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";

  const initialCategory = searchParams.get("categoryId") || "";

  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch Products
  const {
    products = [],
    loading,
    error,
  } = useProducts({
    search,
    categoryId,
    page: 1,
    limit: 50,
  });

  // Fetch Categories
  const {
    categories = [],
  } = useCategories();

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const variants = (product.variants || []).filter(
        (variant) => variant.isActive !== false
      );

      const prices = variants
        .map((variant) => Number(variant.price))
        .filter(
          (price) => Number.isFinite(price) && price >= 0
        );

      const lowestPrice = prices.length
        ? Math.min(...prices)
        : null;

      const minPrice =
        filters.minPrice !== ""
          ? Number(filters.minPrice)
          : null;

      const maxPrice =
        filters.maxPrice !== ""
          ? Number(filters.maxPrice)
          : null;

      if (
        minPrice !== null &&
        (!Number.isFinite(minPrice) ||
          lowestPrice === null ||
          lowestPrice < minPrice)
      ) {
        return false;
      }

      if (
        maxPrice !== null &&
        (!Number.isFinite(maxPrice) ||
          lowestPrice === null ||
          lowestPrice > maxPrice)
      ) {
        return false;
      }

      if (filters.inStock) {
        const hasStock = variants.some((variant) => {
          const quantity = Number(
            variant.inventory?.quantity || 0
          );

          const reserved = Number(
            variant.inventory?.reservedQuantity || 0
          );

          return quantity - reserved > 0;
        });

        if (!hasStock) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Handle Filters
  function handleFilterChange(nextFilters) {
    setFilters((previous) => ({
      ...previous,
      ...nextFilters,
    }));

    if (nextFilters.categoryId !== undefined) {
      setCategoryId(nextFilters.categoryId);
    }
  }

  // Reset Filters
  function handleResetFilters() {
    setFilters({
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });

    setCategoryId("");
  }

  function handleSearch(event) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-7">
          <p className="text-sm font-medium text-green-700">
            Gali Bazar / Products
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Explore Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Discover products from trusted shops near you.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </form>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[240px_1fr]">

          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5">
              <ProductFilters
                categories={categories}
                selectedCategory={categoryId}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Products */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Products
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {loading
                    ? "Loading products..."
                    : `${filteredProducts.length} products found`}
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                {error}
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                loading={loading}
              />
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilters(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <ProductFilters
              categories={categories}
              selectedCategory={categoryId}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
            >
              Show Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
