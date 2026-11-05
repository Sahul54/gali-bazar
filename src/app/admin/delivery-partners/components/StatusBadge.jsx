import {
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}