
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
  "Grocery",
  "Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Footwear",
  "Books & Stationery",
  "Food & Bakery",
  "Other",
];

const initialForm = {
  businessName: "",
  ownerName: "",
  category: "",
  address: "",
  pincode: "",
};

export default function SellerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));

    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (form.businessName.trim().length < 2) {
      return "Business name must be at least 2 characters.";
    }

    if (form.ownerName.trim().length < 2) {
      return "Please enter the owner's full name.";
    }

    if (!categories.includes(form.category)) {
      return "Please select a valid business category.";
    }

    if (form.address.trim().length < 10) {
      return "Please enter a complete address.";
    }

    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          ownerName: form.ownerName.trim(),
          category: form.category,
          address: form.address.trim(),
          pincode: form.pincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/seller/login");
          return;
        }

        throw new Error(
          data.message || "Unable to submit your business details."
        );
      }

      setSuccess(
        data.message ||
          "Your business registration has been submitted successfully."
      );

      setForm(initialForm);
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

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#123d2d] p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

          <Link href="/" className="relative inline-flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#123d2d]">
              G
            </span>
            <span className="text-xl font-bold tracking-tight">
              Gali <span className="text-emerald-300">Bazar</span>
            </span>
          </Link>

          <div className="relative my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              SELLER PARTNER PROGRAM
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your business.
              <br />
              Your neighbourhood.
              <br />
              <span className="text-emerald-300">More opportunities.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/75 sm:text-base">
              Bring your local store online with Gali Bazar and connect with
              customers in your neighbourhood.
            </p>

            <div className="mt-10 space-y-5">
              {[
                {
                  number: "01",
                  title: "Register your store",
                  description: "Tell us about your business.",
                },
                {
                  number: "02",
                  title: "Get verified",
                  description: "Our team reviews your application.",
                },
                {
                  number: "03",
                  title: "Grow locally",
                  description: "Get ready to serve more customers.",
                },
              ].map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-bold text-emerald-200">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-emerald-50/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-emerald-50/50">
            Built for local businesses. Made for local communities.
          </p>
        </section>

        {/* Registration form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-700">
                SELLER REGISTRATION
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Set up your store
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in your business details to submit your application for
                verification.
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

            {success && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <p className="font-semibold text-emerald-800">
                  Registration submitted!
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  {success}
                </p>
                <Link
                  href="/seller/status"
                  className="mt-3 inline-flex text-sm font-semibold text-emerald-800 underline underline-offset-4"
                >
                  Check application status
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="businessName" className={labelClass}>
                  Business name <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma Grocery Store"
                  className={inputClass}
                  minLength={2}
                  maxLength={100}
                  autoComplete="organization"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="ownerName" className={labelClass}>
                  Owner's full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner's name"
                  className={inputClass}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Business category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`${inputClass} ${
                    !form.category ? "text-slate-400" : ""
                  }`}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select your category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="address" className={labelClass}>
                  Complete business address{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Shop number, street, area, city..."
                  className={`${inputClass} min-h-24 resize-y`}
                  minLength={10}
                  maxLength={300}
                  autoComplete="street-address"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="pincode" className={labelClass}>
                  PIN code <span className="text-red-500">*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  className={inputClass}
                  pattern="[1-9][0-9]{5}"
                  minLength={6}
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b49] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#12573b] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting application...
                  </>
                ) : (
                  <>
                    Submit for verification
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                href="/seller/login"
                className="font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Log in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By submitting, you confirm that your business details are
              accurate and can be reviewed by Gali Bazar.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
