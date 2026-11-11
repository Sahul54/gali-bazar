
import { LoaderCircle } from "lucide-react";

export default function AccountLoader({
  message = "Loading your account...",
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
        <LoaderCircle
          size={28}
          className="animate-spin text-green-700"
        />
      </div>

      <h3 className="mt-5 text-base font-semibold text-gray-900">
        Please wait
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
}
