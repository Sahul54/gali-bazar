
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import StatusHeader from "./components/StatusHeader";
import ApplicationStatusCard from "./components/ApplicationStatusCard";
import SubmittedInformation from "./components/SubmittedInformation";

export default function DeliveryPartnerStatusPage() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          "/api/v1/delivery-partner/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await response.json().catch(() => null);

        if (response.status === 401) {
          router.replace("/delivery-partner/login");
          return;
        }

        if (
          response.status === 404 &&
          result?.message ===
            "Delivery partner profile has not been submitted yet."
        ) {
          router.replace("/delivery-partner/register");
          return;
        }

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Unable to load application status."
          );
        }

        setData(result);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-orange-600"
            size={36}
          />
          <p className="mt-4 text-sm text-slate-500">
            Loading your application...
          </p>
        </div>
      </main>
    );
  }

  const profile = data?.profile;
  const user = data?.user;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <StatusHeader
          onRefresh={() => loadProfile(true)}
          refreshing={refreshing}
        />

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-white p-6 text-center sm:p-10">
            <AlertCircle className="mx-auto text-red-500" size={40} />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load status
            </h2>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => loadProfile(true)}
              disabled={refreshing}
              className="mt-6 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              Try again
            </button>
          </section>
        ) : profile ? (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <ApplicationStatusCard
                profile={profile}
                onDashboard={() =>
                  router.push("/delivery-partner/dashboard")
                }
                onReapply={() =>
                  router.push("/delivery-partner/reapply")
                }
              />

              <div className="border-t border-slate-100">
                <SubmittedInformation
                  user={user}
                  profile={profile}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={17} />
              Your application details are private and secure.
            </div>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <AlertCircle className="mx-auto text-slate-400" size={36} />
            <p className="mt-3 font-medium text-slate-700">
              Application information is unavailable.
            </p>
            <button
              type="button"
              onClick={() => loadProfile(true)}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"
            >
              Try again
            </button>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Gali Bazar
        </p>
      </div>
    </main>
  );
}
