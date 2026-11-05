
import CategorySkeleton from "./CategorySkeleton";
import ShopCardSkeleton from "./ShopCardSkeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function HomePageSkeleton() {
  return (
    <main className="min-h-screen space-y-8 bg-[#f8faf8] px-4 py-6">
      {/* Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonHeading />
          <SkeletonText />
        </div>
        <CategorySkeleton count={8} />
      </section>

      {/* Nearby Shops */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonHeading />
          <SkeletonText />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ShopCardSkeleton key={index} />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonHeading />
          <SkeletonText />
        </div>

        <ProductGridSkeleton count={8} />
      </section>
    </main>
  );
}

function SkeletonHeading() {
  return <div className="h-6 w-40 animate-pulse rounded-md bg-gray-200" />;
}

function SkeletonText() {
  return <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200" />;
}
