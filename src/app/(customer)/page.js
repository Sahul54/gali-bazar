
import CategorySection from "@/components/customer/home/CategorySection";
import NearbyShops from "@/components/customer/home/NearbyShops";
import PopularProducts from "@/components/customer/home/PopularProducts";
import RecentlyViewedProducts from "@/components/customer/home/RecentlyViewedProducts";

import {
  ShieldCheck,
  Truck,
  ReceiptText,
} from "lucide-react";

const promises = [
  {
    icon: ShieldCheck,
    title: "Trusted Local Shops",
    description: "Discover verified neighbourhood sellers.",
  },
  {
    icon: ReceiptText,
    title: "Transparent Pricing",
    description: "Shop with clear and honest pricing.",
  },
  {
    icon: Truck,
    title: "Convenient Shopping",
    description: "Get your local essentials with ease.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8faf8]">

      {/* 1. Categories */}
      <CategorySection />

      {/* 2. Nearby Shops */}
      <NearbyShops />

      {/* 3. Popular Local Products */}
      <PopularProducts />

      {/* 4. Recently Viewed Products */}
      <RecentlyViewedProducts />

      {/* 5. Gali Bazar Promise */}
      <section className="mx-auto max-w-7xl px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Why shop with us?
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#0b1c30] sm:text-2xl">
            The Gali Bazar Promise
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Making neighbourhood shopping easier and better.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {promises.map((promise) => {
            const Icon = promise.icon;

            return (
              <div
                key={promise.title}
                className="group flex items-center gap-4 rounded-2xl border border-green-200 bg-white p-5 transition-all duration-200 hover:border-green-400 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
                  <Icon size={23} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">
                    {promise.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {promise.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
