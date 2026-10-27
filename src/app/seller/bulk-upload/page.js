"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";

import BulkUploadHeader from "@/components/seller/bulk-upload/BulkUploadHeader";
import BulkUploadStats from "@/components/seller/bulk-upload/BulkUploadStats";
import CsvUploadSection from "@/components/seller/bulk-upload/CsvUploadSection";
import CsvPreviewTable from "@/components/seller/bulk-upload/CsvPreviewTable";
import ImportResults from "@/components/seller/bulk-upload/ImportResults";
import UploadHistory from "@/components/seller/bulk-upload/UploadHistory";
import BeforeUploading from "@/components/seller/bulk-upload/BeforeUploading";

const CSV_HEADERS = [
  "name",
  "description",
  "brand",
  "category",
  "sku",
  "barcode",
  "price",
  "compareAtPrice",
  "costPrice",
  "quantity",
  "lowStockThreshold",
  "variantTitle",
  "weightGrams",
  "imageUrl",
];

const SAMPLE_ROWS = [
  [
    "Mens Cotton T-Shirt",
    "Premium cotton casual t-shirt",
    "Urban Style",
    "Men's Clothing",
    "GB-TS-001",
    "",
    "499",
    "699",
    "250",
    "100",
    "5",
    "Medium",
    "250",
    "",
  ],
  [
    "Womens Kurti",
    "Daily wear cotton kurti",
    "Fashion House",
    "Fashion",
    "GB-KU-002",
    "",
    "799",
    "999",
    "400",
    "50",
    "5",
    "Default",
    "300",
    "",
  ],
];

