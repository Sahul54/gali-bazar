
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Upload,
  ShoppingCart,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  Bell,
  Headset,
  Store,
  ChevronRight,
  X,
} from "lucide-react";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/seller/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { label: "Products", href: "/seller/products", icon: Package },
      { label: "Inventory", href: "/seller/inventory", icon: Boxes },
      {
        label: "Bulk Upload",
        href: "/seller/bulk-upload",
        icon: Upload,
      },
    ],
  },
  {
    title: "ORDERS & PAYMENTS",
    items: [
      { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
      { label: "Dispatch & Delivery", href: "/seller/dispatch", icon: Truck },
      { label: "Earnings", href: "/seller/earnings", icon: Wallet },
      { label: "Reports", href: "/seller/reports", icon: BarChart3 },
    ],
  },
  {
    title: "STORE",
    items: [
      {
        label: "Notifications",
        href: "/seller/notifications",
        icon: Bell,
      },
      { label: "Store Settings", href: "/seller/settings", icon: Settings },
      { label: "Support", href: "/seller/support", icon: Headset },
    ],
  },
];

export default function SellerSidebar({
  open = false,
  onClose,
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-gray-100 px-5">
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Store size={22} />
            </span>

            <span>
              <span className="block text-lg font-bold tracking-tight text-gray-900">
                Gali Bazar
              </span>
              <span className="block text-xs text-gray-500">
                Seller Centre
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-gray-400">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/seller/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                        className={
                          active
                            ? "text-emerald-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        }
                      />

                      <span className="flex-1">{item.label}</span>

                      {active && (
                        <ChevronRight
                          size={16}
                          className="text-emerald-600"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">
              Seller Help Centre
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Need help managing your store?
            </p>
            <Link
              href="/seller/support"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Get support <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
