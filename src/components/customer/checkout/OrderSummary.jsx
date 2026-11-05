
"use client";

import { ShoppingBag, ShieldCheck } from "lucide-react";

export default function OrderSummary({
  cartItems = [],
  cartTotal = 0,
  deliveryFee = 0,
}) {
  const itemCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const subtotal = Number(cartTotal || 0);
  const totalAmount = subtotal + Number(deliveryFee || 0);

  const formatPrice = (amount) =>
    `₹${Number(amount).toFixed(2)}`;

  return (
    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <ShoppingBag size={19} className="text-gray-700" />

        <h2 className="text-lg font-semibold text-gray-900">
          Order Summary
        </h2>
      </div>

      {/* Items */}
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Items ({itemCount})
        </span>

        <span className="font-medium text-gray-900">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Delivery Fee */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Delivery Fee
        </span>

        {deliveryFee === 0 ? (
          <span className="font-medium text-green-600">
            FREE
          </span>
        ) : (
          <span className="font-medium text-gray-900">
            {formatPrice(deliveryFee)}
          </span>
        )}
      </div>

      {/* Total */}
      <div className="mt-5 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">
            Total Amount
          </span>

          <span className="text-xl font-bold text-gray-900">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-5 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
        <ShieldCheck
          size={18}
          className="mt-0.5 shrink-0 text-gray-600"
        />

        <p className="text-xs leading-5 text-gray-500">
          Your order details and delivery information will be
          verified before placing the order.
        </p>
      </div>
    </aside>
  );
}
