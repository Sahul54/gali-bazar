
import { getOrderStatus } from "@/lib/account/helpers";

export default function OrderStatusBadge({ status, className = "" }) {
  const { label, className: statusClass } = getOrderStatus(status);

  return (
    <span
      role="status"
      aria-label={`Order status: ${label}`}
      className={`
        inline-flex w-fit shrink-0 items-center gap-2
        rounded-full border px-3 py-1.5
        text-xs font-semibold leading-none
        transition-colors
        ${statusClass}
        ${className}
      `}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />

      <span>{label}</span>
    </span>
  );
}
