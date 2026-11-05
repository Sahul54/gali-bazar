
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  ShieldCheck,
  Loader2,
  Package,
  Minus,
  Plus,
} from "lucide-react";

import ProductGallery from "@/components/customer/product/ProductGallery";
import VariantSelector from "@/components/customer/product/VariantSelector";
import { useCartContext } from "@/context/customer/CartContext";

const GUEST_SESSION_KEY = "gali_bazar_guest_session";

// Get or create guest session ID
function getGuestSessionId() {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }

  return sessionId;
}

// Save recently viewed product
async function saveRecentlyViewed(productId) {
  try {
    const sessionId = getGuestSessionId();

    const response = await fetch(
      "/api/v1/products/recently-viewed",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          sessionId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Recently viewed save failed:",
        result.message
      );
      return;
    }

    console.log("Recently viewed saved:", productId);
  } catch (error) {
    console.error("Recently viewed error:", error);
  }
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.productId;

  const { addToCart } = useCartContext();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/v1/products/${productId}`,
          {
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch product."
          );
        }

        const productData =
          result.data?.product ||
          result.product ||
          result.data;

        if (!productData?.id) {
          throw new Error("Product not found.");
        }

        if (controller.signal.aborted) return;

        setProduct(productData);

        // Save product in Recently Viewed
        // This should not block product page rendering.
        void saveRecentlyViewed(productData.id);

        const firstAvailableVariant =
          productData.variants?.find((variant) => {
            if (variant.isActive === false) return false;

            const stock =
              Number(variant.inventory?.quantity || 0) -
              Number(
                variant.inventory?.reservedQuantity || 0
              );

            return stock > 0;
          }) || null;

        setSelectedVariant(firstAvailableVariant);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => controller.abort();
  }, [productId]);

  // Available stock
  const availableStock = selectedVariant
    ? Math.max(
        0,
        Number(selectedVariant.inventory?.quantity || 0) -
          Number(
            selectedVariant.inventory?.reservedQuantity || 0
          )
      )
    : 0;

  // Product pricing
  const pricing = useMemo(() => {
    if (!selectedVariant) {
      return {
        sellingPrice: null,
        mrp: null,
        discount: 0,
        saving: 0,
      };
    }

    const sellingPrice = Number(selectedVariant.price);

    const comparePrice =
      selectedVariant.compareAtPrice != null &&
      Number.isFinite(
        Number(selectedVariant.compareAtPrice)
      )
        ? Number(selectedVariant.compareAtPrice)
        : null;

    const hasDiscount =
      comparePrice !== null &&
      comparePrice > sellingPrice;

    return {
      sellingPrice,
      mrp: hasDiscount ? comparePrice : null,
      discount: hasDiscount
        ? Math.round(
            ((comparePrice - sellingPrice) /
              comparePrice) *
              100
          )
        : 0,
      saving: hasDiscount
        ? comparePrice - sellingPrice
        : 0,
    };
  }, [selectedVariant]);

  // Variant selection
  function handleVariantChange(variant) {
    setSelectedVariant(variant);
    setQuantity(1);
    setAdded(false);
  }

  // Add to cart
  function handleAddToCart() {
    if (!product || !selectedVariant || availableStock <= 0) {
      return;
    }

    addToCart(product, selectedVariant, quantity);
    setAdded(true);
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="animate-spin text-green-600"
          size={36}
        />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Package
          size={48}
          className="mx-auto text-gray-300"
        />

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Product not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error ||
            "This product may no longer be available."}
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600"
      >
        <ArrowLeft size={17} />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Gallery */}
        <div>
          <ProductGallery
            images={product.images || []}
            productName={product.name}
          />
        </div>

        {/* Product Information */}
        <div>
          {product.category && (
            <p className="text-sm font-medium text-green-600">
              {product.category.name}
            </p>
          )}

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>

          {product.brand && (
            <p className="mt-2 text-sm text-gray-500">
              Brand: {product.brand}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            {pricing.sellingPrice !== null ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{pricing.sellingPrice.toFixed(2)}
                  </span>

                  {pricing.mrp !== null && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{pricing.mrp.toFixed(2)}
                      </span>

                      <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        {pricing.discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {pricing.discount > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600">
                    <Tag size={16} />
                    You save ₹{pricing.saving.toFixed(2)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Price unavailable
              </p>
            )}
          </div>

          {/* Variants */}
          <div className="mt-7">
            <VariantSelector
              variants={product.variants || []}
              selectedVariantId={selectedVariant?.id || ""}
              onVariantChange={handleVariantChange}
            />
          </div>

          {/* Stock */}
          <div className="mt-5">
            {selectedVariant ? (
              <p
                className={`text-sm font-semibold ${
                  availableStock > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {availableStock > 0
                  ? `${availableStock} units available`
                  : "Out of Stock"}
              </p>
            ) : (
              <p className="text-sm font-medium text-red-500">
                No available variants
              </p>
            )}
          </div>

          {/* Quantity */}
          {selectedVariant && availableStock > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Quantity
              </p>

              <div className="inline-flex items-center rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="p-3 text-gray-600 hover:text-green-600 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="min-w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.min(
                        availableStock,
                        previous + 1
                      )
                    )
                  }
                  disabled={quantity >= availableStock}
                  className="p-3 text-gray-600 hover:text-green-600 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-7">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || availableStock <= 0}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={20} />
              {added ? "Added to Cart" : "Add to Cart"}
            </button>

            {added && (
              <Link
                href="/cart"
                className="mt-3 block text-center text-sm font-semibold text-green-600 hover:underline"
              >
                View Cart
              </Link>
            )}
          </div>

          {/* Delivery Information */}
          <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-green-600" />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Local Delivery
                </p>

                <p className="text-xs text-gray-500">
                  Delivery availability depends on your location.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck
                size={20}
                className="text-green-600"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Trusted Local Seller
                </p>

                <p className="text-xs text-gray-500">
                  Shop from your neighbourhood.
                </p>
              </div>
            </div>

            {product.sellerProfile?.businessName && (
              <div className="flex items-center gap-3">
                <Store size={20} className="text-green-600" />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.sellerProfile.businessName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {product.sellerProfile.address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900">
                Product Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
