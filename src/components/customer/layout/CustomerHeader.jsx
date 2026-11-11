
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  ShoppingBag,
  Bell,
  UserRound,
  ChevronDown,
  X,
  LockKeyhole,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import ProductSearch from "@/components/customer/common/ProductSearch";

export default function CustomerHeader() {
  const { cartCount } = useCartContext();

  const [checkingSession, setCheckingSession] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAccountClick = async () => {
    if (checkingSession) return;

    try {
      setCheckingSession(true);

      const response = await fetch("/api/v1/auth/session", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.authenticated) {
        window.location.href = "/account";
        return;
      }

      setShowLoginModal(true);
    } catch (error) {
      console.error("Account session check failed:", error);
      setShowLoginModal(true);
    } finally {
      setCheckingSession(false);
    }
  };

  return (
    <>
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
              <MapPin
                size={14}
                className="shrink-0 text-green-700"
              />

              <span className="truncate text-xs font-semibold text-gray-800">
                Select Location
              </span>

              <ChevronDown
                size={14}
                className="shrink-0 text-gray-400"
              />
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
            <button
              type="button"
              onClick={handleAccountClick}
              disabled={checkingSession}
              aria-label="My account"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-70"
            >
              {checkingSession ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserRound size={19} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="border-t border-gray-100 px-4 py-3 md:hidden">
          <ProductSearch />
        </div>
      </header>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              aria-label="Close login popup"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            >
              <X size={17} />
            </button>

            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <LockKeyhole size={29} />
            </div>

            {/* Content */}
            <div className="mt-5 text-center">
              <h2
                id="login-modal-title"
                className="text-xl font-extrabold text-gray-900"
              >
                Login to Your Account
              </h2>

              <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-gray-500">
                Please login or create an account to access your profile,
                orders, addresses and other account details.
              </p>
            </div>

            {/* Login Button */}
            <Link
              href="/customer/login"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-green-800 active:scale-[0.98]"
            >
              Login / Sign Up
              <ArrowRight size={17} />
            </Link>

            {/* Continue Shopping */}
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Continue Shopping
            </button>

            <p className="mt-5 text-center text-xs text-gray-400">
              Welcome to Gali Bazar!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
