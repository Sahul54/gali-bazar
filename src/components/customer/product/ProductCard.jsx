
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Store,
  Package,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { useCartContext } from "@/context/customer/CartContext";

export default function ProductCard({ product }) {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCartContext();

  const [selectedVariantId, setSelectedVariantId] = useState("");

  if (!product) return null;

  const imageUrl = product.images?.[0]?.imageUrl;

  const activeVariants =
    product.variants?.filter((variant) => variant.isActive) || [];

  const availableVariants = activeVariants.filter((variant) => {
    const stock =
      Number(variant.inventory?.quantity || 0) -
      Number(variant.inventory?.reservedQuantity || 0);

    return stock > 0;
  });

  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(
          ...activeVariants.map((variant) => Number(variant.price))
        )
      : null;

  const selectedVariant =
    availableVariants.find(
      (variant) => variant.id === selectedVariantId
    ) ||
    (availableVariants.length === 1 ? availableVariants[0] : null);

  const cartItem = selectedVariant
    ? cartItems.find(
        (item) =>
          item.productId === product.id &&
          item.variantId === selectedVariant.id
      )
    : null;

  const quantity = cartItem?.quantity || 0;

  const price = selectedVariant
    ? Number(selectedVariant.price)
    : lowestPrice;

  const availableStock = selectedVariant
    ? Math.max(
        0,
        Number(selectedVariant.inventory?.quantity || 0) -
          Number(selectedVariant.inventory?.reservedQuantity || 0)
      )
    : 0;

  function handleAddToBag() {
    if (!selectedVariant || quantity > 0) return;
    addToCart(product, selectedVariant, 1);
  }

  function handleDecrease() {
    if (!cartItem || !selectedVariant) return;

    if (quantity <= 1) {
      removeFromCart(selectedVariant.id);
      return;
    }

    updateQuantity(selectedVariant.id, quantity - 1);
  }

  function handleIncrease() {
    if (!cartItem || !selectedVariant || quantity >= availableStock) {
      return;
    }

    updateQuantity(selectedVariant.id, quantity + 1);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      {/* Product Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative block overflow-hidden bg-gray-50"
      >
        <div className="flex aspect-square items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.images?.[0]?.altText || product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Package size={44} className="text-gray-300" />
          )}
        </div>

        {availableVariants.length === 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-red-600 shadow-sm">
            Out of Stock
          </span>
        )}

        {product.brand && (
          <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-600 backdrop-blur">
            {product.brand}
          </span>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">

        <Link href={`/products/${product.id}`}>
          <p className="truncate text-[11px] font-medium text-green-700">
            {product.category?.name || "Local Product"}
          </p>

          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-800 transition-colors group-hover:text-green-700">
            {product.name}
          </h3>
        </Link>

        {/* Variant Selector */}
        {availableVariants.length > 1 && (
          <div className="mt-2.5">
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-[11px] font-medium text-gray-600 outline-none transition focus:border-green-500 focus:bg-white"
            >
              <option value="">Choose variant</option>

              {availableVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title || variant.sku || "Standard"} - ₹
                  {Number(variant.price).toFixed(0)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price + Cart Action */}
        <div className="mt-auto pt-4">
          <div className="flex min-h-10 items-center justify-between gap-2">

            {/* Price */}
            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight text-gray-900">
                {price !== null ? `₹${price.toFixed(0)}` : "N/A"}
              </p>

              {availableVariants.length > 0 && (
                <p className="mt-0.5 text-[10px] font-medium text-green-600">
                  <Check size={11} className="mr-0.5 inline" />
                  In Stock
                </p>
              )}
            </div>

            {/* Add Button */}
            {quantity === 0 ? (
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={
                  availableVariants.length === 0 || !selectedVariant
                }
                className="flex h-9 min-w-[68px] shrink-0 items-center justify-center gap-1 rounded-lg border border-green-600 bg-white px-3 text-xs font-bold text-green-700 transition hover:bg-green-700 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ShoppingBag size={13} />

                {availableVariants.length === 0
                  ? "SOLD"
                  : availableVariants.length > 1 && !selectedVariant
                    ? "SELECT"
                    : "ADD"}
              </button>
            ) : (
              /* Quantity Stepper */
              <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-green-700 px-2 text-white shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-7 w-5 items-center justify-center rounded hover:bg-green-600 active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>

                <span className="min-w-3 text-center text-xs font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= availableStock}
                  className="flex h-7 w-5 items-center justify-center rounded hover:bg-green-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seller */}
        {product.sellerProfile?.businessName && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-2.5">
            <Store size={12} className="shrink-0 text-gray-400" />

            <span className="truncate text-[11px] font-medium text-gray-500">
              {product.sellerProfile.businessName}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
