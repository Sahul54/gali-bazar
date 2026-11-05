"use client";

import Link from "next/link";
import {
  Store,
  MapPin,
  ShoppingBag,
  Bell,
  UserRound,
  ChevronDown,
} from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import ProductSearch from "@/components/customer/common/ProductSearch";

export default function CustomerHeader() {
  const { cartCount } = useCartContext();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand & Location */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 text-green-800"
          >
            <Store size={21} strokeWidth={2.5} />

            <span className="text-lg font-extrabold tracking-tight">
              Gali Bazar
            </span>
          </Link>

          <button
            type="button"
            className="mt-0.5 flex max-w-[190px] items-center gap-1 text-left"
          >
            <MapPin size={14} className="shrink-0 text-green-700" />

            <span className="truncate text-xs font-semibold text-gray-800">
              Select Location
            </span>

            <ChevronDown size={14} className="shrink-0 text-gray-400" />
          </button>
        </div>

        {/* Desktop Search */}
        <div className="hidden max-w-xl flex-1 md:block">
          <ProductSearch />
        </div>

        {/* Header Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
          >
            <Bell size={21} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
          >
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-green-700 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href="/account"
            aria-label="My account"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white transition hover:bg-green-800"
          >
            <UserRound size={19} />
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-gray-100 px-4 py-3 md:hidden">
        <ProductSearch />
      </div>
    </header>
  );
}
