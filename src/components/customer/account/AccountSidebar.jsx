
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  LayoutDashboard,
  UserRound,
  Package,
  Truck,
  MapPin,
  ShoppingCart,
  Eye,
  Headset,
  LogOut,
} from "lucide-react";

import LogoutButton from "@/components/auth/LogoutButton";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/account",
    icon: LayoutDashboard,
  },
  {
    label: "Personal Information",
    href: "/account/profile",
    icon: UserRound,
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Order Tracking",
    href: "/account/orders?view=tracking",
    icon: Truck,
  },
  {
    label: "My Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "My Cart",
    href: "/cart",
    icon: ShoppingCart,
  },
  {
    label: "Recently Viewed",
    href: "/account/recently-viewed",
    icon: Eye,
  },
  {
    label: "Help & Support",
    href: "/account/support",
    icon: Headset,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const trackingView = searchParams.get("view") === "tracking";

  const isActive = (item) => {
    if (item.label === "Overview") {
      return pathname === "/account";
    }

    if (item.label === "My Orders") {
      return pathname === "/account/orders" && !trackingView;
    }

    if (item.label === "Order Tracking") {
      return pathname === "/account/orders" && trackingView;
    }

    if (item.label === "Help & Support") {
      return pathname === "/contact";
    }

    return pathname === item.href.split("?")[0];
  };

  function NavLink({ item, mobile = false }) {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`group flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
          mobile ? "text-xs" : "text-sm"
        } ${
          active
            ? "bg-green-50 text-green-800"
            : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
        }`}
      >
        <Icon
          size={mobile ? 16 : 18}
          strokeWidth={active ? 2.2 : 1.8}
          className={
            active
              ? "text-green-700"
              : "text-gray-400 group-hover:text-green-700"
          }
        />

        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-58 overflow-hidden border-r border-gray-100 bg-white lg:flex lg:flex-col">
        {/* Sidebar Header */}
        <div className="shrink-0 border-b border-gray-100 px-5 py-5">
          <h2 className="text-base font-bold text-gray-900">
            My Account
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Manage your account and orders
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-hidden px-4 py-5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="sticky top-16 z-30 border-b border-gray-100 bg-white lg:hidden">
        <nav className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              mobile
            />
          ))}
        </nav>

        {/* Mobile Logout */}
        <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600">
         <LogoutButton />
        </div>
      </div>
    </>
  );
}
