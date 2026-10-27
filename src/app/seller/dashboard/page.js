import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
  Boxes,
  Upload,
  Store,
} from "lucide-react";
import { requireApprovedSeller } from "@/lib/require-seller";

export const instant = false;

export default async function SellerDashboardPage() {
  const seller = await requireApprovedSeller();
  const businessName =
    seller.sellerProfile?.businessName || "Your Store";

  const stats = [
    {
      title: "Total Products",
      value: "—",
      description: "Product data not connected",
      icon: Package,
    },
    {
      title: "Active Orders",
      value: "—",
      description: "Order data not connected",
      icon: ShoppingCart,
    },
    {
      title: "Available Stock",
      value: "—",
      description: "Inventory data not connected",
      icon: Boxes,
    },
    {
      title: "Total Earnings",
      value: "—",
      description: "Settlement data not connected",
      icon: Wallet,
    },
  ];

  const actions = [
    {
      title: "Add Product",
      description: "List a new product in your store.",
      href: "/seller/products/new",
      icon: Plus,
    },
    {
      title: "Manage Inventory",
      description: "Review and update your stock.",
      href: "/seller/inventory",
      icon: Boxes,
    },
    {
      title: "Upload Products",
      description: "Prepare a bulk product upload.",
      href: "/seller/bulk-upload",
      icon: Upload,
    },
    {
      title: "View Orders",
      description: "Manage incoming customer orders.",
      href: "/seller/orders",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            SELLER CENTRE
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome, {seller.name || seller.sellerProfile.ownerName}!
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Here is your store overview for {businessName}.
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </section>

      {/* Store status */}
      <section className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
            <Store size={22} />
          </span>

          <div>
            <h3 className="font-semibold text-gray-900">
              Your store is approved
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {businessName} is approved to access seller features.
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          APPROVED
        </span>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Business Overview
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your business metrics will appear here when the APIs are connected.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <span className="rounded-xl bg-gray-50 p-2.5 text-gray-600">
                    <Icon size={20} />
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Common tasks to help you manage your store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={22} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    {action.description}
                  </span>
                </span>

                <ArrowRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent orders placeholder */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Recent Orders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Recent customer orders will appear here.
            </p>
          </div>

          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all orders <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
            <TrendingUp size={23} />
          </span>

          <p className="mt-4 font-semibold text-gray-800">
            Order data is not connected yet
          </p>

          <p className="mt-1 text-sm text-gray-500">
            We will connect real orders in the Orders phase.
          </p>
        </div>
      </section>
    </div>
  );
}
