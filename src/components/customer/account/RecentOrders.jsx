
import Link from "next/link";

import {
  ArrowRight,
  Package,
  Store,
  CalendarDays,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";
import EmptyState from "./EmptyState";

import {
  formatCurrency,
  formatDate,
  formatItemCount,
} from "@/lib/account/helpers";

export default function RecentOrders({ orders = [] }) {
  const recentOrders = Array.isArray(orders)
    ? orders.slice(0, 3)
    : [];

  if (!recentOrders.length) {
    return (
      <EmptyState
        icon="orders"
        title="No orders yet"
        description="Your recent orders will appear here after your first purchase. Explore local stores and discover products."
        actionLabel="Start Shopping"
        actionHref="/"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Track your latest purchases
          </p>
        </div>

        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Orders */}
      <div className="divide-y divide-gray-100">
        {recentOrders.map((order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : [];

          const itemCount = items.reduce(
            (total, item) =>
              total + (Number(item.quantity) || 0),
            0
          );

          const productNames = items
            .slice(0, 2)
            .map((item) => item.productName)
            .filter(Boolean);

          const remainingItems = Math.max(
            items.length - productNames.length,
            0
          );

          return (
            <div
              key={order.id}
              className="group p-4 transition-colors hover:bg-gray-50/70 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Order Information */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-100">
                    <Package size={21} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        #{order.orderNumber || "Order"}
                      </h3>

                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Date and Quantity */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={13} />
                        {formatDate(order.createdAt)}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag size={13} />
                        {formatItemCount(itemCount)}
                      </span>
                    </div>

                    {/* Seller */}
                    <p className="mt-2 flex items-center gap-1.5 truncate text-xs font-medium text-gray-600">
                      <Store size={13} className="shrink-0" />
                      {order.sellerProfile?.businessName || "Local Store"}
                    </p>

                    {/* Products */}
                    {productNames.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-xs leading-5 text-gray-500">
                        {productNames.join(", ")}

                        {remainingItems > 0 &&
                          ` +${remainingItems} more`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount and Action */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                  <div className="sm:text-right">
                    <p className="text-xs text-gray-500">
                      Order Total
                    </p>

                    <p className="mt-1 text-base font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    aria-label={`View details for order ${order.orderNumber || ""}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    Details
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition hover:text-green-700"
        >
          Explore your complete order history
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
