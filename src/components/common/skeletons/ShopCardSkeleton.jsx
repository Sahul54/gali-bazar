
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4">
      {/* Shop Image / Banner */}
      <Skeleton className="h-32 w-full rounded-lg" />

      <div className="space-y-3 pt-4">
        {/* Shop Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Rating and Distance */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Shop Description */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />

        {/* Delivery Info */}
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

