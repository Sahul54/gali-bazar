
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export default function BulkUploadHeader({
  onDownloadTemplate,
}) {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <FileSpreadsheet size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Bulk Product Upload
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Upload multiple products using a CSV file.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onDownloadTemplate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            <Download size={17} />
            Download template
          </button>

          <button
            type="button"
            onClick={() => onDownloadTemplate(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            <FileText size={17} />
            Blank template
          </button>
        </div>
      </div>
    </>
  );
}
