
import Link from "next/link";

import {
  PackageOpen,
  MapPin,
  ShoppingBag,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";

const ICONS = {
  orders: PackageOpen,
  addresses: MapPin,
  cart: ShoppingBag,
  recentlyViewed: Clock,
  default: Search,
};

export default function EmptyState({
  icon = "default",
  title = "Nothing here yet",
  description = "Your items will appear here when available.",
  actionLabel,
  actionHref,
  className = "",
}) {
  const Icon = ICONS[icon] || ICONS.default;

  return (
    <div
      className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center transition-colors sm:px-8 ${className}`}
    >
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-8 ring-green-50/50">
        <Icon size={29} strokeWidth={1.7} />
      </div>

      {/* Content */}
      <div className="mt-6 max-w-md">
        <h3 className="text-lg font-bold tracking-tight text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      {/* Action */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
