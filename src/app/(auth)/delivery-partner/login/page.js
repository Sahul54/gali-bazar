
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function DeliveryPartnerLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedPhone = phone.trim();

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/v1/auth/delivery-partner/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: normalizedPhone }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setPhone(normalizedPhone);
      setStep("otp");
      setMessage(data.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

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
            phone,
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setMessage("Phone verified successfully.");

      router.replace(data.nextPath || "/delivery-partner/register");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-orange-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-orange-500/70" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600">
              <Truck size={26} />
            </div>
            <div>
              <p className="text-xl font-bold">Gali Bazar</p>
              <p className="text-sm text-orange-100">Delivery Partner</p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
              <Bike size={42} />
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Deliver locally.
              <br />
              Earn confidently.
            </h1>

            <p className="mt-5 max-w-md text-lg leading-8 text-orange-100">
              Join your neighbourhood delivery network and help bring
              everyday essentials to customers nearby.
            </p>

            <div className="mt-8 space-y-4 text-sm text-orange-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                Simple registration process
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                Verified delivery partner accounts
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                Manage deliveries from one dashboard
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-orange-100">
            Your neighbourhood. Your deliveries.
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
                <Truck size={23} />
              </div>
              <div>
                <p className="text-lg font-bold">Gali Bazar</p>
                <p className="text-xs text-slate-500">Delivery Partner</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                {step === "phone" ? (
                  <Phone size={27} />
                ) : (
                  <ShieldCheck size={27} />
                )}
              </div>

              <p className="mb-2 text-sm font-semibold text-orange-600">
                DELIVERY PARTNER PORTAL
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                {step === "phone" ? "Welcome back!" : "Verify your number"}
              </h2>

              <p className="mt-3 leading-6 text-slate-500">
                {step === "phone"
                  ? "Enter your mobile number to sign in or register as a delivery partner."
                  : `Enter the 6-digit OTP sent to +91 ${phone}.`}
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Mobile number
                  </label>

                  <div className="flex h-14 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                    <span className="flex items-center border-r border-slate-200 px-4 text-sm font-medium text-slate-600">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="Enter 10-digit number"
                      className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight size={19} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold"
                  >
                    6-digit OTP
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Enter OTP"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-xl font-bold tracking-[0.5em] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>

                {message && (
                  <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue <ArrowRight size={19} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-orange-600"
                >
                  <ArrowLeft size={17} />
                  Change mobile number
                </button>
              </form>
            )}

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <LockKeyhole size={19} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                Your phone number is used to securely verify your account.
                Registration is subject to admin approval.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Gali Bazar. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}


