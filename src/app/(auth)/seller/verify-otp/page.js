
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SellerVerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      router.replace("/seller/login");
    }
  }, [phone, router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((previous) => {
      const updated = [...previous];
      updated[index] = digit;
      return updated;
    });

    setError("");
    setMessage("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    setOtp(
      Array.from({ length: 6 }, (_, index) => pasted[index] || "")
    );

    setError("");
    setMessage("");

    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const otpValue = otp.join("");

    if (!/^\d{6}$/.test(otpValue)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/seller/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      // Check seller registration and approval status.
      const statusResponse = await fetch("/api/v1/seller/status", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (statusResponse.status === 401) {
        throw new Error(
          "Login session was not created. Please try logging in again."
        );
      }

      if (!statusResponse.ok) {
        throw new Error(
          "Login successful, but seller status could not be loaded. Please try again."
        );
      }

      const statusData = await statusResponse.json();
      const seller = statusData.seller;

      if (!seller?.isRegistered) {
        router.replace("/seller/register");
        return;
      }

      if (seller.status === "APPROVED") {
        router.replace("/seller/dashboard");
        return;
      }

      router.replace("/seller/status");
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

  async function handleResendOtp() {
    setError("");
    setMessage("");
    setResending(true);

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
        throw new Error(data.message || "Unable to resend OTP.");
      }

      setOtp(["", "", "", "", "", ""]);
      setCountdown(30);
      setMessage(data.message || "A new OTP has been requested.");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 md:min-h-[580px] md:grid-cols-2">
        {/* Branding panel */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#123d2d] p-8 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

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
              SECURE SELLER LOGIN
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight sm:text-5xl">
              One quick check.
              <br />
              <span className="text-emerald-300">Then you&apos;re in.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-emerald-50/75 sm:text-base">
              Verify your mobile number to securely access your Gali Bazar
              seller account.
            </p>
          </div>

          <p className="relative text-xs text-white/45">
            Your store journey starts here.
          </p>
        </section>

        {/* OTP form */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <Link
              href="/seller/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
            >
              <span aria-hidden="true">←</span> Change mobile number
            </Link>

            <div className="mb-8 mt-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                🔐
              </div>

              <p className="text-sm font-semibold text-emerald-700">
                OTP VERIFICATION
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Check your phone
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter the 6-digit OTP sent to your mobile number.
              </p>

              <p className="mt-2 font-semibold text-slate-800">
                +91 {phone}
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

            {message && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <label className="text-sm font-semibold text-slate-700">
                Enter verification code
              </label>

              <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`OTP digit ${index + 1}`}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    maxLength={1}
                    disabled={loading}
                    className="h-12 min-w-0 rounded-xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50 sm:h-14"
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Didn&apos;t receive the code?
                </span>

                {countdown > 0 ? (
                  <span className="shrink-0 font-medium text-slate-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || loading}
                    className="shrink-0 font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.some((digit) => !digit)}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b49] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#12573b] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Never share your OTP with anyone. Gali Bazar will never ask you
              to disclose it over a call.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SellerVerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
            <p className="mt-3 text-sm text-slate-500">
              Loading OTP verification...
            </p>
          </div>
        </main>
      }
    >
      <SellerVerifyOtpForm />
    </Suspense>
  );
}
