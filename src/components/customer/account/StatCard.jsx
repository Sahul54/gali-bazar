
import {
  Package,
  Truck,
  CheckCircle2,
  Wallet,
  TrendingUp,
} from "lucide-react";

const ICONS = {
  Package,
  Truck,
  CheckCircle2,
  Wallet,
};

const ICON_STYLES = {
  Package: "bg-blue-50 text-blue-600",
  Truck: "bg-orange-50 text-orange-600",
  CheckCircle2: "bg-green-50 text-green-700",
  Wallet: "bg-purple-50 text-purple-600",
};

export default function StatCard({
  title,
  value = 0,
  description,
  icon = "Package",
  format = "number",
  trend,
}) {
  const Icon = ICONS[icon] || Package;
  const iconStyle = ICON_STYLES[icon] || "bg-green-50 text-green-700";

  const numericValue = Number(value) || 0;

  const displayValue =
    format === "currency"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(numericValue)
      : format === "number"
        ? new Intl.NumberFormat("en-IN").format(numericValue)
        : value;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg sm:p-5">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {displayValue}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 ${iconStyle}`}
        >
          <Icon size={22} strokeWidth={1.9} />
        </div>
      </div>

      {/* Footer */}
      {(description || trend !== undefined) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
          {trend !== undefined && trend !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
              <TrendingUp size={13} />
              {trend}
            </span>
          )}

          {description && (
            <p className="text-xs leading-5 text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
