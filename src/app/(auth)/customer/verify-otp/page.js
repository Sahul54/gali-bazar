
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem("gali-bazar-phone");

    if (!savedPhone) {
      router.replace("/customer/login");
      return;
    }

    setPhone(savedPhone);
  }, [router]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      sessionStorage.removeItem("gali-bazar-phone");

      router.replace("/dashboard");;
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to resend OTP.");
      }

      setOtp("");
      setSeconds(30);
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50/50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/50 sm:p-10">
        <button
          type="button"
          onClick={() => router.push("/customer/login")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500 transition hover:text-orange-600"
        >
          <ArrowLeft size={17} />
          Change mobile number
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Verify your number
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Enter the 6-digit OTP sent to your mobile number.
        </p>

        {phone && (
          <p className="mt-3 text-sm font-semibold text-gray-800">
            +91 {phone}
          </p>
        )}

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              One-time password
            </label>

            <input
              ref={inputRef}
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-xl font-semibold tracking-[0.4em] text-gray-900 outline-none transition placeholder:text-sm placeholder:tracking-normal focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !phone}
            className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Didn't receive the OTP?{" "}
          {seconds > 0 ? (
            <span>Resend in {seconds}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !phone}
              className="font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