const REQUIRED_HEADERS = ["name", "category", "sku", "price", "quantity"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 5000;

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCSV(filename, rows) {
  const csvContent =
    "\uFEFF" + rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Supports commas, escaped quotes, and line breaks inside quoted CSV fields.
function parseCSV(text) {
  const input = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (insideQuotes) {
    throw new Error("The CSV file contains an unclosed quotation mark.");
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  if (!rows.length) throw new Error("The CSV file is empty.");

  const headers = rows[0].map((header) => header.trim());

  if (headers.some((header) => !header)) {
    throw new Error("The CSV file contains an empty column header.");
  }

  const duplicateHeaders = headers.filter(
    (header, index) =>
      headers.findIndex((item) => item.toLowerCase() === header.toLowerCase()) !== index
  );

  if (duplicateHeaders.length) {
    throw new Error(
      `Duplicate column headers: ${[...new Set(duplicateHeaders)].join(", ")}`
    );
  }

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.some((item) => item.toLowerCase() === header.toLowerCase())
  );

  if (missingHeaders.length) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const normalizedHeaders = headers.map((header) => header.toLowerCase());
  const dataRows = rows.slice(1).map((values, index) => {
    const data = {};
    normalizedHeaders.forEach((header, columnIndex) => {
      data[header] = (values[columnIndex] ?? "").trim();
    });
    return { rowNumber: index + 2, data };
  });

  return { headers, rows: dataRows };
}

function flattenCategories(categories, prefix = "") {
  const result = [];
  if (!Array.isArray(categories)) return result;

  for (const category of categories) {
    const name = String(category.name || "").trim();
    const label = prefix ? `${prefix} / ${name}` : name;

    result.push({
      id: category.id,
      name,
      label,
      active: category.isActive !== false && category.status !== "INACTIVE",
    });

    result.push(...flattenCategories(category.children || [], label));
  }

  return result;
}

function getErrorMessage(result, fallback) {
  return result?.message || result?.error || fallback;
}

function getProductsFromResponse(result) {
  return result.products || result.data?.products || [];
}

function getSkuSet(products) {
  const skuSet = new Set();

  for (const product of products) {
    if (product.sku) skuSet.add(String(product.sku).trim().toLowerCase());

    for (const variant of product.variants || []) {
      if (variant.sku) skuSet.add(String(variant.sku).trim().toLowerCase());
    }
  }

  return skuSet;
}

export default function BulkUploadPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  const [categories, setCategories] = useState([]);
  const [existingSKUs, setExistingSKUs] = useState(new Set());
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  const [uploadHistory, setUploadHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadUploadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch("/api/v1/seller/bulk-upload", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load upload history.");
      }

      setUploadHistory(result.uploads || []);
    } catch (error) {
      setHistoryError(error.message || "Unable to load upload history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceData() {
      const results = await Promise.allSettled([
        fetch("/api/v1/seller/categories", { cache: "no-store" }),
        fetch("/api/v1/seller/products", { cache: "no-store" }),
      ]);

      if (cancelled) return;
      const errors = [];

      if (results[0].status === "fulfilled") {
        try {
          const response = results[0].value;
          const result = await response.json();
          if (!response.ok) {
            throw new Error(getErrorMessage(result, "Could not load categories."));
          }

          const categoryData =
            result.categories || result.data?.categories || result.data || [];
          setCategories(flattenCategories(categoryData));
          setCategoriesLoaded(true);
        } catch (error) {
          errors.push(error.message || "Could not load categories.");
        }
      } else {
        errors.push("Could not load categories.");
      }

      if (results[1].status === "fulfilled") {
        try {
          const response = results[1].value;
          const result = await response.json();
          if (!response.ok) {
            throw new Error(getErrorMessage(result, "Could not check existing SKUs."));
          }

          setExistingSKUs(getSkuSet(getProductsFromResponse(result)));
          setProductsLoaded(true);
        } catch (error) {
          errors.push(error.message || "Could not check existing SKUs.");
        }
      } else {
        errors.push("Could not check existing SKUs.");
      }

      if (!cancelled) setLookupError(errors.join(" "));
    }

    loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadUploadHistory();
  }, [loadUploadHistory]);

  const validation = useMemo(() => {
    const skuCounts = new Map();

    for (const row of parsedRows) {
      const sku = String(row.data.sku || "").trim().toLowerCase();
      if (sku) skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
    }

    const activeCategories = categories.filter((category) => category.active);
    const categoryNames = new Set();

    for (const category of activeCategories) {
      categoryNames.add(category.name.toLowerCase());
      categoryNames.add(category.label.toLowerCase());
    }

    const results = parsedRows.map(({ rowNumber, data }) => {
      const errors = [];
      const name = data.name || "";
      const sku = data.sku || "";
      const category = data.category || "";
      const priceText = data.price ?? "";
      const quantityText = data.quantity ?? "";

      if (!name) errors.push("Product name is required.");

      if (!category) {
        errors.push("Category is required.");
      } else if (
        categoriesLoaded &&
        !categoryNames.has(category.toLowerCase())
      ) {
        errors.push("Category was not found or is inactive.");
      }

      if (!sku) {
        errors.push("SKU is required.");
      } else {
        if (skuCounts.get(sku.toLowerCase()) > 1) {
          errors.push("Duplicate SKU in this CSV.");
        }
        if (productsLoaded && existingSKUs.has(sku.toLowerCase())) {
          errors.push("SKU already exists in your products.");
        }
      }

      const price = Number(priceText);
      if (priceText === "" || !Number.isFinite(price) || price <= 0) {
        errors.push("Enter a valid price greater than zero.");
      }

      const quantity = Number(quantityText);
      if (quantityText === "" || !Number.isInteger(quantity) || quantity < 0) {
        errors.push("Quantity must be a whole number of zero or more.");
      }

      const compareAtPriceText = data.compareatprice ?? "";
      if (compareAtPriceText !== "") {
        const compareAtPrice = Number(compareAtPriceText);
        if (!Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
          errors.push("Compare-at price must be zero or more.");
        }
      }

      const costPriceText = data.costprice ?? "";
      if (costPriceText !== "") {
        const costPrice = Number(costPriceText);
        if (!Number.isFinite(costPrice) || costPrice < 0) {
          errors.push("Cost price must be zero or more.");
        }
      }

      const thresholdText = data.lowstockthreshold ?? "";
      if (thresholdText !== "") {
        const threshold = Number(thresholdText);
        if (!Number.isInteger(threshold) || threshold < 0) {
          errors.push("Low stock threshold must be a whole number of zero or more.");
        }
      }

      const weightText = data.weightgrams ?? "";
      if (weightText !== "") {
        const weight = Number(weightText);
        if (!Number.isInteger(weight) || weight < 1) {
          errors.push("Weight must be a positive whole number in grams.");
        }
      }

      if (data.imageurl) {
        try {
          const imageURL = new URL(data.imageurl);
          if (!["http:", "https:"].includes(imageURL.protocol)) {
            errors.push("Image URL must use HTTP or HTTPS.");
          }
        } catch {
          errors.push("Enter a valid image URL.");
        }
      }

      return { rowNumber, data, errors, valid: errors.length === 0 };
    });

    return {
      rows: results,
      validCount: results.filter((row) => row.valid).length,
      invalidCount: results.filter((row) => !row.valid).length,
    };
  }, [parsedRows, categories, categoriesLoaded, productsLoaded, existingSKUs]);

  const canValidate = categoriesLoaded && productsLoaded;

  const resetFile = () => {
    setFile(null);
    setParsedRows([]);
    setHeaders([]);
    setFileError("");
    setImportResult(null);
    setImportError("");
    setShowAllRows(false);
  };

  async function handleFile(fileToRead) {
    setFileError("");
    setImportResult(null);
    setImportError("");
    setShowAllRows(false);

    if (!fileToRead) return;

    if (!fileToRead.name.toLowerCase().endsWith(".csv")) {
      setFileError("Please select a CSV file.");
      return;
    }

    if (fileToRead.size > MAX_FILE_SIZE) {
      setFileError("File is too large. Maximum allowed size is 5 MB.");
      return;
    }

    setIsReading(true);

    try {
      const text = await fileToRead.text();
      const parsed = parseCSV(text);

      if (parsed.rows.length > MAX_ROWS) {
        throw new Error(`Maximum ${MAX_ROWS} product rows are allowed.`);
      }

      setFile(fileToRead);
      setHeaders(parsed.headers);
      setParsedRows(parsed.rows);
    } catch (error) {
      setFile(null);
      setParsedRows([]);
      setHeaders([]);
      setFileError(error.message || "Could not read this CSV file.");
    } finally {
      setIsReading(false);
    }
  }

  const handleDownloadTemplate = (includeSample = true) => {
    const rows = [CSV_HEADERS];
    if (includeSample) rows.push(...SAMPLE_ROWS);

    downloadCSV(
      includeSample
        ? "gali-bazar-product-template.csv"
        : "gali-bazar-blank-template.csv",
      rows
    );
    setDownloaded(true);
  };

  const handleDownloadErrors = () => {
    const failedRows = validation.rows.filter((row) => !row.valid);
    const rows = [
      [...headers, "validationErrors"],
      ...failedRows.map((row) => [
        ...headers.map((header) => row.data[header.toLowerCase()] ?? ""),
        row.errors.join(" "),
      ]),
    ];
    downloadCSV("gali-bazar-validation-errors.csv", rows);
  };

  const handleDownloadImportFailures = () => {
    const failedRows = (importResult?.results || []).filter((row) => !row.imported);
    const rows = [
      ["rowNumber", ...CSV_HEADERS, "errors"],
      ...failedRows.map((row) => [
        row.rowNumber ?? "",
        ...CSV_HEADERS.map((header) => {
          const key = header.toLowerCase();
          return row.data?.[key] ?? row[key] ?? "";
        }),
        (row.errors || []).join(" "),
      ]),
    ];
    downloadCSV("gali-bazar-import-failures.csv", rows);
  };

  const handleImport = async () => {
    if (!file) {
      setImportError("Please select a CSV file first.");
      return;
    }

    if (!canValidate) {
      setImportError(
        "Categories and products are still loading. Please try again in a moment."
      );
      return;
    }

    if (validation.validCount === 0) {
      setImportError("There are no valid rows to import. Fix the CSV errors first.");
      return;
    }

    setIsImporting(true);
    setImportError("");
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/seller/bulk-upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, `Import failed with status ${response.status}.`)
        );
      }

      setImportResult(result);

      const productsResponse = await fetch("/api/v1/seller/products", {
        cache: "no-store",
      });

      if (productsResponse.ok) {
        const productsResult = await productsResponse.json();
        setExistingSKUs(getSkuSet(getProductsFromResponse(productsResult)));
        setProductsLoaded(true);
      }

      await loadUploadHistory();
    } catch (error) {
      setImportError(
        error.message || "An unexpected error occurred while importing."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BulkUploadHeader onDownloadTemplate={handleDownloadTemplate} />

        <BulkUploadStats
          totalRows={parsedRows.length}
          validRows={validation.validCount}
          invalidRows={validation.invalidCount}
        />

        {downloaded && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>
              Template downloaded. Fill in your product data, save it as CSV,
              and upload it below.
            </p>
            <button
              type="button"
              onClick={() => setDownloaded(false)}
              className="ml-auto font-medium text-green-700 hover:text-green-900"
              aria-label="Dismiss template downloaded message"
            >
              Dismiss
            </button>
          </div>
        )}

        {lookupError && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{lookupError} Some validation checks may be unavailable until the data loads.</p>
          </div>
        )}

        <CsvUploadSection
          file={file}
          isDragging={isDragging}
          isReading={isReading}
          isImporting={isImporting}
          fileError={fileError}
          parsedRowsCount={parsedRows.length}
          onFileSelect={handleFile}
          onDropFile={handleFile}
          onRemoveFile={resetFile}
          onDragStateChange={setIsDragging}
        />

        {file && (
          <>
            <CsvPreviewTable
              validation={validation}
              canValidate={canValidate}
              showAllRows={showAllRows}
              onToggleRows={() => setShowAllRows((value) => !value)}
              onDownloadErrors={handleDownloadErrors}
            />

            <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Import products</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {validation.validCount} valid rows are ready to send to the server.
                    Server-side validation still applies.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={
                    isImporting ||
                    isReading ||
                    !canValidate ||
                    validation.validCount === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isImporting ? "Importing products..." : "Import valid products"}
                </button>
              </div>

              {!canValidate && (
                <p className="mt-3 text-sm text-gray-500">
                  Waiting for categories and products to load before importing.
                </p>
              )}

              {importError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{importError}</p>
                </div>
              )}
            </section>
          </>
        )}

        {importResult && (
          <ImportResults
            importResult={importResult}
            onDownloadFailures={handleDownloadImportFailures}
            onUploadAnother={resetFile}
          />
        )}

        <BeforeUploading
          onDownloadTemplate={() => handleDownloadTemplate(true)}
        />

        <UploadHistory
          uploads={uploadHistory}
          loading={historyLoading}
          error={historyError}
          onRefresh={loadUploadHistory}
        />

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-gray-900">Your product data is protected</p>
            <p className="mt-1">
              CSV data is validated in the browser and again by the server before
              import. Only import products you are authorized to manage.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
