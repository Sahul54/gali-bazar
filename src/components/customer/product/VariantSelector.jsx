
"use client";

import { useEffect, useState } from "react";
import { Check, Package } from "lucide-react";

export default function VariantSelector({
  variants = [],
  selectedVariantId: externalSelectedId,
  onVariantChange,
}) {
  const activeVariants = variants.filter(
    (variant) => variant.isActive !== false
  );

  const [selectedVariantId, setSelectedVariantId] = useState("");

  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setSelectedVariantId(externalSelectedId || "");
      return;
    }

    const firstAvailable = activeVariants.find((variant) => {
      const quantity = Number(variant.inventory?.quantity || 0);
      const reserved = Number(
        variant.inventory?.reservedQuantity || 0
      );

      return quantity - reserved > 0;
    });

    setSelectedVariantId(firstAvailable?.id || "");
  }, [externalSelectedId, variants]);

  const selectedVariant = activeVariants.find(
    (variant) => variant.id === selectedVariantId
  );

  function getStock(variant) {
    const quantity = Number(variant.inventory?.quantity || 0);
    const reserved = Number(
      variant.inventory?.reservedQuantity || 0
    );

    return Math.max(0, quantity - reserved);
  }

  function handleSelect(variant) {
    setSelectedVariantId(variant.id);
    onVariantChange?.(variant);
  }

  if (activeVariants.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
        No variants available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Select Variant
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Choose your preferred option.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activeVariants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const stock = getStock(variant);
          const isOutOfStock = stock <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => handleSelect(variant)}
              className={`relative rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300"
              } ${
                isOutOfStock
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 text-green-600">
                  <Check size={16} />
                </span>
              )}

              <p className="pr-5 text-sm font-semibold text-gray-900">
                {variant.title || variant.sku || "Variant"}
              </p>

              <p className="mt-2 font-bold text-gray-900">
                ₹{Number(variant.price).toFixed(2)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  isOutOfStock ? "text-red-500" : "text-green-600"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : `${stock} available`}
              </p>
            </button>
          );
        })}
      </div>

      {selectedVariant && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          <Package size={18} className="text-green-600" />
          Selected:{" "}
          <span className="font-semibold text-gray-900">
            {selectedVariant.title || selectedVariant.sku}
          </span>
        </div>
      )}
    </div>
  );
}
