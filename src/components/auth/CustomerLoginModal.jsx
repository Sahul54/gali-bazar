
"use client";

import { useState } from "react";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  X,
  ArrowLeft,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/v1/auth/customer/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      sessionStorage.setItem("gali-bazar-phone", phone);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      // Use the same verification endpoint and request
      // format as your existing verify-otp page.
      const response = await fetch(
        "/api/v1/auth/customer/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      sessionStorage.removeItem("gali-bazar-phone");

      // Backend should establish the authenticated session
      // before this callback is executed.
      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setPhone("");
    setOtp("");
    setError("");
    setStep("phone");
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-orange-100 bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
          aria-label="Close login modal"
        >
          <X size={19} />
        </button>

        {/* Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Phone size={21} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Gali-Bazar
            </h2>
            <p className="text-xs text-gray-500">
              Your neighbourhood marketplace
            </p>
          </div>
        </div>

        {step === "phone" ? (
          <>
            <h3 className="text-2xl font-bold text-gray-900">
              Welcome back!
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Login or create an account to continue shopping.
            </p>

            <form
              onSubmit={handleSendOtp}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="login-phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mobile number
                </label>

                <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                  <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-600">
                    +91
                  </span>

                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    className="min-w-0 flex-1 px-4 py-3.5 text-sm text-gray-900 outline-none"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue with OTP
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600"
            >
              <ArrowLeft size={16} />
              Change mobile number
            </button>

            <h3 className="text-2xl font-bold text-gray-900">
              Verify OTP
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Enter the verification code sent to +91 {phone}.
            </p>

            <form
              onSubmit={handleVerifyOtp}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="login-otp"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Enter OTP
                </label>

                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
                disabled={loading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-gray-50 p-3.5">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <p className="text-xs leading-5 text-gray-500">
            Your mobile number is safe with us. We never display
            your number publicly.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
