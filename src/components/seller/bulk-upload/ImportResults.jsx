
"use client";

import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Package,
  Upload,
} from "lucide-react";

export default function ImportResults({
  importResult,
  onDownloadFailures,
  onUploadAnother,
}) {
  if (!importResult) return null;

  const summary = importResult.summary || {};
  const results = importResult.results || [];

  const failedRows = results.filter((row) => !row.imported);
  const failedCount = Number(summary.failed ?? failedRows.length);
  const totalCount = Number(summary.total ?? 0);
  const importedCount = Number(summary.imported ?? 0);

  const hasFailures = failedCount > 0 || failedRows.length > 0;

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex items-start gap-3">
        {hasFailures ? (
          <AlertTriangle
            size={24}
            className="mt-0.5 shrink-0 text-amber-600"
          />
        ) : (
          <CheckCircle2
            size={24}
            className="mt-0.5 shrink-0 text-green-600"
          />
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Import results
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {importResult.message || "Import processing completed."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total rows</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Imported</p>
          <p className="mt-1 text-2xl font-bold text-green-800">
            {importedCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-800">
            {failedCount}
          </p>
        </div>
      </div>

      {hasFailures && (
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Errors</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {failedRows.slice(0, 20).map((row, index) => (
                  <tr
                    key={`${row.rowNumber ?? index}-${row.sku || "row"}`}
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {row.rowNumber ?? "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.name || row.data?.name || "—"}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {row.sku || row.data?.sku || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-red-700">
                      {Array.isArray(row.errors)
                        ? row.errors.join(" ")
                        : row.errors || "Import failed."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {failedCount > 20 && (
            <p className="mt-2 text-xs text-gray-500">
              Showing the first 20 failed rows. Download the report
              for all failures.
            </p>
          )}

          <button
            type="button"
            onClick={onDownloadFailures}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Download failed rows
          </button>
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/seller/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Package size={17} />
          View Products
        </Link>

        <button
          type="button"
          onClick={onUploadAnother}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Upload size={17} />
          Upload another CSV
        </button>
      </div>
    </section>
  );
}
