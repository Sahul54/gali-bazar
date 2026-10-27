
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/seller/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      // Keep the phone in the URL so the verification page can read it.
      router.push(
        `/seller/verify-otp?phone=${encodeURIComponent(phone)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 md:min-h-[600px] md:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#123d2d] p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

          <Link href="/" className="relative flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-[#123d2d]">
              G
            </span>
            <span className="text-xl font-bold">
              Gali <span className="text-emerald-300">Bazar</span>
            </span>
          </Link>

          <div className="relative my-12">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              SELLER PARTNER PORTAL
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight sm:text-5xl">
              Your local store,
              <br />
              <span className="text-emerald-300">online.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-emerald-50/75 sm:text-base">
              Manage your store, connect with local customers and grow your
              business with Gali Bazar.
            </p>

            <div className="mt-9 space-y-4">
              {[
                "Reach customers in your neighbourhood",
                "Manage your business in one place",
                "Get started with simple OTP login",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300/15 text-sm text-emerald-300">
                    ✓
                  </span>
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-white/45">
            Made for local businesses and communities.
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                📱
              </div>

              <p className="text-sm font-semibold text-emerald-700">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Seller login
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your registered mobile number. We&apos;ll send you an OTP
                to verify your identity.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-slate-700"
                >
                  Mobile number
                </label>

                <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
                    🇮🇳 +91
                  </span>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(event) => {
                      setPhone(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      );
                      setError("");
                    }}
                    maxLength={10}
                    required
                    disabled={loading}
                    className="min-w-0 flex-1 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use the mobile number linked to your seller account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b49] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#12573b] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">NEW TO GALI BAZAR?</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Link
              href="/seller/register"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Register your business
            </Link>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use your registered mobile number
              for account verification.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
