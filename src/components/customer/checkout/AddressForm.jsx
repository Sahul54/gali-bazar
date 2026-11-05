
"use client";

import { useEffect, useState } from "react";
import { Loader2, X, MapPin } from "lucide-react";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  label: "HOME",
};

export default function AddressForm({
  initialValues = initialForm,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState({
    ...initialForm,
    ...initialValues,
  });

  useEffect(() => {
    setForm({
      ...initialForm,
      ...initialValues,
    });
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });
    } catch (err) {
      setError(err.message || "Unable to save address.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            Add New Address
          </h3>

          {initialValues.address && (
            <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
              <MapPin size={13} />
              Location detected. Please verify your address.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Cancel adding address"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className={labelClass}>
            Full Name *
          </label>

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            maxLength={100}
            autoComplete="name"
            className={inputClass}
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>
            Mobile Number *
          </label>

          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            required
            maxLength={10}
            autoComplete="tel"
            className={inputClass}
          />
        </div>

        {/* Address Type */}
        <div>
          <label className={labelClass}>
            Address Type *
          </label>

          <select
            name="label"
            value={form.label}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Pincode */}
        <div>
          <label className={labelClass}>
            Pincode *
          </label>

          <input
            name="pincode"
            inputMode="numeric"
            value={form.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            required
            maxLength={6}
            autoComplete="postal-code"
            className={inputClass}
          />
        </div>

        {/* Complete Address */}
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Complete Address *
          </label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="House no., building, street, area"
            required
            rows={3}
            maxLength={500}
            autoComplete="street-address"
            className={inputClass}
          />
        </div>

        {/* Landmark */}
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Landmark (Optional)
          </label>

          <input
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Nearby landmark"
            maxLength={150}
            className={inputClass}
          />
        </div>

        {/* City */}
        <div>
          <label className={labelClass}>
            City *
          </label>

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Enter city"
            required
            maxLength={100}
            autoComplete="address-level2"
            className={inputClass}
          />
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>
            State *
          </label>

          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Enter state"
            required
            maxLength={100}
            autoComplete="address-level1"
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <Loader2 size={16} className="animate-spin" />
          )}

          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
}
