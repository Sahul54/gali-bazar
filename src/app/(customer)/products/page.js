
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Package,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

import useProducts from "@/hooks/customer/useProducts";
import useCategories from "@/hooks/customer/useCategories";
import ProductGrid from "@/components/customer/product/ProductGrid";
import ProductFilters from "@/components/customer/product/ProductFilters";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = (
    searchParams.get("search") ||
    searchParams.get("q") ||
    ""
  ).trim();

  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || ""
  );

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

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
  const { categories = [] } = useCategories();

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const variants = (product.variants || []).filter(
        (variant) => variant.isActive !== false
      );

      // Price Filter
      const minPrice =
        filters.minPrice !== "" ? Number(filters.minPrice) : null;

      const maxPrice =
        filters.maxPrice !== "" ? Number(filters.maxPrice) : null;

      if (
        minPrice !== null &&
        (!Number.isFinite(minPrice) || minPrice < 0)
      ) {
        return false;
      }

      if (
        maxPrice !== null &&
        (!Number.isFinite(maxPrice) || maxPrice < 0)
      ) {
        return false;
      }

      if (minPrice !== null || maxPrice !== null) {
        const hasMatchingPrice = variants.some((variant) => {
          const price = Number(variant.price);

          if (!Number.isFinite(price)) return false;
          if (minPrice !== null && price < minPrice) return false;
          if (maxPrice !== null && price > maxPrice) return false;

          return true;
        });

        if (!hasMatchingPrice) return false;
      }

      // In-stock Filter
      if (filters.inStock) {
        const hasStock = variants.some((variant) => {
          const availableStock =
            variant.availableStock !== undefined &&
            variant.availableStock !== null
              ? Number(variant.availableStock)
              : Math.max(
                  0,
                  Number(variant.inventory?.quantity || 0) -
                    Number(variant.inventory?.reservedQuantity || 0)
                );

          return Number.isFinite(availableStock) && availableStock > 0;
        });

        if (!hasStock) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Active Filter Count
  const activeFilterCount = [
    filters.minPrice !== "",
    filters.maxPrice !== "",
    filters.inStock,
    Boolean(categoryId),
  ].filter(Boolean).length;

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

  // Clear Search
  function handleClearSearch() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("search");
    params.delete("q");

    const query = params.toString();

    router.push(query ? `/products?${query}` : "/products");
  }

  const pageTitle = search ? "Search Results" : "Explore Products";

  const filterProps = {
    categories,
    filters: { ...filters, categoryId },
    onFilterChange: handleFilterChange,
    onReset: handleResetFilters,
  };

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-4 sm:py-4 lg:px-8">

        {/* Page Heading */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-400">
            <span>Home</span>
            <ArrowRight size={12} />
            <span className="text-green-700">Products</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {pageTitle}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? `Showing products matching "${search}"`
                  : "Discover everyday essentials from trusted local shops."}
              </p>
            </div>

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-green-200 hover:text-green-700"
              >
                <X size={15} />
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={17}
                    className="text-green-700"
                  />
                  <h2 className="font-semibold text-gray-900">
                    Filters
                  </h2>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-green-700 hover:text-green-800"
                  >
                    Reset all
                  </button>
                )}
              </div>

              <div className="p-5">
                <ProductFilters {...filterProps} />
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <section className="min-w-0">

            {/* Results Toolbar */}
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900">
                  {search ? "Matching Products" : "All Products"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {loading
                    ? "Finding products..."
                    : `${filteredProducts.length} products found`}
                </p>
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden">
                <ProductFilters {...filterProps} />
              </div>
            </div>

            {/* Product Results */}
            {error ? (
              <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                <p className="font-semibold text-red-600">
                  Unable to load products
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  <RotateCcw size={15} />
                  Try again
                </button>
              </div>
            ) : !loading && filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <Package size={30} className="text-green-700" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  No products found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  {filters.inStock
                    ? "No in-stock products match your current filters. Try resetting your filters."
                    : search
                      ? `We couldn't find any products matching "${search}". Try another search.`
                      : "Try changing your filters to discover more products."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    if (search) handleClearSearch();
                  }}
                  className="mt-5 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Clear filters
                </button>
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
    </div>
  );
}
