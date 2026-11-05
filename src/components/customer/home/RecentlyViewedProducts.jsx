
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, LoaderCircle } from "lucide-react";

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
          : `guest-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    console.error("Guest session error:", error);
    return null;
  }
}

export default function RecentlyViewedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const fetchRecentlyViewed = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const sessionId = getGuestSessionId();

      if (!sessionId) {
        throw new Error("Unable to access guest session.");
      }

      const params = new URLSearchParams({
        limit: "8",
        sessionId,
      });

      const response = await fetch(
        `/api/v1/products/recently-viewed?${params.toString()}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load recently viewed products."
        );
      }

      const recentlyViewed = result.data?.products;

      if (!Array.isArray(recentlyViewed)) {
        throw new Error("Invalid recently viewed API response.");
      }

      console.log("Recently Viewed API Response:", {
        count: result.data?.count,
        products: recentlyViewed,
        sessionId,
      });

      if (currentRequestId === requestIdRef.current) {
        setProducts(recentlyViewed);
      }
    } catch (err) {
      console.error("Recently Viewed Error:", err);

      if (currentRequestId === requestIdRef.current) {
        setError(err.message || "Something went wrong.");
        setProducts([]);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRecentlyViewed();
  }, [fetchRecentlyViewed]);

  // Loading
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Pick up where you left off
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#0b1c30] sm:text-2xl">
            Recently Viewed
          </h2>
        </div>

        <ProductGridSkeleton count={6} />
      </section>
    );
  }

  // Error
  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchRecentlyViewed}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Empty State
  if (products.length === 0) {
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

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
