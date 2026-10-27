
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  RefreshCw,
} from "lucide-react";

export default function CsvPreviewTable({
  validation,
  canValidate,
  showAllRows,
  onToggleRows,
  onDownloadErrors,
}) {
  if (!validation) return null;

  const { rows = [], validCount = 0, invalidCount = 0 } =
    validation;

  const visibleRows = showAllRows ? rows : rows.slice(0, 10);

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            CSV preview and validation
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Check the rows below before importing them into your store.
          </p>
        </div>

        {invalidCount > 0 && (
          <button
            type="button"
            onClick={onDownloadErrors}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} />
            Download validation errors
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total rows
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {rows.length}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">
            Valid rows
          </p>
          <p className="mt-2 text-2xl font-bold text-green-800">
            {validCount}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Invalid rows
          </p>
          <p className="mt-2 text-2xl font-bold text-red-800">
            {invalidCount}
          </p>
        </div>
      </div>

      {!canValidate && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <RefreshCw size={17} className="animate-spin" />
          Loading categories and existing products...
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">CSV row</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row) => (
              <tr
                key={`${row.rowNumber}-${row.data.sku || "row"}`}
                className="align-top"
              >
                <td className="px-4 py-3 text-gray-500">
                  {row.rowNumber}
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {row.data.name || "—"}
                  </p>

                  {row.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-red-600">
                      {row.errors.map((error, index) => (
                        <li key={`${row.rowNumber}-error-${index}`}>
                          • {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {row.data.category || "—"}
                </td>

                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  {row.data.sku || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {row.data.price || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {row.data.quantity || "—"}
                </td>

                <td className="px-4 py-3">
                  {row.valid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <AlertCircle size={14} />
                      Fix errors
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 10 && (
        <button
          type="button"
          onClick={onToggleRows}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          {showAllRows
            ? "Show first 10 rows"
            : `Show all ${rows.length} rows`}

          <ChevronDown
            size={16}
            className={showAllRows ? "rotate-180" : ""}
          />
        </button>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Preview validation runs in your browser. The server validates
          the CSV again before saving products. Only rows that pass
          server-side validation will be imported.
        </p>
      </div>
    </section>
  );
}
