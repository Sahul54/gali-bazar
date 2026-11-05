
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  MapPin,
  Navigation,
  Loader2,
  RefreshCw,
} from "lucide-react";

import  useCustomerLocation  from "@/hooks/customer/useCustomerLocation";
import  useShops  from "@/hooks/customer/useShops";

export default function ShopsPage() {
  const [search, setSearch] = useState("");

  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
  } = useCustomerLocation();

  const {
    shops,
    loading: shopsLoading,
    error: shopsError,
  } = useShops({
    latitude,
    longitude,
    radiusKm: 5,
    page: 1,
    limit: 20,
    enabled: Boolean(latitude && longitude),
  });

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return shops || [];

    return (shops || []).filter((shop) => {
      return (
        shop.businessName?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query) ||
        shop.address?.toLowerCase().includes(query)
      );
    });
  }, [shops, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-green-700">
            Gali Bazar / Shops
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Explore Nearby Shops
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Discover trusted local shops around your neighbourhood.
          </p>
        </div>

        {/* Location */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-3 text-green-700">
              <MapPin size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Find shops near you
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {latitude && longitude
                  ? "Showing shops near your current location."
                  : "Enable location to discover nearby shops."}
              </p>

              {locationError && (
                <p className="mt-2 text-xs text-red-600">
                  {locationError}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {locationLoading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Navigation size={17} />
            )}

            {latitude ? "Refresh Location" : "Use My Location"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-7">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search shops by name or category..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* Shop Count */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Nearby Shops
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {shopsLoading
                ? "Finding shops..."
                : `${filteredShops.length} shops found`}
            </p>
          </div>
        </div>

        {/* Loading */}
        {(locationLoading || shopsLoading) && (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2
              size={35}
              className="animate-spin text-green-600"
            />
          </div>
        )}

        {/* Location not available */}
        {!locationLoading && !latitude && !longitude && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <MapPin
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Location required
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Please enable your location to find nearby shops.
            </p>

            <button
              type="button"
              onClick={getCurrentLocation}
              className="mt-5 rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              Enable Location
            </button>
          </div>
        )}

        {/* Error */}
        {!shopsLoading && shopsError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            {shopsError}
          </div>
        )}

        {/* Shops Grid */}
        {!locationLoading &&
          !shopsLoading &&
          latitude &&
          longitude &&
          !shopsError && (
            <>
              {filteredShops.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredShops.map((shop) => (
                    <Link
                      href={`/shops/${shop.id}`}
                      key={shop.id}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
                    >
                      {/* Shop Image */}
                      <div className="flex h-40 items-center justify-center bg-green-50">
                        <Store
                          size={48}
                          className="text-green-300 transition group-hover:scale-110"
                        />
                      </div>

                      {/* Shop Details */}
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          {shop.category || "Local Shop"}
                        </p>

                        <h3 className="mt-2 line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-green-700">
                          {shop.businessName}
                        </h3>

                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span className="line-clamp-2">
                            {shop.address}
                          </span>
                        </div>

                        {shop.distanceKm !== undefined && (
                          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-semibold text-green-700">
                            <Navigation size={15} />
                            {Number(shop.distanceKm).toFixed(1)} km away
                          </div>
                        )}

                        <div className="mt-4 rounded-lg bg-gray-50 py-2.5 text-center text-sm font-semibold text-gray-700 transition group-hover:bg-green-700 group-hover:text-white">
                          Explore Shop
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                  <Store
                    size={45}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No shops found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Try another search or check nearby locations.
                  </p>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700"
                    >
                      <RefreshCw size={15} />
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
