
"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";

export default function CartSummary({
  subtotal = 0,
  deliveryFee = 0,
}) {
  const total = subtotal + deliveryFee;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        Order Summary
      </h2>

      <div className="mt-5 space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Truck size={16} />
            Delivery Fee
          </span>
          <span>
            {deliveryFee === 0
              ? "Free"
              : `₹${deliveryFee.toFixed(2)}`}
          </span>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">
              Total Amount
            </span>

            <span className="text-xl font-extrabold text-green-600">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </Link>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShoppingBag size={14} />
        Secure checkout experience
      </div>
    </div>
  );
}
