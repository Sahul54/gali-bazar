
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import CartItem from "@/components/customer/cart/CartItem";
import CartSummary from "@/components/customer/cart/CartSummary";
import EmptyCart from "@/components/customer/cart/EmptyCart";

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    isSyncing,
    error,
    updateQuantity,
    removeFromCart,
    refreshCart,
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
              {isLoading
                ? "Loading your cart..."
                : `${cartCount} ${cartCount === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <LoaderCircle
            size={32}
            className="animate-spin text-green-600"
          />
          <p className="text-sm font-medium text-gray-500">
            Loading your cart...
          </p>
        </div>
      ) : error && cartItems.length === 0 ? (
        /* Error State */
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <p className="font-semibold text-gray-800">
            Unable to load your cart
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={refreshCart}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty Cart */
        <EmptyCart />
      ) : (
        /* Cart Content */
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {cartItems.map((item) => (
              <CartItem
                key={item.id || item.variantId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            {isSyncing && (
              <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <LoaderCircle size={13} className="animate-spin" />
                Updating your cart...
              </p>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <CartSummary subtotal={cartTotal} />
          </div>
        </div>
      )}
    </div>
  );
}
