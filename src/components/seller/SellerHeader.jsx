
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Store,
  ChevronDown,
} from "lucide-react";

const pageTitles = {
  "/seller/dashboard": "Dashboard",
  "/seller/products": "Products",
  "/seller/inventory": "Inventory Management",
  "/seller/bulk-upload": "Bulk Upload",
  "/seller/orders": "Orders",
  "/seller/dispatch": "Dispatch & Delivery",
  "/seller/earnings": "Earnings & Settlements",
  "/seller/reports": "Sales Reports",
  "/seller/settings": "Store Settings",
  "/seller/notifications": "Notifications",
  "/seller/support": "Support Centre",
};

export default function SellerHeader({ onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState("");

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(
      ([path]) => path !== "/seller/dashboard" && pathname.startsWith(`${path}/`)
    )?.[1] ||
    "Seller Centre";

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      router.replace("/seller/login");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
              {title}
            </h1>
            <p className="hidden text-xs text-gray-500 sm:block">
              Manage your store on Gali Bazar
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
            <Search size={17} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              Search coming soon
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/seller/notifications")}
            aria-label="View notifications"
            className="relative rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-50"
          >
            <Bell size={19} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((value) => !value)}
              aria-expanded={showMenu}
              aria-label="Open seller account menu"
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Store size={19} />
              </span>
              <ChevronDown
                size={16}
                className="hidden text-gray-500 sm:block"
              />
            </button>

            {showMenu && (
              <>
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowMenu(false)}
                />

                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/seller/settings");
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Store Settings
                  </button>

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>

                  {error && (
                    <p role="alert" className="px-3 py-2 text-xs text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
