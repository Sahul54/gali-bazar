
import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySkeleton({ count = 8 }) {
  return (
    <section className="mx-auto w-full">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex min-w-0 flex-col items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-full sm:h-12 sm:w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </section>
  );
}
