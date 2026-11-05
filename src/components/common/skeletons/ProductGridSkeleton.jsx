
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          {/* Product Image */}
          <div className="aspect-square w-full animate-pulse bg-gray-200" />

          {/* Product Details */}
          <div className="space-y-3 p-3 sm:p-4">
            {/* Category */}
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />

            {/* Product Name */}
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
            </div>

            {/* Seller */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
              <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
