
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  MapPin,
  Store,
  BadgeCheck,
} from "lucide-react";

import ShopCardSkeleton from "@/components/common/skeletons/ShopCardSkeleton";

async function getNearbyShops() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Temporary default location
    const latitude = 12.940768;
    const longitude = 77.697937;

    const response = await fetch(
      `${baseUrl}/api/v1/shops?latitude=${latitude}&longitude=${longitude}&radiusKm=5&limit=6`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return [];

    const result = await response.json();

    return result.data?.shops || result.shops || [];
  } catch (error) {
    console.error("Failed to fetch nearby shops:", error);
    return [];
  }
}

function ShopCard({ shop }) {
  const shopImage =
    shop.imageUrl || shop.coverImageUrl || shop.logoUrl || null;

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group w-[245px] shrink-0 overflow-hidden rounded-2xl border border-green-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:shadow-md sm:w-[270px]"
    >
      {/* Shop Image */}
      <div className="relative h-[145px] overflow-hidden bg-[#eff4f0]">
        {shopImage ? (
          <img
            src={shopImage}
            alt={shop.businessName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#eff4f0]">
            <Store size={42} strokeWidth={1.3} className="text-green-700" />
          </div>
        )}

        {/* Distance */}
        {shop.distanceKm !== undefined &&
          shop.distanceKm !== null && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm">
              <MapPin size={11} className="text-green-700" />
              {Number(shop.distanceKm).toFixed(1)} km
            </div>
          )}
      </div>

      {/* Shop Details */}
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1">
          <BadgeCheck
            size={13}
            className="shrink-0 fill-green-600 text-white"
          />
          <span className="text-[10px] font-semibold text-green-700">
            Verified Local Shop
          </span>
        </div>

        <h3 className="truncate text-sm font-bold text-[#0b1c30] transition group-hover:text-green-700">
          {shop.businessName}
        </h3>

        {shop.category && (
          <p className="mt-1 truncate text-xs text-gray-500">
            {shop.category}
          </p>
        )}

        {shop.address && (
          <div className="mt-2 flex items-start gap-1 text-[11px] text-gray-500">
            <MapPin size={12} className="mt-0.5 shrink-0 text-green-700" />
            <span className="line-clamp-1">{shop.address}</span>
          </div>
        )}

        {/* Visit Shop */}
        <div className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white transition-all duration-200 group-hover:bg-green-800">
          Visit Shop
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}

async function NearbyShopsContent() {
  const shops = await getNearbyShops();

  return (
    <>
      {shops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
          <Store size={32} className="mx-auto text-gray-400" />

          <h3 className="mt-3 text-sm font-semibold text-gray-800">
            No nearby shops found
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Local shops will appear here when available.
          </p>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:px-0">
          <div className="flex gap-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function NearbyShops() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Section Heading */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30] sm:text-lg">
            Shops Near You
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Discover trusted stores in your neighbourhood.
          </p>
        </div>

        <Link
          href="/shops"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-green-700 transition hover:text-green-800"
        >
          See All
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Loading Skeleton + Shops */}
      <Suspense
        fallback={
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-[245px] shrink-0 sm:w-[270px]">
                <ShopCardSkeleton />
              </div>
            ))}
          </div>
        }
      >
        <NearbyShopsContent />
      </Suspense>
    </section>
  );
}
