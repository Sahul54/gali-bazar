
"use client";

import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Store,
  Package,
} from "lucide-react";

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  if (!item) return null;

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Product Image */}
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <Package size={32} className="text-gray-300" />
        )}
      </div>

      {/* Product Details */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
              {item.name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {item.variantTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove?.(item.variantId)}
            aria-label="Remove product"
            className="h-fit rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={17} />
          </button>
        </div>

        {/* Shop */}
        {item.shopName && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Store size={13} />
            <span className="line-clamp-1">{item.shopName}</span>
          </div>
        )}

        {/* Price and Quantity */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-gray-900">
              ₹{Number(item.price).toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Subtotal: ₹{subtotal.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity?.(
                  item.variantId,
                  item.quantity - 1
                )
              }
              disabled={item.quantity <= 1}
              className="p-2 text-gray-600 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>

            <span className="min-w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onUpdateQuantity?.(
                  item.variantId,
                  item.quantity + 1
                )
              }
              disabled={item.quantity >= item.availableStock}
              className="p-2 text-gray-600 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
