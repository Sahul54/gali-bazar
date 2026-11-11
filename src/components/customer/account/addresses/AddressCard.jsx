
import {
  Home,
  BriefcaseBusiness,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
} from "lucide-react";

const ADDRESS_ICONS = {
  HOME: Home,
  WORK: BriefcaseBusiness,
  OTHER: MapPin,
};

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting = false,
  updatingDefault = false,
}) {
  const Icon = ADDRESS_ICONS[address?.label] || MapPin;

  const fullAddress = [
    address?.address,
    address?.landmark,
    address?.city,
    address?.state,
    address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition sm:p-5 ${
        address?.isDefault
          ? "border-green-200 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              address?.isDefault
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">
                {address?.label || "OTHER"}
              </h3>

              {address?.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                  <CheckCircle2 size={12} />
                  Default
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-gray-500">
              {address?.fullName || "Customer"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(address)}
            aria-label="Edit address"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-green-50 hover:text-green-700"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(address)}
            disabled={deleting}
            aria-label="Delete address"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="mt-4 flex items-start gap-2.5">
        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />

        <p className="text-sm leading-6 text-gray-600">
          {fullAddress || "Address details not available"}
        </p>
      </div>

      {address?.phone && (
        <p className="mt-2 pl-6 text-xs text-gray-500">
          Phone: {address.phone}
        </p>
      )}

      {/* Footer */}
      {!address?.isDefault && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => onSetDefault?.(address)}
            disabled={updatingDefault}
            className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star size={14} />
            {updatingDefault ? "Updating..." : "Set as Default"}
          </button>
        </div>
      )}
    </article>
  );
}