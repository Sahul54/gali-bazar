
"use client";

import {
  History,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

const STATUS_STYLES = {
  PROCESSING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  COMPLETED_WITH_ERRORS: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
};

const STATUS_LABELS = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  COMPLETED_WITH_ERRORS: "Completed with errors",
  FAILED: "Failed",
};

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UploadHistory({
  uploads = [],
  loading = false,
  error = "",
  onRefresh,
}) {
  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <History size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Upload History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest 50 CSV uploads.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <RefreshCw size={18} className="animate-spin" />
          Loading upload history...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
            <FileSpreadsheet size={26} />
          </div>

          <h3 className="mt-4 font-semibold text-gray-900">
            No upload history yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Your future CSV uploads will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Imported</th>
                <th className="px-4 py-3">Failed</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {uploads.map((upload, index) => {
                const status = String(
                  upload.status || ""
                ).toUpperCase();

                return (
                  <tr
                    key={upload.id || `${upload.fileName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                          <FileSpreadsheet size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="break-words font-medium text-gray-900">
                            {upload.fileName || "Unnamed CSV"}
                          </p>

                          {upload.id && (
                            <p className="mt-1 break-all text-xs text-gray-400">
                              ID: {upload.id}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                      {formatDate(upload.createdAt)}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900">
                      {upload.totalRows ?? 0}
                    </td>

                    <td className="px-4 py-4 font-semibold text-green-700">
                      {upload.importedRows ?? 0}
                    </td>

                    <td className="px-4 py-4 font-semibold text-red-600">
                      {upload.failedRows ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[status] || status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
