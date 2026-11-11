
export const ORDER_STATUS = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  CANCELLED: "CANCELLED",
};

// Order status labels and Tailwind styles
export const ORDER_STATUS_CONFIG = {
  PLACED: {
    label: "Order Placed",
    className: "bg-blue-50 text-blue-700",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-amber-50 text-amber-700",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    className: "bg-amber-50 text-amber-700",
  },
  ASSIGNED: {
    label: "Partner Assigned",
    className: "bg-purple-50 text-purple-700",
  },
  PICKED_UP: {
    label: "Picked Up",
    className: "bg-indigo-50 text-indigo-700",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-orange-50 text-orange-700",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-50 text-green-700",
  },
  DELIVERY_FAILED: {
    label: "Delivery Failed",
    className: "bg-red-50 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700",
  },
};

// Orders currently in progress
export const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
];

// Payment information
export const PAYMENT_METHOD_LABELS = {
  COD: "Cash on Delivery",
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: "Payment Pending",
  PAID: "Paid",
};

// Customer account navigation
export const ACCOUNT_NAV_ITEMS = [
  {
    label: "Overview",
    href: "/account",
    icon: "LayoutDashboard",
  },
  {
    label: "Personal Information",
    href: "/account/profile",
    icon: "UserRound",
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: "Package",
  },
  {
  label: "Order Tracking",
  href: "/account/orders?view=tracking",
  icon: "Truck",
},
  {
    label: "My Addresses",
    href: "/account/addresses",
    icon: "MapPin",
  },
  {
    label: "My Cart",
    href: "/cart",
    icon: "ShoppingCart",
  },
  {
    label: "Recently Viewed",
    href: "/account/recently-viewed",
    icon: "Eye",
  },
  {
    label: "Help & Support",
    href: "/contact",
    icon: "Headset",
  },
];
