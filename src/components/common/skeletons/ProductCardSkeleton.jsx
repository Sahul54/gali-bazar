
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {/* Product Image */}
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="space-y-3 p-3">
        {/* Product Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Discount / Saving */}
        <Skeleton className="h-3 w-2/3" />

        {/* Seller Details */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
