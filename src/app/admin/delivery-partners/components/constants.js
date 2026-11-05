
import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const FILTERS = [
  { label: "All applications", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const EMPTY_SUMMARY = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

export const SUMMARY_ITEMS = [
  {
    key: "total",
    title: "Total applications",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "pending",
    title: "Pending review",
    icon: Clock3,
    color: "bg-amber-50 text-amber-600",
  },
  {
    key: "approved",
    title: "Approved partners",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
  },
  {
    key: "rejected",
    title: "Rejected applications",
    icon: XCircle,
    color: "bg-red-50 text-red-600",
  },
];
