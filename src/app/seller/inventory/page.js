"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Warehouse,
  XCircle,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const INITIAL_SUMMARY = {
  totalProducts: 0,
  totalVariants: 0,
  totalStock: 0,
  totalReserved: 0,
  totalAvailable: 0,
  lowStockVariants: 0,
  outOfStockVariants: 0,
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StockBadge({ quantity, threshold, lowStock, outOfStock }) {
  if (outOfStock) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
        <XCircle size={13} />
        Out of stock
      </span>
    );
  }

  if (lowStock) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <AlertTriangle size={13} />
        Low stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <CheckCircle2 size={13} />
      In stock
    </span>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function SellerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchInventory = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `/api/v1/seller/inventory?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load inventory."
        );
      }

      setProducts(result.products ?? []);
      setSummary(result.summary ?? INITIAL_SUMMARY);
      setPagination(
        result.pagination ?? {
          page,
          limit,
          totalProducts: result.summary?.totalProducts ?? 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message || "Something went wrong.");
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    const controller = new AbortController();

    fetchInventory(controller.signal);

    return () => controller.abort();
  }, [fetchInventory, refreshKey]);

  const categories = Array.from(
    new Map(
      products
        .filter((product) => product.category)
        .map((product) => [
          product.category.id,
          product.category,
        ])
    ).values()
  );

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      product.name?.toLowerCase().includes(searchText) ||
      product.brand?.toLowerCase().includes(searchText) ||
      product.variants?.some((variant) =>
        variant.sku?.toLowerCase().includes(searchText)
      );

    const matchesCategory =
      categoryFilter === "ALL" ||
      product.category?.id === categoryFilter;

    const variants = product.variants ?? [];

    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "LOW" &&
        variants.some((variant) => variant.lowStock)) ||
      (stockFilter === "OUT" &&
        variants.some((variant) => variant.outOfStock)) ||
      (stockFilter === "IN" &&
        variants.some(
          (variant) =>
            !variant.lowStock && !variant.outOfStock
        ));

    return matchesSearch && matchesCategory && matchesStock;
  });

  const startItem =
    pagination.totalProducts === 0
      ? 0
      : (page - 1) * limit + 1;

  const endItem = Math.min(
    page * limit,
    pagination.totalProducts
  );

  function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    setPage(1);
  }

  function handleStockFilterChange(event) {
    setStockFilter(event.target.value);
  }

  function handleCategoryFilterChange(event) {
    setCategoryFilter(event.target.value);
  }

  function handleRefresh() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Warehouse size={16} />
              Seller dashboard
              <span>/</span>
              <span className="font-medium text-gray-700">
                Inventory
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Inventory management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Track product quantities, available stock and
              inventory health from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/seller/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <ShoppingBag size={16} />
              Products
            </Link>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total products"
            value={summary.totalProducts}
            subtitle={`${formatNumber(summary.totalVariants)} variants`}
            icon={Package}
            iconClass="bg-orange-50 text-orange-600"
          />

          <SummaryCard
            title="Available stock"
            value={summary.totalAvailable}
            subtitle={`${formatNumber(summary.totalReserved)} units reserved`}
            icon={Boxes}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Low stock"
            value={summary.lowStockVariants}
            subtitle="Variants to restock"
            icon={AlertTriangle}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Out of stock"
            value={summary.outOfStockVariants}
            subtitle="Variants unavailable"
            icon={CircleAlert}
            iconClass="bg-red-50 text-red-600"
          />
        </section>

        {/* Stock overview */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Stock overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Physical stock compared with reserved stock.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Total stock</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatNumber(summary.totalStock)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reserved</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatNumber(summary.totalReserved)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sellable</p>
                <p className="mt-1 font-semibold text-emerald-700">
                  {formatNumber(summary.totalAvailable)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${
                  summary.totalStock > 0
                    ? Math.min(
                        100,
                        (summary.totalAvailable /
                          summary.totalStock) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {summary.totalStock > 0
              ? `${Math.round(
                  (summary.totalAvailable /
                    summary.totalStock) *
                    100
                )}% of total stock is currently available.`
              : "No stock recorded yet."}
          </p>
        </section>

        {/* Inventory table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Product inventory
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Search products and review stock by SKU.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[650px]">
                <div className="relative sm:col-span-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search name or SKU"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative">
                  <select
                    value={stockFilter}
                    onChange={handleStockFilterChange}
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="ALL">All stock status</option>
                    <option value="IN">In stock</option>
                    <option value="LOW">Low stock</option>
                    <option value="OUT">Out of stock</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="ALL">All categories</option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-red-700">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="self-start text-sm font-semibold text-red-700 underline sm:self-auto"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                size={30}
                className="animate-spin text-orange-500"
              />
              <p className="text-sm text-gray-500">
                Loading inventory...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Inventory could not be displayed.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Package size={26} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                No products found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {search ||
                stockFilter !== "ALL" ||
                categoryFilter !== "ALL"
                  ? "Try changing your search or filters."
                  : "Products will appear here when they are added to your inventory."}
              </p>
              {(search ||
                stockFilter !== "ALL" ||
                categoryFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStockFilter("ALL");
                    setCategoryFilter("ALL");
                  }}
                  className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-4 py-3.5">SKU / Variant</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Total stock</th>
                      <th className="px-4 py-3.5">Reserved</th>
                      <th className="px-4 py-3.5">Available</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Updated</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                      const variants = product.variants ?? [];

                      return variants.length > 0 ? (
                        variants.map((variant, index) => (
                          <tr
                            key={variant.variantId}
                            className="transition hover:bg-gray-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex min-w-[230px] items-center gap-3">
                                {index === 0 ? (
                                  <>
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={
                                          product.imageAlt ||
                                          product.name
                                        }
                                        loading="lazy"
                                        className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <Package size={21} />
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <p className="max-w-[240px] truncate text-sm font-semibold text-gray-900">
                                        {product.name}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-500">
                                        {product.category?.name ||
                                          "Uncategorized"}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-400">
                                        {product.status}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="pl-[60px]">
                                    <p className="text-xs text-gray-500">
                                      {product.name}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-mono text-xs font-semibold text-gray-800">
                                {variant.sku || "—"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {variant.title || "Default"}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-gray-800">
                              {formatPrice(variant.price)}
                            </td>

                            <td className="px-4 py-4">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatNumber(variant.quantity)}
                              </span>
                              <p className="mt-1 text-xs text-gray-400">
                                Threshold:{" "}
                                {formatNumber(
                                  variant.lowStockThreshold
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-600">
                              {formatNumber(
                                variant.reservedQuantity
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`text-sm font-bold ${
                                  variant.outOfStock
                                    ? "text-red-600"
                                    : variant.lowStock
                                      ? "text-amber-600"
                                      : "text-emerald-700"
                                }`}
                              >
                                {formatNumber(
                                  variant.availableStock
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <StockBadge
                                quantity={variant.availableStock}
                                threshold={
                                  variant.lowStockThreshold
                                }
                                lowStock={variant.lowStock}
                                outOfStock={variant.outOfStock}
                              />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                              {formatDate(
                                variant.inventoryUpdatedAt
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr key={product.id}>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {product.category?.name ||
                                "Uncategorized"}
                            </p>
                          </td>
                          <td
                            colSpan={7}
                            className="px-4 py-4 text-sm text-gray-500"
                          >
                            No variants found for this product.
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>
                    Showing{" "}
                    <strong className="font-semibold text-gray-900">
                      {startItem}–{endItem}
                    </strong>{" "}
                    of{" "}
                    <strong className="font-semibold text-gray-900">
                      {formatNumber(pagination.totalProducts)}
                    </strong>{" "}
                    products
                  </span>

                  <span className="hidden text-gray-300 sm:inline">
                    |
                  </span>

                  <label
                    htmlFor="inventory-page-size"
                    className="text-sm text-gray-500"
                  >
                    Rows:
                  </label>

                  <select
                    id="inventory-page-size"
                    value={limit}
                    onChange={handleLimitChange}
                    className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 outline-none focus:border-orange-400"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <PaginationButton
                    disabled={
                      loading || !pagination.hasPreviousPage
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    <ArrowLeft size={15} />
                    Previous
                  </PaginationButton>

                  <span className="min-w-[90px] text-center text-sm text-gray-600">
                    Page{" "}
                    <strong className="text-gray-900">
                      {page}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-gray-900">
                      {Math.max(1, pagination.totalPages)}
                    </strong>
                  </span>

                  <PaginationButton
                    disabled={
                      loading || !pagination.hasNextPage
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                  >
                    Next
                    <ArrowRight size={15} />
                  </PaginationButton>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ArrowDownUp
            size={18}
            className="mt-0.5 shrink-0 text-blue-600"
          />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Inventory calculation
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              Available stock = Total stock − Reserved stock.
              Low-stock alerts use each variant&apos;s configured
              threshold. Orders must be connected to the inventory
              workflow before automatic stock deduction works.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}