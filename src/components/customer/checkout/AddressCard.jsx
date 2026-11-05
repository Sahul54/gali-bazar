
"use client";

import {
  Home,
  Briefcase,
  MapPinned,
  Check,
} from "lucide-react";

const labelIcons = {
  HOME: Home,
  WORK: Briefcase,
  OTHER: MapPinned,
};

export default function AddressCard({
  address,
  selected,
  onSelect,
}) {
  const Icon = labelIcons[address.label] || MapPinned;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-black bg-gray-50"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      {/* Address Type Icon */}
      <span className="rounded-lg bg-gray-100 p-2">
        <Icon size={19} className="text-gray-700" />
      </span>

      {/* Address Details */}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900">
            {address.fullName}
          </span>

          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {address.label}
          </span>

          {address.isDefault && (
            <span className="text-xs font-medium text-green-600">
              Default
            </span>
          )}
        </span>

        <span className="mt-1 block text-sm leading-6 text-gray-600">
          {address.address}
          {address.landmark && `, ${address.landmark}`}
          {`, ${address.city}, ${address.state} - ${address.pincode}`}
        </span>

        <span className="mt-1 block text-sm text-gray-500">
          Phone: {address.phone}
        </span>
      </span>

      {/* Selection Indicator */}
      <span
        className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-black bg-black text-white"
            : "border-gray-300"
        }`}
      >
        {selected && <Check size={13} />}
      </span>
    </button>
  );
}
