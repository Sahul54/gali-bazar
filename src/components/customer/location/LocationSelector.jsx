
"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { useLocationContext } from "@/context/customer/LocationContext";

export default function LocationSelector({ onClose }) {
  const {
    selectedLocation,
    selectLocation,
    detectCurrentLocation,
    isChecking,
    error,
  } = useLocationContext();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Search area, city or pincode.
  async function handleSearch(event) {
    event.preventDefault();

    const value = query.trim();

    if (value.length < 3) {
      setSearchError("Enter at least 3 characters.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");
      setResults([]);

      const params = new URLSearchParams({
        q: value,
        format: "jsonv2",
        addressdetails: "1",
        limit: "6",
        countrycodes: "in",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to search locations.");
      }

      const data = await response.json();

      const locations = data
        .map((item) => {
          const address = item.address || {};

          return {
            id: item.place_id,
            latitude: Number(item.lat),
            longitude: Number(item.lon),
            pincode: address.postcode?.replace(/\s/g, "") || "",
            city:
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              "",
            area:
              address.suburb ||
              address.neighbourhood ||
              address.residential ||
              address.road ||
              "",
            label: item.name || address.suburb || address.city || "Location",
            displayName: item.display_name,
          };
        })
        .filter(
          (item) =>
            item.pincode &&
            /^[1-9][0-9]{5}$/.test(item.pincode) &&
            Number.isFinite(item.latitude) &&
            Number.isFinite(item.longitude)
        );

      setResults(locations);

      if (!locations.length) {
        setSearchError("No serviceable location details found. Try another area or pincode.");
      }
    } catch (err) {
      setSearchError(err.message || "Location search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  // Select searched location.
  async function handleSelect(location) {
    const success = await selectLocation(location);

    if (success) {
      onClose?.();
    }
  }

  // Detect current location.
  async function handleDetectLocation() {
    const success = await detectCurrentLocation();

    if (success) {
      onClose?.();
    }
  }

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Select your location
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Find products available near you.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close location selector"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
        {/* Current location */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isChecking}
          className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-left transition hover:bg-green-100 disabled:opacity-60"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
            {isChecking ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Navigation size={20} />
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-green-800">
              Use current location
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Detect your location using GPS
            </p>
          </div>
        </button>

        {/* Manual search */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-800">
            Search your area or pincode
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-green-600">
              <Search size={18} className="shrink-0 text-gray-400" />

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Area, city or pincode"
                className="h-12 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || query.trim().length < 3}
              className="rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </form>
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Search results
            </p>

            <div className="space-y-2">
              {results.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  disabled={isChecking}
                  onClick={() => handleSelect(location)}
                  className="flex w-full items-start gap-3 rounded-xl border border-gray-200 p-3 text-left transition hover:border-green-400 hover:bg-green-50 disabled:opacity-50"
                >
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-green-700"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {location.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {location.displayName}
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-600">
                      Pincode: {location.pincode}
                    </p>
                  </div>

                  {selectedLocation?.pincode === location.pincode &&
                    selectedLocation?.latitude === location.latitude &&
                    selectedLocation?.longitude === location.longitude && (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-green-700"
                      />
                    )}
                </button>
              ))}
            </div>
          </div>
        )}

        {(searchError || error) && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {searchError || error}
          </p>
        )}

        {selectedLocation && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-800">
              SELECTED LOCATION
            </p>

            <p className="mt-1 text-sm font-bold text-gray-900">
              {selectedLocation.area || selectedLocation.label},{" "}
              {selectedLocation.city}
            </p>

            <p className="mt-1 text-xs text-gray-600">
              {selectedLocation.pincode}
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Product availability depends on your selected location.
        </p>
      </div>
    </div>
  );
}
