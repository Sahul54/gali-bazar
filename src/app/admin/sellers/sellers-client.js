"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Store,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Phone,
  Search,
  Filter,
  X,
  CalendarDays,
  Building2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All Sellers", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function getStatusStyles(status) {
  switch (status) {
    case "APPROVED":
      return "bg-green-50 text-green-700 border-green-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");

  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search so the API isn't called on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (status) {
        params.set("status", status);
      }

      if (search) {
        params.set("search", search);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/v1/admin/sellers${query ? `?${query}` : ""}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load seller applications."
        );
      }

      setSellers(result.sellers ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  async function updateStatus(seller, nextStatus) {
    const action = nextStatus === "APPROVED" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${seller.businessName}?`
      )
    ) {
      return;
    }

    setUpdatingId(seller.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/v1/admin/sellers/${encodeURIComponent(seller.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update seller status."
        );
      }

      setNotice(
        `${seller.businessName} ${nextStatus.toLowerCase()} successfully.`
      );

      // Reload current filters so the updated status is reflected.
      await fetchSellers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function clearFilters() {
    setStatus("");
    setSearchInput("");
    setSearch("");
  }

  const hasFilters = Boolean(status || searchInput.trim());

  const pageTitle = status
    ? STATUS_OPTIONS.find((option) => option.value === status)?.label
    : "All Sellers";

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#F97316]">
            MARKETPLACE MANAGEMENT
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Seller Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search businesses and manage their applications.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSellers}
          disabled={loading || updatingId !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#F97316]">
              <Store size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                {status ? `${pageTitle} Applications` : "Matching Sellers"}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "..." : sellers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Filter size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Current View</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {loading
                  ? "Loading..."
                  : `${sellers.length} result${sellers.length === 1 ? "" : "s"} found`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <div>
            <label
              htmlFor="seller-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search sellers
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="seller-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Business name or phone..."
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
              />

              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="seller-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="seller-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={16} />
            Clear filters
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Search runs automatically. Choose a status to filter the list.
        </p>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Could not complete the request
            </p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchSellers}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      {/* Seller list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">
              {status ? pageTitle : "All Businesses"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review business details and manage application status.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <Store size={14} />
            {loading ? "Loading..." : `${sellers.length} sellers`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading seller applications...
          </div>
        ) : error && sellers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Seller data is unavailable. Please try again.
          </div>
        ) : sellers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316]">
              {hasFilters ? <Search size={25} /> : <CheckCircle2 size={26} />}
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters
                ? "No matching sellers found"
                : status === "PENDING"
                  ? "No pending applications"
                  : "No sellers found"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {hasFilters
                ? "Try a different search term or status filter."
                : "Seller applications will appear here when available."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-[#C2410C] hover:bg-orange-100"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sellers.map((seller) => {
              const isPending = seller.status === "PENDING";
              const isUpdating = updatingId === seller.id;

              return (
                <article
                  key={seller.id}
                  className="flex flex-col gap-5 p-5 transition hover:bg-slate-50/60 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F97316]">
                      <Building2 size={22} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-slate-900">
                        {seller.businessName}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} />
                          {seller.user?.phone || "Phone unavailable"}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Applied {formatDate(seller.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(seller.status)}`}
                      >
                        {seller.status === "APPROVED" ? (
                          <CheckCircle2 size={13} />
                        ) : seller.status === "REJECTED" ? (
                          <XCircle size={13} />
                        ) : (
                          <Clock3 size={13} />
                        )}

                        {seller.status}
                      </span>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                      <button
                        type="button"
                        onClick={() => updateStatus(seller, "REJECTED")}
                        disabled={updatingId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        {isUpdating ? "Processing..." : "Reject"}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(seller, "APPROVED")}
                        disabled={updatingId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 size={17} />
                        {isUpdating ? "Processing..." : "Approve"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      No action available
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}