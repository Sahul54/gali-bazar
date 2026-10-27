
"use client";

import { useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";

export default function CsvUploadSection({
  file,
  isDragging,
  isReading,
  isImporting,
  fileError,
  parsedRowsCount,
  onFileSelect,
  onRemoveFile,
  onDragStateChange,
  onDropFile,
}) {
  const fileInputRef = useRef(null);

  const handleInputChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      await onFileSelect(selectedFile);
    }

    // Allows selecting the same file again.
    event.target.value = "";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    onDragStateChange(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      await onDropFile(droppedFile);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Upload your CSV file
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          CSV format only. Maximum file size 5 MB and
          maximum 5,000 product rows.
        </p>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          onDragStateChange(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          onDragStateChange(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();

          if (
            !event.currentTarget.contains(event.relatedTarget)
          ) {
            onDragStateChange(false);
          }
        }}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
          isDragging
            ? "border-orange-500 bg-orange-50"
            : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/40"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          {isReading ? (
            <RefreshCw size={26} className="animate-spin" />
          ) : (
            <Upload size={26} />
          )}
        </div>

        <h3 className="mt-4 text-base font-semibold text-gray-900">
          {isReading
            ? "Reading CSV file..."
            : isDragging
              ? "Drop your CSV file here"
              : "Drag and drop your CSV file here"}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          or choose a file from your computer
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          className="hidden"
          id="bulk-csv-file"
          disabled={isReading || isImporting}
        />

        <label
          htmlFor="bulk-csv-file"
          className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 ${
            isReading || isImporting
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }`}
        >
          <FileSpreadsheet size={17} />
          Choose CSV file
        </label>

        <p className="mt-4 text-xs text-gray-400">
          Supported format: .csv
        </p>
      </div>

      {fileError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{fileError}</p>
        </div>
      )}

      {file && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FileSpreadsheet size={22} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB ·{" "}
                {parsedRowsCount} product rows
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveFile}
            disabled={isImporting}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
          >
            <X size={16} />
            Remove file
          </button>
        </div>
      )}
    </section>
  );
}
