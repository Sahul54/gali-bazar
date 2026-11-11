
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headset,
  MapPin,
  MapPinned,
  Navigation,
  Package,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Eye,
  Wallet,
} from "lucide-react";

import AccountLoader from "@/components/customer/account/AccountLoader";
import AccountError from "@/components/customer/account/AccountError";
import StatCard from "@/components/customer/account/StatCard";
import RecentOrders from "@/components/customer/account/RecentOrders";
import ProfileCard from "@/components/customer/account/ProfileCard";
import OrderStatusBadge from "@/components/customer/account/OrderStatusBadge";
import { useCartContext } from "@/context/customer/CartContext";
import { formatCurrency, getDisplayName } from "@/lib/account/helpers";

function SectionHeading({
  icon: Icon,
  title,
  description,
  href,
  linkLabel = "View All",
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Icon size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 transition hover:text-green-800"
        >
          {linkLabel}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

function WelcomeBanner({ user, defaultAddress }) {
  const displayName = getDisplayName(user?.name);

 
return (
  <section className="mb-6 mt-[-30px] bg-white p-5 sm:p-6">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-green-700">
          Welcome to Gali Bazar
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Hello, {displayName} 👋
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your orders, profile and delivery addresses.
        </p>

        {defaultAddress && (
          <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-green-700" />
            {defaultAddress.city}, {defaultAddress.pincode}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/account/orders"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Clock size={16} />
          My Orders
        </Link>

        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <Store size={16} />
          Shop Now
        </Link>
      </div>
    </div>
  </section>
);

}

function ActiveOrderCard({ order }) {
  if (!order) return null;

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-green-700" />

      <div className="flex flex-col justify-between gap-5 pl-2 xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <Truck size={26} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs font-semibold text-gray-500">
                #{order.orderNumber}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Your order is in progress
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              From {order.sellerProfile?.businessName || "your local seller"}
            </p>

            {order.deliveryAddress && (
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-gray-500">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{order.deliveryAddress}</span>
              </p>
            )}

            <p className="mt-2 text-base font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <Navigation size={17} />
          Track Order
        </Link>
      </div>
    </section>
  );
}

function DefaultAddressCard({ address }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <MapPinned size={24} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-gray-900">
                {address ? `${address.label || "Saved"} Address` : "Your Delivery Address"}
              </h3>

              {address?.isDefault && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                  DEFAULT
                </span>
              )}
            </div>

            {address ? (
              <>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {address.fullName}
                  </span>
                  <br />
                  {address.address}
                  {address.landmark && `, ${address.landmark}`}
                  , {address.city}, {address.state} - {address.pincode}
                </p>

                <p className="mt-1 text-xs text-gray-500">{address.phone}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                Add your delivery address for a faster checkout experience.
              </p>
            )}
          </div>
        </div>

        <Link
          href="/account/addresses"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          <MapPin size={16} />
          Manage Addresses
        </Link>
      </div>
    </section>
  );
}

function QuickAccess() {
  const { cartCount } = useCartContext();

  const items = [
    {
      title: "My Cart",
      description:
        cartCount > 0
          ? `${cartCount} ${cartCount === 1 ? "item" : "items"} in your cart`
          : "Your cart is currently empty",
      icon: ShoppingCart,
      href: "/cart",
      count: cartCount,
    },
    {
      title: "Personal Information",
      description: "Update your profile",
      icon: UserRound,
      href: "/account/profile",
    },
    {
      title: "My Addresses",
      description: "Manage delivery locations",
      icon: MapPin,
      href: "/account/addresses",
    },
    {
      title: "Recently Viewed",
      description: "Explore viewed products",
      icon: Eye,
      href: "/account/recently-viewed",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-bold text-gray-900">
        Quick Access
      </h2>

      <p className="mt-1 text-xs text-gray-500">
        Manage your shopping activities
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-transparent bg-gray-50 p-3 transition-all hover:border-green-100 hover:bg-green-50"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <Icon size={19} />

                {item.title === "My Cart" && item.count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-700 px-1 text-[9px] font-bold text-white">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 transition group-hover:text-green-700">
                  {item.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {item.description}
                </p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-700"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SupportCard() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Headset size={22} />
        </div>

        <div>
          <h3 className="font-bold text-gray-900">Need Help?</h3>
          <p className="text-xs text-gray-500">
            We are here to assist you.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-500">
        Have questions about your orders or account? Get in touch with our
        support team.
      </p>

      <Link
        href="/contact"
        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-green-700 text-sm font-semibold text-white transition hover:bg-green-800"
      >
        Contact Support
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

function ExploreMarketCard() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 to-green-600 p-5 text-white shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
        <Store size={24} />
      </div>

      <h3 className="mt-4 text-lg font-bold">
        Explore Your Local Market
      </h3>

      <p className="mt-2 text-sm leading-6 text-green-50">
        Discover everyday products from shops in your neighbourhood.
      </p>

      <Link
        href="/"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-green-800 transition hover:bg-green-50"
      >
        Start Shopping
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export default function AccountPage() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAccount = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/customer/profile", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load your account.");
      }

      if (!result.data) {
        throw new Error("Account information was not found.");
      }

      setAccount(result.data);
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(
        err.message || "Something went wrong while loading your account."
      );
      setAccount(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchAccount(controller.signal);

    return () => controller.abort();
  }, [fetchAccount]);

  const handleRetry = () => {
    fetchAccount();
  };

  if (loading) {
    return <AccountLoader message="Loading your account details..." />;
  }

  if (error || !account) {
    return (
      <AccountError
        message={error || "Unable to load your account details."}
        onRetry={handleRetry}
      />
    );
  }

  const user = account.user || {};
  const stats = account.stats || {};
  const activeOrder = account.activeOrder || null;

  const recentOrders = Array.isArray(account.recentOrders)
    ? account.recentOrders
    : [];

  const defaultAddress = account.defaultAddress || null;

  return (
    <div className="w-full min-w-0 text-gray-900">
  
    <WelcomeBanner user={user} defaultAddress={defaultAddress} />

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders ?? 0}
          description="All your placed orders"
          icon="Package"
        />

        <StatCard
          title="Active Orders"
          value={stats.activeOrders ?? 0}
          description="Orders currently in progress"
          icon="Truck"
        />

        <StatCard
          title="Delivered"
          value={stats.deliveredOrders ?? 0}
          description="Successfully delivered orders"
          icon="CheckCircle2"
        />

        <StatCard
          title="Total Spent"
          value={stats.totalSpent ?? 0}
          description="On successfully delivered orders"
          icon="Wallet"
          format="currency"
        />
      </section>

      <ActiveOrderCard order={activeOrder} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-8">
          <section className="flex min-w-0 flex-col gap-4">
            <SectionHeading
              icon={Package}
              title="Recent Orders"
              description="Your latest purchases from local sellers"
              href="/account/orders"
              linkLabel="View All Orders"
            />

            <RecentOrders orders={recentOrders} />

            {(stats.cancelledOrders ?? 0) > 0 && (
              <p className="text-xs text-gray-500">
                You have {stats.cancelledOrders} cancelled order(s).{" "}
                <Link
                  href="/account/orders"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  View order history
                </Link>
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeading
              icon={MapPinned}
              title="Delivery Address"
              description="Your saved delivery location"
              href="/account/addresses"
              linkLabel="Manage"
            />

            <DefaultAddressCard address={defaultAddress} />
          </section>

          <ProfileCard user={user} />
        </div>

        <aside className="flex flex-col gap-5 xl:col-span-4">
          <QuickAccess cartCount={stats.cartCount ?? 0} />
          <SupportCard />
          <ExploreMarketCard />
        </aside>
      </div>

      <footer className="mt-10 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Gali Bazar. All rights reserved.
      </footer>
    </div>
  );
}
