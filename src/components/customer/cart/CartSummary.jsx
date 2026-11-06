
"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck, Info } from "lucide-react";

export default function CartSummary({ subtotal = 0 }) {
  const safeSubtotal = Number(subtotal) || 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        Order Summary
      </h2>

      <div className="mt-5 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            ₹{safeSubtotal.toFixed(2)}
          </span>
        </div>

        {/* Delivery Fee */}
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <Truck size={16} />
            Delivery Fee
          </span>

          <span className="text-right font-medium text-gray-700">
            Calculated at checkout
          </span>
        </div>

        {/* Delivery Information */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <Info size={15} className="mt-0.5 shrink-0" />
          <p>
            Delivery charges depend on your location and selected
            delivery option (Express or Scheduled).
          </p>
        </div>

        {/* Total */}
        <div className="border-t border-dashed border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">
              Subtotal
            </span>

            <span className="text-xl font-extrabold text-green-600">
              ₹{safeSubtotal.toFixed(2)}
            </span>
          </div>

          <p className="mt-1 text-right text-xs text-gray-400">
            Final amount will be calculated at checkout.
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </Link>

      {/* Secure Checkout */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShoppingBag size={14} />
        Secure checkout experience
      </div>
    </div>
  );
}
