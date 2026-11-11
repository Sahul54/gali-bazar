
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Phone,
  MapPin,
  Building2,
  Navigation,
  Map,
  Tag,
  Loader2,
  Save,
  X,
  Star,
} from "lucide-react";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  label: "HOME",
  isDefault: false,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

export default function AddressForm({
  initialValues = EMPTY_ADDRESS,
  onSubmit,
  onCancel,
  saving = false,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    ...EMPTY_ADDRESS,
    ...initialValues,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      ...EMPTY_ADDRESS,
      ...initialValues,
    });
    setError("");
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
    };

    if (!data.fullName || !data.phone || !data.address) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(data.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      !data.city ||
      !data.state ||
      !/^\d{6}$/.test(data.pincode)
    ) {
      setError("Please enter valid city, state and 6-digit pincode.");
      return;
    }

    try {
      setError("");
      await onSubmit(data);
    } catch (err) {
      setError(err.message || "Unable to save address.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Form Heading */}
      <div>
        <h3 className="text-base font-bold text-gray-900">
          {isEditing ? "Edit Address" : "Add New Address"}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Enter your delivery details below.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <UserRound
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            className={`${inputClass} pl-11`}
            disabled={saving}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Mobile Number <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Phone
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={formData.phone}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "phone",
                  value: e.target.value.replace(/\D/g, ""),
                },
              })
            }
            placeholder="10-digit mobile number"
            className={`${inputClass} pl-11`}
            disabled={saving}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className={labelClass}>
          Complete Address <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <MapPin
            size={17}
            className="absolute left-4 top-4 text-gray-400"
          />

          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="House no., building, street, area"
            className={`${inputClass} resize-none pl-11`}
            disabled={saving}
          />
        </div>
      </div>

      {/* Landmark */}
      <div>
        <label htmlFor="landmark" className={labelClass}>
          Landmark
        </label>

        <div className="relative">
          <Navigation
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Nearby landmark (optional)"
            className={`${inputClass} pl-11`}
            disabled={saving}
          />
        </div>
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>
            City <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Building2
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className={`${inputClass} pl-11`}
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <label htmlFor="state" className={labelClass}>
            State <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Map
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className={`${inputClass} pl-11`}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label htmlFor="pincode" className={labelClass}>
          Pincode <span className="text-red-500">*</span>
        </label>

        <input
          id="pincode"
          name="pincode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={formData.pincode}
          onChange={(e) =>
            handleChange({
              target: {
                name: "pincode",
                value: e.target.value.replace(/\D/g, ""),
              },
            })
          }
          placeholder="6-digit pincode"
          className={inputClass}
          disabled={saving}
        />
      </div>

      {/* Address Label */}
      <div>
        <label className={labelClass}>
          Save Address As
        </label>

        <div className="grid grid-cols-3 gap-3">
          {["HOME", "WORK", "OTHER"].map((label) => (
            <button
              key={label}
              type="button"
              disabled={saving}
              onClick={() =>
                setFormData((prev) => ({ ...prev, label }))
              }
              className={`rounded-xl border px-3 py-3 text-xs font-semibold transition sm:text-sm ${
                formData.label === label
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Default Address */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <input
          type="checkbox"
          name="isDefault"
          checked={Boolean(formData.isDefault)}
          onChange={handleChange}
          disabled={saving}
          className="mt-0.5 h-4 w-4 accent-green-600"
        />

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Star size={15} className="text-green-700" />
            Set as default address
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Use this address as your preferred delivery location.
          </p>
        </div>
      </label>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {saving
            ? "Saving..."
            : isEditing
              ? "Update Address"
              : "Save Address"}
        </button>
      </div>
    </form>
  );
}
