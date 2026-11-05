
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

  const fetchProducts = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (categoryId) params.set("categoryId", categoryId);
      if (shopId) params.set("shopId", shopId);

      const response = await fetch(
        `/api/v1/products?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch products."
        );
      }

      const productData =
        result.data?.products || result.products || [];

      setProducts(productData);
      setTotal(
        result.data?.total ?? result.total ?? productData.length
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, shopId, page, limit, enabled]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    refetch: fetchProducts,
  };
}
