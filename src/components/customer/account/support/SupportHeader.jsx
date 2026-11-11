
import { Headset, MessageCircle } from "lucide-react";

export default function SupportHeader() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-5 sm:p-7">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700">
            <Headset size={14} />
            Customer Support
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Help & Support
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
            Need help with your order or account? We're here to
            make your Gali Bazar experience better.
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 sm:h-20 sm:w-20">
          <MessageCircle size={36} strokeWidth={1.6} />
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-green-100/50 blur-2xl" />
    </section>
  );
}
