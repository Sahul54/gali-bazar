
"use client";

import { Zap, CalendarDays, Clock, Check } from "lucide-react";

const DELIVERY_OPTIONS = [
  {
    value: "EXPRESS",
    title: "Express Delivery",
    description: "Get your order delivered as soon as possible.",
    icon: Zap,
  },
  {
    value: "SCHEDULED",
    title: "Scheduled Delivery",
    description: "Choose your preferred delivery date and time.",
    icon: CalendarDays,
  },
];

const TIME_SLOTS = [
  "09:00 AM - 12:00 PM",
  "12:00 PM - 03:00 PM",
  "03:00 PM - 06:00 PM",
  "06:00 PM - 09:00 PM",
];

export default function DeliveryOptions({
  deliveryType,
  onDeliveryTypeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledSlot,
  onScheduledSlotChange,
}) {
  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Delivery Options
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose when you want your order delivered.
        </p>
      </div>

      {/* Delivery Type */}
      <div className="grid gap-3 sm:grid-cols-2">
        {DELIVERY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = deliveryType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onDeliveryTypeChange(option.value)}
              aria-pressed={selected}
              className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className="rounded-lg bg-gray-100 p-2">
                <Icon size={20} className="text-gray-800" />
              </span>

              <span className="flex-1">
                <span className="block font-semibold text-gray-900">
                  {option.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  {option.description}
                </span>
              </span>

              {selected && (
                <Check size={18} className="shrink-0 text-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scheduled Delivery Details */}
      {deliveryType === "SCHEDULED" && (
        <div className="mt-5 space-y-4 rounded-xl bg-gray-50 p-4">
          <div>
            <label
              htmlFor="scheduledDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Select Delivery Date
            </label>

            <input
              id="scheduledDate"
              type="date"
              min={minDate}
              value={scheduledDate}
              onChange={(event) =>
                onScheduledDateChange(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="scheduledSlot"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Select Time Slot
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TIME_SLOTS.map((slot) => {
                const selected = scheduledSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onScheduledSlotChange(slot)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition ${
                      selected
                        ? "border-black bg-white font-medium text-black"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Clock size={16} />
                    {slot}
                    {selected && (
                      <Check size={15} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
