
export default function AddressSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />

              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-100" />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-9 w-9 rounded-lg bg-gray-100" />
              <div className="h-9 w-9 rounded-lg bg-gray-100" />
            </div>
          </div>

          {/* Address */}
          <div className="mt-5 flex gap-3">
            <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          </div>

          {/* Phone */}
          <div className="mt-4 h-3 w-36 rounded bg-gray-100" />

          {/* Footer */}
          {item !== 1 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="h-3 w-28 rounded bg-gray-100" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
