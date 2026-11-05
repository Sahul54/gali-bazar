
"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import { useCheckoutContext } from "@/context/customer/CheckoutContext";

import AddressSection from "@/components/customer/checkout/AddressSection";
import DeliveryOptions from "@/components/customer/checkout/DeliveryOptions";
import OrderSummary from "@/components/customer/checkout/OrderSummary";

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCartContext();

  const {
    selectedAddressId,
    setSelectedAddressId,
    deliveryType,
    setDeliveryType,
    scheduledDate,
    setScheduledDate,
    scheduledSlot,
    setScheduledSlot,
  } = useCheckoutContext();

  const deliveryFee = 0;

  const totalAmount = Number(cartTotal || 0) + deliveryFee;

  const isDeliveryValid =
    deliveryType === "EXPRESS" ||
    (Boolean(scheduledDate) && Boolean(scheduledSlot));

  const canContinue =
    Boolean(selectedAddressId) &&
    isDeliveryValid &&
    cartItems.length > 0;

  function handleContinue() {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    if (!isDeliveryValid) {
      alert("Please select a delivery date and time slot.");
      return;
    }

    // Order creation will be implemented next.
    console.log({
      addressId: selectedAddressId,
      deliveryType,
      scheduledDate:
        deliveryType === "SCHEDULED" ? scheduledDate : null,
      scheduledSlot:
        deliveryType === "SCHEDULED" ? scheduledSlot : null,
      totalAmount,
    });
  }

  if (!cartItems.length) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={48} className="mb-4 text-gray-400" />

        <h1 className="text-2xl font-semibold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Add products to your cart before proceeding to checkout.
        </p>

        <Link
          href="/products"
          className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complete your details to place your order.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <AddressSection
              selectedAddressId={selectedAddressId}
              onAddressSelect={setSelectedAddressId}
            />

            <DeliveryOptions
              deliveryType={deliveryType}
              onDeliveryTypeChange={setDeliveryType}
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
              scheduledSlot={scheduledSlot}
              onScheduledSlotChange={setScheduledSlot}
            />
          </div>

          <div className="space-y-4">
            <OrderSummary
              cartItems={cartItems}
              cartTotal={cartTotal}
              deliveryFee={deliveryFee}
            />

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Continue
            </button>

            <p className="text-center text-xs text-gray-500">
              Please verify your address and delivery details before
              continuing.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
