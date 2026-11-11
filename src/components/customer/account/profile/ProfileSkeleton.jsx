
export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gray-200" />

        <div className="space-y-2">
          <div className="h-5 w-48 rounded-md bg-gray-200" />
          <div className="h-3 w-64 max-w-full rounded-md bg-gray-100" />
        </div>
      </div>

      {/* Personal Details Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="h-4 w-36 max-w-full rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form Skeleton */}
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="h-5 w-32 rounded bg-gray-200" />

        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <div className="h-3 w-28 rounded bg-gray-100" />
            <div className="h-11 w-full rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
