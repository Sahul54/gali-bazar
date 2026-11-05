
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  LayoutGrid,
  Tag,
  UserRound,
} from "lucide-react";

const navigationItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Shops",
    href: "/shops",
    icon: Store,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: LayoutGrid,
  },
  {
    label: "Offers",
    href: "/offers",
    icon: Tag,
  },
  {
    label: "Account",
    href: "/account",
    icon: UserRound,
  },
];

function MobileNavigationContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive
                  ? "font-semibold text-green-800"
                  : "text-gray-500 hover:text-green-700"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-green-700" />
              )}

              <Icon
                size={21}
                strokeWidth={isActive ? 2.5 : 1.8}
              />

              <span className="text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MobileNavigation() {
  return (
    <Suspense
      fallback={
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-gray-100 bg-white md:hidden" />
      }
    >
      <MobileNavigationContent />
    </Suspense>
  );
}
