"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Tags,
  Bike,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    Icon: LayoutDashboard,
  },
  {
    label: "Sellers",
    href: "/admin/sellers",
    Icon: Store,
  },
  {
    label: "Products",
    href: "/admin/products",
    Icon: Package,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    Icon: ShoppingCart,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    Icon: Tags,
  },
  {
    label: "Delivery Partners",
    href: "/admin/riders",
    Icon: Bike,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Login page par dashboard layout mat dikhao.
  if (pathname === "/admin/login") {
    return children;
  }

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/v1/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 md:flex">
      {/* Mobile header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-xl font-bold text-white">
            G
          </div>

          <div>
            <p className="font-bold tracking-tight">Gali Bazar</p>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          menuOpen ? "block" : "hidden"
        } w-full shrink-0 border-b border-slate-200 bg-white md:block md:min-h-screen md:w-64 md:border-b-0 md:border-r`}
      >
        <Link
          href="/admin/dashboard"
          className="hidden h-16 items-center gap-3 border-b border-slate-100 px-5 md:flex"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-xl font-bold text-white">
            G
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">Gali Bazar</p>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-2 p-3">
          {navigation.map(({ label, href, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-[#F97316]"
                    : "text-slate-600 hover:bg-orange-50 hover:text-[#F97316]"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden p-4 md:block">
          <div className="rounded-2xl bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F97316]" />
              <p className="text-sm font-semibold text-slate-800">
                Gali Bazar
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Manage your local marketplace from one place.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:flex md:px-8">
          <div>
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-slate-500">
              Manage your marketplace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#C2410C]">
              <ShieldCheck size={14} />
              ADMIN
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {logoutError && (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mx-8"
          >
            {logoutError}
          </div>
        )}

        <main className="p-4 md:p-8">{children}</main>

        {/* Mobile logout */}
        <div className="border-t border-slate-200 bg-white p-4 md:hidden">
          {logoutError && (
            <p className="mb-3 text-sm text-red-600">{logoutError}</p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut size={17} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}