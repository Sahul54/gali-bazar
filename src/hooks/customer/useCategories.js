
"use client";

import { useCallback, useEffect, useState } from "react";

export default function useCategories({ enabled = true } = {}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/categories");

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch categories."
        );
      }

      const categoryData =
        result.data?.categories || result.categories || [];

      setCategories(categoryData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
