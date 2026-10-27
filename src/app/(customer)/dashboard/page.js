import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { ShoppingBag, MapPin, UserRound } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export const instant = false;

export default async function CustomerDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/customer/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    redirect("/customer/login");
  }

  if (user.role !== "CUSTOMER") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-orange-50/40">
      <header className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <h1 className="text-xl font-bold text-orange-600">
            Gali-Bazar
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserRound size={18} />
            {user.name || "Customer"}
          </div>

          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-3xl bg-orange-500 p-7 text-white sm:p-10">
          <p className="text-sm text-orange-100">
            Customer Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome{user.name ? `, ${user.name}` : " to Gali-Bazar"}!
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-orange-50">
            Discover trusted shops and services in your neighbourhood.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <ShoppingBag className="text-orange-500" size={28} />

            <h3 className="mt-4 font-semibold text-gray-900">
              Explore Marketplace
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Discover products from local sellers.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <MapPin className="text-orange-500" size={28} />

            <h3 className="mt-4 font-semibold text-gray-900">
              Your Neighbourhood
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Find nearby shops and local services.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="font-semibold text-gray-900">
            Account Information
          </h3>

          <p className="mt-4 text-sm text-gray-500">
            Mobile Number
          </p>

          <p className="mt-1 font-medium text-gray-900">
            +91 {user.phone}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Account Role
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {user.role}
          </p>
        </div>
      </section>
    </main>
  );
}
