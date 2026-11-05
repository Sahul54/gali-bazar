
"use client";

import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import ProductGridSkeleton from "@/components/common/skeletons/ProductGridSkeleton";

const GUEST_SESSION_KEY = "gali_bazar_guest_session";

function getGuestSessionId() {
  try {
    let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    }

    return sessionId;
  } catch {
    return null;
  }
}

export default function RecentlyViewedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentlyViewed() {
      try {
        setLoading(true);
        setError(null);

        const sessionId = getGuestSessionId();

        if (!sessionId) {
          throw new Error("Unable to access guest session.");
        }

        const params = new URLSearchParams({
          limit: "8",
          sessionId,
        });

        const response = await fetch(
          `/api/v1/products/recently-viewed?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load recently viewed products."
          );
        }

        if (isMounted) {
          setProducts(result.data?.products || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRecentlyViewed();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide section if there are no products or an error occurs.
  if (!loading && (error || products.length === 0)) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-green-700">
          Pick up where you left off
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-[#0b1c30] sm:text-2xl">
          Recently Viewed
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Products you explored recently.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && <ProductGridSkeleton count={6} />}

      {/* Products */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}
