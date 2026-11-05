
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Store,
  Package,
  Loader2,
  Search,
  ShoppingBag,
} from "lucide-react";

import ProductGrid from "@/components/customer/product/ProductGrid";

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params.shopId;

  const [shop, setShop] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopId) return;

    const controller = new AbortController();

    async function fetchShop() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/v1/shops/${shopId}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch shop.");
        }

        const shopData =
          result.data?.shop || result.shop || result.data;

        if (!shopData?.id) {
          throw new Error("Shop not found.");
        }

        setShop(shopData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchShop();

    return () => controller.abort();
  }, [shopId]);

  const filteredProducts = useMemo(() => {
    const products = shop?.products || [];
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  }, [shop, search]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={36}
          className="animate-spin text-green-600"
        />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Store size={48} className="mx-auto text-gray-300" />

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Shop not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error || "This shop may no longer be available."}
        </p>

        <Link
          href="/shops"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Browse Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back Navigation */}
        <Link
          href="/shops"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700"
        >
          <ArrowLeft size={17} />
          Back to Shops
        </Link>

        {/* Shop Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-green-50 to-green-100 sm:h-56">
            <Store size={70} className="text-green-300" />
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {shop.category || "Local Shop"}
                </span>

                <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {shop.businessName}
                </h1>

                {shop.ownerName && (
                  <p className="mt-2 text-sm text-gray-500">
                    Owned by {shop.ownerName}
                  </p>
                )}

                <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-green-600" />
                  <span>{shop.address}</span>
                </div>

                {shop.pincode && (
                  <p className="mt-2 text-sm text-gray-500">
                    PIN Code: {shop.pincode}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <Package size={19} />
                {shop.products?.length || 0} Products
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Products from this Shop
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explore products available at {shop.businessName}.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search shop products..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
              <ShoppingBag
                size={45}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No products found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try searching with another product name."
                  : "This shop has no active products right now."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
