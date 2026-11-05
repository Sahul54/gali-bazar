
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import ProductGridSkeleton from "@/components/common/skeletons/ProductGridSkeleton";

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPopularProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/v1/products/popular?limit=20"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load popular products."
          );
        }

        if (isMounted) {
          setProducts(result.data?.products || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPopularProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Explore our collection
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#0b1c30] sm:text-2xl">
            Popular Local Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Discover popular products from your neighbourhood shops.
          </p>
        </div>

        <Link
          href="/products"
          className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          View All →
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && <ProductGridSkeleton count={6} />}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">
            {error.message || "Unable to load popular products."}
          </p>
        </div>
      )}

      {/* Products */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {products.slice(0, 20).map((product, index) => (
            <ProductCard
              key={product.id || product._id || index}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-green-200 bg-white px-5 py-12 text-center">
          <h3 className="text-base font-bold text-[#0b1c30]">
            No popular products yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Popular products from local shops will appear here.
          </p>

          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Explore Products
          </Link>
        </div>
      )}
    </section>
  );
}
