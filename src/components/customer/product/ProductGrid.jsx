
import ProductCard from "./ProductCard";
import { ShoppingBag } from "lucide-react";

export default function ProductGrid({
  products = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-5 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <ShoppingBag
          size={42}
          className="mx-auto text-gray-300"
        />

        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          No products found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Try exploring another category or changing your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
