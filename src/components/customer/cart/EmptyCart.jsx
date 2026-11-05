
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
        <ShoppingBag size={42} className="text-green-600" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        Your cart is empty!
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
        Looks like you haven't added anything to your cart yet.
        Explore nearby shops and discover amazing products.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Start Shopping
        <ArrowRight size={18} />
      </Link>

      <Link
        href="/shops"
        className="mt-4 text-sm font-medium text-gray-500 hover:text-green-600"
      >
        Explore Nearby Shops
      </Link>
    </div>
  );
}
