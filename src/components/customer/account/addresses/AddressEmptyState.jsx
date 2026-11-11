
import { MapPin, Plus, MapPinned } from "lucide-react";

export default function AddressEmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center sm:py-16">
      {/* Icon */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">
        <MapPinned size={36} strokeWidth={1.6} />

        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-green-600 text-white">
          <Plus size={14} strokeWidth={2.5} />
        </span>
      </div>

      {/* Content */}
      <h3 className="mt-5 text-lg font-bold text-gray-900">
        No saved addresses yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Add your home or work address to make your Gali Bazar deliveries
        faster and easier.
      </p>

      {/* Action */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
      >
        <Plus size={17} />
        Add Your First Address
      </button>

      <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
        <MapPin size={14} />
        <span>Your saved addresses stay in your account</span>
      </div>
    </div>
  );
}
