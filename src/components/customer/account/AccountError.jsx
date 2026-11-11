
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function AccountError({
  message = "Something went wrong while loading your account.",
  onRetry,
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-5 py-10 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle size={28} className="text-red-600" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        Unable to load your account
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
