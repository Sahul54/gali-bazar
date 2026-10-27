
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

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
        throw new Error(data.message || "Unable to send OTP.");
      }

      sessionStorage.setItem("gali-bazar-phone", phone);

      router.push("/customer/verify-otp");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50/50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/50 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <Phone size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Gali-Bazar
            </h1>
            <p className="text-sm text-gray-500">
              Your neighbourhood marketplace
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back!
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Enter your mobile number to receive a one-time password
          and securely log in.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mobile number
            </label>

            <div className="flex overflow-hidden rounded-xl border border-gray-200 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
              <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-600">
                +91
              </span>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="min-w-0 flex-1 px-4 py-3.5 text-gray-900 outline-none placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Continue with OTP"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-gray-50 p-3.5">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-green-600"
          />
          <p className="text-xs leading-5 text-gray-500">
            Your mobile number helps us keep your account secure.
            We will never display your number publicly.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </main>
  );
}
