
"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import CartItem from "@/components/customer/cart/CartItem";
import CartSummary from "@/components/customer/cart/CartSummary";
import EmptyCart from "@/components/customer/cart/EmptyCart";

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCartContext();

  const deliveryFee = 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600"
        >
          <ArrowLeft size={17} />
          Continue Shopping
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <ShoppingCart size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>
      </div>

      {/* Empty Cart */}
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <CartItem
                key={item.variantId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <CartSummary
              subtotal={cartTotal}
              deliveryFee={deliveryFee}
            />
          </div>
        </div>
      )}
    </div>
  );
}
