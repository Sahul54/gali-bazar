
"use client";

import {
  Info,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function BeforeUploading({
  onDownloadTemplate,
}) {
  const rules = [
    {
      title: "Use the correct CSV template",
      description:
        "Download the Gali Bazar template and keep its column headers unchanged.",
    },
    {
      title: "Fill required product details",
      description:
        "Enter all mandatory fields and use valid values for price, stock, and category.",
    },
    {
      title: "Keep SKUs unique",
      description:
        "Use a unique SKU for each product or variant according to your catalog rules.",
    },
    {
      title: "Check your data before uploading",
      description:
        "Review the CSV preview and fix validation errors before importing.",
    },
  ];

  return (
    <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Info size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900">
            Before you upload
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Follow these guidelines to help your product import
            complete successfully.
          </p>
        </div>

        <button
          type="button"
          onClick={onDownloadTemplate}
          className="hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:inline-flex"
        >
          <Download size={15} />
          Get template
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rules.map((rule, index) => (
          <div
            key={rule.title}
            className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4"
          >
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {rule.title}
              </h3>

              <p className="mt-1 text-sm leading-5 text-gray-600">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle
          size={19}
          className="mt-0.5 shrink-0 text-amber-600"
        />

        <p className="text-sm leading-5 text-amber-800">
          <span className="font-semibold">Important:</span>{" "}
          CSV preview validation does not guarantee every row will
          be imported. The server may reject rows that fail database
          or business-rule checks.
        </p>
      </div>

      <button
        type="button"
        onClick={onDownloadTemplate}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:hidden"
      >
        <FileSpreadsheet size={17} />
        Download CSV template
      </button>
    </section>
  );
}
