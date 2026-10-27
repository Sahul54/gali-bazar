"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Package,
  ShoppingCart,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const initialStats = [
  {
    title: "Pending Sellers",
    value: null,
    description: "Awaiting admin approval",
    Icon: Store,
    href: "/admin/sellers",
    active: true,
  },
  {
    title: "Products",
    value: "—",
    description: "Product management coming soon",
    Icon: Package,
    href: null,
    active: false,
  },
  {
    title: "Orders",
    value: "—",
    description: "Order management coming soon",
    Icon: ShoppingCart,
    href: null,
    active: false,
  },
];

export default function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboardStats() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/admin/sellers", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load dashboard statistics."
        );
      }

      setPendingCount(result.count);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats = initialStats.map((stat) => ({
    ...stat,
    value: stat.title === "Pending Sellers"
      ? pendingCount
      : stat.value,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#F97316]">
            OVERVIEW
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome to your Gali Bazar admin workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardStats}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Could not load dashboard data
            </p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchDashboardStats}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ title, value, description, Icon, href, active }) => {
          const card = (
            <div
              className={`h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${
                active
                  ? "hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#F97316]">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                {active && (
                  <ArrowUpRight
                    size={18}
                    className="text-slate-400"
                  />
                )}
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {title}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {title === "Pending Sellers" && loading
                  ? "..."
                  : value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {description}
              </p>
            </div>
          );

          return href ? (
            <Link key={title} href={href}>
              {card}
            </Link>
          ) : (
            <div key={title}>{card}</div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Seller Applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review local businesses waiting for approval.
            </p>
          </div>

          <Link
            href="/admin/sellers"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Manage Sellers
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#F97316] shadow-sm">
              <Store size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pending approval queue
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {error
                  ? "Dashboard data is unavailable."
                  : loading
                    ? "Loading applications..."
                    : `${pendingCount} application${pendingCount === 1 ? "" : "s"} waiting for review.`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}