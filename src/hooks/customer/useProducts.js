
"use client";

import { useCallback, useEffect, useState } from "react";

export default function useProducts({
  search = "",
  categoryId = "",
  shopId = "",
  page = 1,
  limit = 20,
  enabled = true,
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (signal) => {
    if (!enabled) {
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const trimmedSearch = search.trim();

      if (trimmedSearch.length >= 2) {
        params.set("search", trimmedSearch);
      }

      if (categoryId) params.set("categoryId", categoryId);
      if (shopId) params.set("shopId", shopId);

      const response = await fetch(
        `/api/v1/products?${params.toString()}`,
        { signal }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch products."
        );
      }

      if (signal?.aborted) return;

      const productData =
        result.data?.products || result.products || [];

      setProducts(productData);
      setTotal(
        result.data?.total ?? result.total ?? productData.length
      );
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message || "Something went wrong.");
      setProducts([]);
      setTotal(0);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [search, categoryId, shopId, page, limit, enabled]);

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    refetch: () => fetchProducts(),
  };
}
