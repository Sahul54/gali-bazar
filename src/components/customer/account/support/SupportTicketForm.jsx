
"use client";

import { useState } from "react";
import {
  Send,
  Ticket,
  UserRound,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "Order Issue",
  "Payment & Refund",
  "Delivery Issue",
  "Product Issue",
  "Account Issue",
  "Other",
];

export default function SupportTicketForm({
  user,
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    orderId: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      await onSubmit({
        ...formData,
        orderId: formData.orderId.trim() || null,
      });

      setFormData({
        category: "",
        subject: "",
        orderId: "",
        message: "",
      });
    } catch {
      // Parent handles error notification.
    }
  };

  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <Ticket size={21} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Raise a Support Request
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Tell us about your issue and we'll help you.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
        {/* Customer Details */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-800">
            Your Details
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <UserRound size={18} className="shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Full Name</p>
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user?.name || "Customer"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <Mail size={18} className="shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Email Address</p>
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:col-span-2 lg:col-span-1">
              <Phone size={18} className="shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Phone Number</p>
                <p className="truncate text-sm font-semibold text-gray-800">
                  {user?.phone || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-800">
            Issue Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>
                Issue Category <span className="text-red-500">*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select an issue</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Order ID */}
            <div>
              <label htmlFor="orderId" className={labelClass}>
                Order ID{" "}
                <span className="font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="orderId"
                name="orderId"
                type="text"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="Enter your order ID"
                className={inputClass}
              />
            </div>

            {/* Subject */}
            <div className="sm:col-span-2">
              <label htmlFor="subject" className={labelClass}>
                Subject <span className="text-red-500">*</span>
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Briefly describe your issue"
                maxLength={120}
                required
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>

                <span className="text-xs text-gray-400">
                  {formData.message.length}/2000
                </span>
              </div>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Explain your issue in detail..."
                rows={3}
                minLength={10}
                maxLength={2000}
                required
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-gray-400">
            Our support team will review your request.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
