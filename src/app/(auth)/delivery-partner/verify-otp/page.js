
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

export default function DeliveryPartnerVerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/v1/auth/delivery-partner/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            phone: phone.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      router.replace(data.nextPath || "/delivery-partner/register");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <button
          type="button"
          onClick={() => router.push("/delivery-partner/login")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600"
        >
          <ArrowLeft size={17} />
          Back to login
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Verify your mobile number
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter your registered mobile number and the 6-digit OTP
          you received.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mobile number
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10-digit mobile number"
              required
              className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              One-time password
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              required
              className="h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
