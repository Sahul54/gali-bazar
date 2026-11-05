
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  UserRound,
  Headset,
  LogOut,
  Bike,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    href: "/delivery-partner/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Deliveries",
    href: "/delivery-partner/deliveries",
    icon: Package,
  },
  {
    label: "Earnings",
    href: "/delivery-partner/earnings",
    icon: Wallet,
  },
  {
    label: "My Profile",
    href: "/delivery-partner/profile",
    icon: UserRound,
  },
  {
    label: "Support",
    href: "/delivery-partner/support",
    icon: Headset,
  },
];

export default function DeliveryPartnerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Logout API integration will be added later.
    router.push("/delivery-partner/login");
  };

  const isActive = (href) => pathname === href;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <Bike size={25} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Gali Bazar
            </h1>
            <p className="text-xs text-slate-500">
              Delivery Partner
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Delivery Partner Panel
              </h2>
              <p className="text-xs text-slate-500">
                Manage your deliveries
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Bike size={20} />
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                  <Bike size={23} />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">
                    Gali Bazar
                  </h1>
                  <p className="text-xs text-slate-500">
                    Delivery Partner
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
