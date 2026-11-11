
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./constants";

// Currency formatter
export function formatCurrency(amount) {
  const value = Number(amount ?? 0);

  if (!Number.isFinite(value)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

// Date formatter
export function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

// Date and time formatter
export function formatDateTime(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

// Order status details
export function getOrderStatus(status) {
  return (
    ORDER_STATUS_CONFIG[status] || {
      label: status
        ? status.replaceAll("_", " ")
        : "Unknown",
      className: "bg-gray-100 text-gray-700",
    }
  );
}

// Check active order
export function isActiveOrder(status) {
  return ACTIVE_ORDER_STATUSES.includes(status);
}

// Customer initials
export function getInitials(name) {
  if (!name || typeof name !== "string") return "U";

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// Customer display name
export function getDisplayName(name) {
  return name?.trim() || "Customer";
}

// Item count formatter
export function formatItemCount(count) {
  const value = Math.max(0, Number(count) || 0);

  return `${value} ${value === 1 ? "item" : "items"}`;
}

// Payment method label
export function getPaymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] || method || "—";
}

// Payment status label
export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status || "—";
}

// Calculate total quantity of order items
export function getTotalItemQuantity(items = []) {
  return items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );
}

// Get order product names
export function getOrderProductNames(items = [], limit = 3) {
  const names = items
    .map((item) => item.productName)
    .filter(Boolean);

  return {
    names: names.slice(0, limit),
    remaining: Math.max(0, names.length - limit),
  };
}
