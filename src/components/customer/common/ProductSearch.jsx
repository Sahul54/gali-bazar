
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, LoaderCircle } from "lucide-react";

export default function ProductSearch() {
  const router = useRouter();

  const containerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setProducts([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function fetchSuggestions() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          search: debouncedSearch,
          page: "1",
          limit: "6",
        });

        const response = await fetch(
          `/api/v1/products?${params.toString()}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to fetch suggestions."
          );
        }

        if (!controller.signal.aborted) {
          setProducts(
            result.data?.products || result.products || []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load suggestions.");
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSuggestions();

    return () => controller.abort();
  }, [debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setIsOpen(false);

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  function handleProductSelect(product) {
    setIsOpen(false);
    setSearch("");
    setProducts([]);

    router.push(`/products/${product.id}`);
  }

  function handleClear() {
    setSearch("");
    setDebouncedSearch("");
    setProducts([]);
    setError("");
    setIsOpen(false);
  }

  const showDropdown =
    isOpen && search.trim().length >= 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, brands..."
            autoComplete="off"
            maxLength={100}
            aria-label="Search products"
            aria-expanded={showDropdown}
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-20 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
          />

          {search && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-12 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            >
              <X size={17} />
            </button>
          )}

          <button
            type="submit"
            disabled={!search.trim()}
            className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 items-center justify-center rounded-lg bg-green-700 px-3 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">

          {loading && (
            <div className="flex items-center justify-center gap-2 p-5 text-sm text-gray-500">
              <LoaderCircle size={17} className="animate-spin" />
              Searching products...
            </div>
          )}

          {!loading && error && (
            <p className="p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="py-2">
              {products.map((product) => {
                const price = product.variants
                  ?.filter((variant) => variant.isActive !== false)
                  .map((variant) => Number(variant.price))
                  .filter(Number.isFinite);

                const lowestPrice = price?.length
                  ? Math.min(...price)
                  : null;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-green-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0]?.imageUrl ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {product.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {product.brand || product.category?.name || "Local Product"}
                      </p>
                    </div>

                    {lowestPrice !== null && (
                      <span className="shrink-0 text-sm font-bold text-gray-900">
                        ₹{lowestPrice.toFixed(0)}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-1 w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                View all results for "{search.trim()}"
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="p-5 text-center">
              <Package
                size={25}
                className="mx-auto mb-2 text-gray-300"
              />
              <p className="text-sm font-medium text-gray-700">
                No products found
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Try another product or brand.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
