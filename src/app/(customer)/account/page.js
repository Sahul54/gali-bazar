
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  MapPin,
  Settings,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Store,
} from "lucide-react";

const accountLinks = [
  {
    title: "My Orders",
    description: "Track and manage your orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    title: "My Addresses",
    description: "Manage your delivery addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    title: "Account Settings",
    description: "Manage your account information",
    href: "/account/settings",
    icon: Settings,
  },
];

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/v1/customer/profile", {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to fetch profile."
          );
        }

        const profile =
          result.data?.user ||
          result.data?.profile ||
          result.user ||
          result.data;

        if (!profile?.id) {
          throw new Error("Customer profile not found.");
        }

        setUser(profile);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={36}
          className="animate-spin text-green-600"
        />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <User size={48} className="mx-auto text-gray-300" />

        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Unable to load account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {error || "Please sign in to view your account."}
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initials = (user.name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-green-700">
            Gali Bazar / Account
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            My Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your profile and shopping activities.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
              {initials}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.name || "Customer"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Welcome to Gali Bazar
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <ShieldCheck size={14} />
                {user.role || "CUSTOMER"}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 p-3 text-gray-500">
                <Phone size={19} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {user.phone || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 p-3 text-gray-500">
                <Mail size={19} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Email Address</p>
                <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                  {user.email || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Options */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Account Overview
          </h2>

          <div className="space-y-3">
            {accountLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-green-200 hover:shadow-sm"
                >
                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={20}
                    className="text-gray-400"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Seller CTA */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-green-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Store size={28} className="text-green-700" />

            <div>
              <h3 className="font-bold text-gray-900">
                Want to sell on Gali Bazar?
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Register your local shop and reach more customers.
              </p>
            </div>
          </div>

          <Link
            href="/seller/register"
            className="shrink-0 rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-800"
          >
            Become a Seller
          </Link>
        </div>

      </div>
    </div>
  );
}
