
"use client";

import { useCallback, useEffect, useState } from "react";

export default function useShops({
  latitude,
  longitude,
  radiusKm = 5,
  enabled = true,
} = {}) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchShops = useCallback(async () => {
    if (
      !enabled ||
      latitude == null ||
      longitude == null
    ) {
      setShops([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: String(radiusKm),
        page: "1",
        limit: "20",
      });

      const response = await fetch(
        `/api/v1/shops?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch nearby shops."
        );
      }

      const shopData =
        result.data?.shops || result.shops || [];

      setShops(shopData);
      setTotal(
        result.data?.total ?? result.total ?? shopData.length
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setShops([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm, enabled]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return {
    shops,
    loading,
    error,
    total,
    refetch: fetchShops,
  };
}
