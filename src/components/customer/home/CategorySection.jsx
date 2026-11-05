
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  ShoppingBasket,
  Sprout,
  Milk,
  Croissant,
  Cookie,
  Pill,
  Smartphone,
  Shirt,
  Package,
} from "lucide-react";

import CategorySkeleton from "@/components/common/skeletons/CategorySkeleton";

const categoryIcons = [
  ShoppingBasket,
  Sprout,
  Milk,
  Croissant,
  Cookie,
  Pill,
  Smartphone,
  Shirt,
];

function getCategoryIcon(category, index) {
  const name = category.name?.toLowerCase() || "";

  if (name.includes("grocer")) return ShoppingBasket;
  if (name.includes("produc")) return Sprout;
  if (name.includes("dairy")) return Milk;
  if (name.includes("baker")) return Croissant;
  if (name.includes("snack")) return Cookie;
  if (name.includes("pharma") || name.includes("medical")) return Pill;
  if (name.includes("electronic")) return Smartphone;
  if (name.includes("fashion") || name.includes("cloth")) return Shirt;

  return categoryIcons[index % categoryIcons.length] || Package;
}

async function getCategories() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/v1/categories`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const result = await response.json();

    return result.data?.categories || result.categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

async function CategoryContent() {
  const categories = await getCategories();

  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0b1c30] sm:text-base">
          Explore Neighborhood
        </h2>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          All Categories
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category, index);

          return (
            <Link
              key={category.id}
              href={`/categories?categoryId=${category.id}`}
              className="group flex min-w-0 flex-col items-center text-center"
            >
              {/* Category Icon */}
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#eff4ff] text-green-700 transition-all duration-200 group-hover:scale-105 group-hover:bg-green-100 sm:h-12 sm:w-12">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon size={19} strokeWidth={2} />
                )}
              </div>

              {/* Category Name */}
              <span className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-4 text-[#344054] transition-colors group-hover:text-green-700 sm:text-xs">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function CategorySection() {
  return (
    <Suspense fallback={<CategorySkeleton count={10} />}>
      <CategoryContent />
    </Suspense>
  );
}
