
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  PackagePlus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Boxes,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Plus,
  Filter,
  X,
  RefreshCw,
  LoaderCircle,
  Upload
} from "lucide-react";

const filters = ["All Products", "Active", "Draft", "Archived"];

const statusStyles = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Products");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/seller/products", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
      setStats(
        data.stats || {
          total: 0,
          active: 0,
          lowStock: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query);

      const matchesStatus =
        activeFilter === "All Products" ||
        product.status === activeFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [products, search, activeFilter]);

  function resetFilters() {
    setSearch("");
    setActiveFilter("All Products");
  }

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Seller</span>
              <span>/</span>
              <span className="font-medium text-gray-900">Products</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Products
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your catalogue, pricing and inventory in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/seller/products/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <Plus size={18} />
              Add Product
            </Link>

            <Link
              href="/seller/bulk-upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              <Upload size={17} />
              Bulk Upload
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Products"
            value={loading ? "…" : stats.total}
            description="Products in your catalogue"
            icon={Package}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Products"
            value={loading ? "…" : stats.active}
            description="Currently active listings"
            icon={Boxes}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Low Stock Items"
            value={loading ? "…" : stats.lowStock}
            description="Products at or below their stock threshold"
            icon={AlertTriangle}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">
                  Product catalogue
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Search and organise your products.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, SKU or category..."
                    aria-label="Search products"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  aria-expanded={showFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3">
                <Filter size={16} className="mr-1 text-gray-500" />

                {filters.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeFilter === filter
                        ? "bg-gray-950 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-auto inline-flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  <X size={14} />
                  Reset
                </button>
              </div>
            )}
          </div>

          {error ? (
            <div className="px-5 py-14 text-center sm:px-10 sm:py-16">
              <AlertTriangle
                size={34}
                className="mx-auto text-red-500"
              />

              <h3 className="mt-4 font-semibold text-gray-950">
                Could not load products
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadProducts}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="px-5 py-16 text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-gray-500"
              />
              <p className="mt-4 text-sm text-gray-500">
                Loading products from database...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-10 sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-600">
                {search ? <Search size={28} /> : <PackagePlus size={28} />}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-950">
                {search
                  ? "No matching products"
                  : activeFilter !== "All Products"
                    ? `No ${activeFilter.toLowerCase()} products`
                    : "Your catalogue starts here"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search
                  ? "Try another product name, SKU or category, or clear your search."
                  : activeFilter !== "All Products"
                    ? "Try another status filter to see your other products."
                    : "Add your first product to manage prices, variants and inventory."}
              </p>

              {search || activeFilter !== "All Products" ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/seller/products/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <Plus size={17} />
                  Create your first product
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">SKU</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={21} />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {product.category?.name || "Uncategorised"}
                                {product.variantCount > 1
                                  ? ` · ${product.variantCount} variants`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          <span className="block max-w-48 truncate">
                            {product.sku}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              product.lowStock
                                ? "font-semibold text-amber-700"
                                : "text-gray-700"
                            }
                          >
                            {product.stock}
                          </span>

                          {product.lowStock && (
                            <p className="mt-1 text-xs text-amber-600">
                              Low stock
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusStyles[product.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-black"
                          >
                            Edit <ArrowUpRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live database data
                </span>
              </div>
            </>
          )}
        </section>

        <div className="flex items-start gap-2 text-xs leading-5 text-gray-400">
          <ArrowUpRight size={14} className="mt-0.5 shrink-0" />
          Stock totals are calculated from product variants. Low-stock alerts
          use each variant's configured threshold.
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
