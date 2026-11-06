
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  LoaderCircle,
} from "lucide-react";

import { useCartContext } from "@/context/customer/CartContext";
import { useCheckoutContext } from "@/context/customer/CheckoutContext";

import AddressSection from "@/components/customer/checkout/AddressSection";
import DeliveryOptions from "@/components/customer/checkout/DeliveryOptions";
import OrderSummary from "@/components/customer/checkout/OrderSummary";

export default function CheckoutPage() {
  const { cartItems, cartTotal, isLoading } = useCartContext();

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

  const [deliveryCheck, setDeliveryCheck] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  // Check delivery availability whenever address changes
  useEffect(() => {
    if (!selectedAddressId) {
      setDeliveryCheck(null);
      setDeliveryError("");
      setDeliveryLoading(false);
      return;
    }

    const controller = new AbortController();

    async function checkDelivery() {
      try {
        setDeliveryLoading(true);
        setDeliveryCheck(null);
        setDeliveryError("");

        const addressResponse = await fetch(
          `/api/v1/addresses/${selectedAddressId}`,
          { signal: controller.signal }
        );

        const addressResult = await addressResponse.json();

        if (!addressResponse.ok || !addressResult.success) {
          throw new Error(
            addressResult.message || "Unable to fetch delivery address."
          );
        }

        const address = addressResult.data;
        const pincode = address?.pincode;

        if (!pincode) {
          throw new Error("Selected address does not have a valid pincode.");
        }

        const response = await fetch("/api/v1/delivery/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pincode }),
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to check delivery availability."
          );
        }

        setDeliveryCheck(result.data);

        if (!result.data.available) {
          setDeliveryError(result.data.message);
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("DELIVERY CHECK ERROR:", error);
        setDeliveryCheck(null);
        setDeliveryError(
          error.message || "Unable to check delivery availability."
        );
      } finally {
        if (!controller.signal.aborted) {
          setDeliveryLoading(false);
        }
      }
    }

    checkDelivery();

    return () => controller.abort();
  }, [selectedAddressId]);

  // Calculate delivery fee
  const deliveryFee = deliveryCheck?.available
    ? deliveryType === "EXPRESS"
      ? Number(deliveryCheck.fees?.express || 0)
      : Number(deliveryCheck.fees?.scheduled || 0)
    : 0;

  const totalAmount = Number(cartTotal || 0) + deliveryFee;

  const isDeliveryValid =
    deliveryType === "EXPRESS" ||
    (Boolean(scheduledDate) && Boolean(scheduledSlot));

  const canContinue =
    Boolean(selectedAddressId) &&
    Boolean(deliveryCheck?.available) &&
    !deliveryLoading &&
    !deliveryError &&
    isDeliveryValid &&
    !isLoading &&
    cartItems.length > 0;

  function handleContinue() {
    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    if (deliveryLoading) {
      alert("Please wait while we check delivery availability.");
      return;
    }

    if (!deliveryCheck?.available) {
      alert(deliveryError || "Delivery is not available at this address.");
      return;
    }

    if (!isDeliveryValid) {
      alert("Please select a delivery date and time slot.");
      return;
    }

    console.log({
      addressId: selectedAddressId,
      deliveryType,
      scheduledDate:
        deliveryType === "SCHEDULED" ? scheduledDate : null,
      scheduledSlot:
        deliveryType === "SCHEDULED" ? scheduledSlot : null,
      deliveryZoneId: deliveryCheck.zone.id,
      deliveryFee,
      totalAmount,
    });
  }

  // Loading State - Check this BEFORE empty cart
  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <LoaderCircle
          size={36}
          className="mb-4 animate-spin text-green-600"
        />

        <h1 className="text-lg font-semibold text-gray-900">
          Loading your cart...
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we prepare your checkout.
        </p>
      </main>
    );
  }

  // Empty Cart State
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

            {selectedAddressId && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                {deliveryLoading ? (
                  <p className="text-sm text-gray-500">
                    Checking delivery availability...
                  </p>
                ) : deliveryError ? (
                  <p className="text-sm text-red-600">
                    {deliveryError}
                  </p>
                ) : deliveryCheck?.available ? (
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Delivery available!
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Delivery Zone: {deliveryCheck.zone.name}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

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
