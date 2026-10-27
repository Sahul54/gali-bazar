
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Store,
  TriangleAlert,
} from "lucide-react";

const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    label: "Not submitted",
    title: "Let's get your store started.",
    description:
      "Complete your business profile to send your application for verification.",
    icon: FileText,
    color: "slate",
  },
  PENDING: {
    label: "Under review",
    title: "Your application is in review.",
    description:
      "Your details have been submitted. Our team is reviewing your application.",
    icon: Clock3,
    color: "amber",
  },
  APPROVED: {
    label: "Approved",
    title: "Welcome to Gali Bazar!",
    description:
      "Your business has been approved. You're ready to continue to your seller dashboard.",
    icon: BadgeCheck,
    color: "emerald",
  },
  REJECTED: {
    label: "Not approved",
    title: "Your application needs attention.",
    description:
      "Your application was not approved. Please contact seller support for guidance.",
    icon: TriangleAlert,
    color: "rose",
  },
};

const STATUS_STEPS = [
  { label: "Profile submitted", description: "Business details received" },
  { label: "Application review", description: "Verification by our team" },
  { label: "Seller approval", description: "Access to your store dashboard" },
];

const STATUS_PROGRESS = {
  NOT_SUBMITTED: 0,
  PENDING: 1,
  APPROVED: 3,
  REJECTED: 1,
};

function getStatusClasses(color) {
  const classes = {
    slate: {
      badge: "bg-slate-100 text-slate-700 ring-slate-200",
      icon: "bg-slate-100 text-slate-700",
      panel: "border-slate-200 bg-slate-50",
      dot: "bg-slate-400",
    },
    amber: {
      badge: "bg-amber-50 text-amber-800 ring-amber-200",
      icon: "bg-amber-100 text-amber-700",
      panel: "border-amber-200 bg-amber-50/70",
      dot: "bg-amber-500",
    },
    emerald: {
      badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
      panel: "border-emerald-200 bg-emerald-50/70",
      dot: "bg-emerald-500",
    },
    rose: {
      badge: "bg-rose-50 text-rose-800 ring-rose-200",
      icon: "bg-rose-100 text-rose-700",
      panel: "border-rose-200 bg-rose-50/70",
      dot: "bg-rose-500",
    },
  };

  return classes[color] || classes.slate;
}

export default function SellerStatusPage() {
  const router = useRouter();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch("/api/v1/seller/status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/seller/login");
          return;
        }

        if (response.status === 403) {
          setError("This page is available to seller accounts only.");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your application status."
          );
        }

        setSeller(data.seller);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const status = seller?.status || "NOT_SUBMITTED";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const colors = getStatusClasses(config.color);
  const progress = STATUS_PROGRESS[status] ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#145c40] text-white shadow-sm">
              <Store size={21} strokeWidth={2.2} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Gali<span className="text-emerald-700">Bazar</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:inline-flex">
              <ShieldCheck size={15} className="text-emerald-700" />
              Seller portal
            </span>

            <button
              type="button"
              onClick={() => fetchStatus(true)}
              disabled={loading || refreshing}
              aria-label="Refresh application status"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Store size={15} />
              <span>Seller portal</span>
              <span>/</span>
              <span className="font-medium text-slate-800">
                Application status
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your store application
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Follow your verification progress and find out what to do next.
            </p>
          </div>

          {seller && !loading && (
            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 sm:self-auto">
              <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
              Application status
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <LoaderCircle
              size={32}
              className="animate-spin text-emerald-700"
            />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading your application...
            </p>
          </div>
        ) : error ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <TriangleAlert size={26} />
            </div>
            <h2 className="mt-5 text-xl font-bold">
              Couldn't load your status
            </h2>
            <p role="alert" className="mt-3 text-sm leading-6 text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#145c40] px-5 py-3 text-sm font-semibold text-white hover:bg-[#104b34] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Try again
            </button>
          </section>
        ) : (
          <>
            {/* Main status card */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[1.5fr_0.9fr]">
                <div className="p-6 sm:p-9 lg:p-10">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colors.icon}`}
                    >
                      <StatusIcon size={27} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${colors.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                        {config.label}
                      </span>

                      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                        {config.title}
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-8 rounded-2xl border p-5 ${colors.panel}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-slate-600">
                        <FileCheck2 size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {status === "APPROVED"
                            ? "You're ready to get started"
                            : status === "PENDING"
                              ? "Nothing else needed right now"
                              : status === "REJECTED"
                                ? "Need help with your application?"
                                : "Your next step"}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">
                          {status === "APPROVED"
                            ? "Open your seller dashboard to continue."
                            : status === "PENDING"
                              ? "Your application has been received. Refresh this page later to check for updates."
                              : status === "REJECTED"
                                ? "Contact seller support to understand the decision and next steps."
                                : "Submit your business information to begin verification."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    {status === "NOT_SUBMITTED" && (
                      <Link
                        href="/seller/register"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145c40] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104b34]"
                      >
                        Complete registration
                        <ArrowRight size={17} />
                      </Link>
                    )}

                    {status === "APPROVED" && (
                      <Link
                        href="/seller/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145c40] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104b34]"
                      >
                        <LayoutDashboard size={17} />
                        Open dashboard
                        <ArrowRight size={17} />
                      </Link>
                    )}

                    {status === "REJECTED" && (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700">
                        <TriangleAlert size={17} />
                        Contact seller support
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fetchStatus(true)}
                      disabled={refreshing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      Refresh status
                    </button>
                  </div>
                </div>

                {/* Progress panel */}
                <aside className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Verification journey
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    Your progress
                  </h3>

                  <div className="mt-7 space-y-0">
                    {STATUS_STEPS.map((step, index) => {
                      const stepNumber = index + 1;
                      const completed = stepNumber < progress;
                      const current =
                        status !== "REJECTED" && stepNumber === progress;

                      return (
                        <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                          {index < STATUS_STEPS.length - 1 && (
                            <div
                              className={`absolute left-[17px] top-9 h-[calc(100%-20px)] w-px ${
                                completed ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                              completed
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : current
                                  ? "border-amber-300 bg-amber-100 text-amber-800"
                                  : "border-slate-200 bg-white text-slate-400"
                            }`}
                          >
                            {completed ? (
                              <Check size={17} />
                            ) : current ? (
                              <Clock3 size={17} />
                            ) : (
                              <span className="text-xs font-semibold">
                                {stepNumber}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 pt-0.5">
                            <p
                              className={`text-sm font-semibold ${
                                completed || current
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {status === "REJECTED" && (
                    <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm font-semibold text-rose-800">
                        Application not approved
                      </p>
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        Contact support for further guidance.
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </section>

            {/* Business details */}
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 size={19} className="text-emerald-700" />
                    <h2 className="text-lg font-bold">Business details</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Information associated with your seller application.
                  </p>
                </div>

                <Store size={22} className="text-slate-300" />
              </div>

              {seller?.isRegistered ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Business name
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Store size={17} className="shrink-0 text-slate-400" />
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {seller.businessName || "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Application status
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusIcon
                        size={17}
                        className="shrink-0 text-slate-500"
                      />
                      <p className="text-sm font-semibold text-slate-900">
                        {config.label}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      No business profile yet
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Your business information will appear here once you
                      submit your registration.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row">
              <p>© {new Date().getFullYear()} Gali Bazar Seller Portal</p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Secure seller account
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
