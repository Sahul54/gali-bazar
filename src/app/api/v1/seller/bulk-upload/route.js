
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 5000;

const ALLOWED_HEADERS = [
  "name",
  "description",
  "brand",
  "category",
  "sku",
  "barcode",
  "price",
  "compareatprice",
  "costprice",
  "quantity",
  "lowstockthreshold",
  "varianttitle",
  "weightgrams",
  "imageurl",
];

const REQUIRED_HEADERS = [
  "name",
  "category",
  "sku",
  "price",
  "quantity",
];

function respond(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function normalize(value) {
  return String(value ?? "").trim();
}

// Makes values safe to store in Prisma JSON fields.
function jsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "number" && !Number.isFinite(item)
        ? null
        : item
    )
  );
}

function optionalNumber(value) {
  if (value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function makeSlug(value) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "product"
  );
}

function validText(value, maxLength) {
  return typeof value === "string" && value.length <= maxLength;
}

function validateRow(data, rowNumber, duplicateSKUs) {
  const errors = [];

  const name = normalize(data.name);
  const category = normalize(data.category);
  const sku = normalize(data.sku);
  const description = normalize(data.description);
  const brand = normalize(data.brand);
  const barcode = normalize(data.barcode);
  const variantTitle = normalize(data.varianttitle);
  const imageUrl = normalize(data.imageurl);

  const priceText = normalize(data.price);
  const quantityText = normalize(data.quantity);

  const price = Number(priceText);
  const compareAtPrice = optionalNumber(
    normalize(data.compareatprice)
  );
  const costPrice = optionalNumber(
    normalize(data.costprice)
  );
  const quantity = Number(quantityText);

  const lowStockThreshold =
    normalize(data.lowstockthreshold) === ""
      ? 10
      : Number(data.lowstockthreshold);

  const weightGrams = optionalNumber(
    normalize(data.weightgrams)
  );

  if (!name || name.length > 160) {
    errors.push("Product name is required (max 160 characters).");
  }

  if (!category) {
    errors.push("Category is required.");
  }

  if (!sku || sku.length > 100) {
    errors.push("SKU is required (max 100 characters).");
  } else if (duplicateSKUs.has(sku.toLowerCase())) {
    errors.push("Duplicate SKU in this CSV.");
  }

  if (
    priceText === "" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    errors.push("Selling price must be greater than zero.");
  }

  for (const [label, value] of [
    ["Compare-at price", compareAtPrice],
    ["Cost price", costPrice],
  ]) {
    if (
      Number.isNaN(value) ||
      (value !== null && (!Number.isFinite(value) || value < 0))
    ) {
      errors.push(`${label} must be a non-negative amount.`);
    }
  }

  if (
    quantityText === "" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0
  ) {
    errors.push("Quantity must be a non-negative whole number.");
  }

  if (
    !Number.isSafeInteger(lowStockThreshold) ||
    lowStockThreshold < 0
  ) {
    errors.push(
      "Low-stock threshold must be a non-negative whole number."
    );
  }

  if (
    Number.isNaN(weightGrams) ||
    (weightGrams !== null &&
      (!Number.isSafeInteger(weightGrams) || weightGrams < 1))
  ) {
    errors.push("Weight must be a positive whole number of grams.");
  }

  if (!validText(description, 5000)) {
    errors.push("Description must be at most 5000 characters.");
  }

  if (!validText(brand, 100)) {
    errors.push("Brand must be at most 100 characters.");
  }

  if (!validText(barcode, 100)) {
    errors.push("Barcode must be at most 100 characters.");
  }

  if (!validText(variantTitle, 100)) {
    errors.push("Variant title must be at most 100 characters.");
  }

  let normalizedImageUrl = null;

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push("Image URL must use HTTP or HTTPS.");
      } else {
        normalizedImageUrl = url.toString();
      }
    } catch {
      errors.push("Image URL is invalid.");
    }
  }

  return {
    rowNumber,
    errors,
    valid: errors.length === 0,
    imported: false,
    data: {
      name,
      category,
      sku,
      description,
      brand,
      barcode,
      variantTitle,
      price,
      compareAtPrice,
      costPrice,
      quantity,
      lowStockThreshold,
      weightGrams,
      imageUrl: normalizedImageUrl,
    },
  };
}

export async function POST(request) {
  let uploadId = null;
  let sellerProfileId = null;
  let totalRows = 0;
  let importedRows = 0;

  try {
    // 1. Authenticate seller.
    const session = await getSession();

    if (!session?.userId) {
      return respond("Please log in to continue.", 401);
    }

    if (session.role !== "SELLER") {
      return respond("Seller access required.", 403);
    }

    // 2. Verify seller status from the database.
    const seller = await prisma.user.findFirst({
      where: {
        id: session.userId,
        role: "SELLER",
        isActive: true,
        sellerProfile: {
          is: { status: "APPROVED" },
        },
      },
      select: {
        sellerProfile: {
          select: { id: true },
        },
      },
    });

    if (!seller?.sellerProfile) {
      return respond("An approved seller account is required.", 403);
    }

    sellerProfileId = seller.sellerProfile.id;

    // 3. Check request size.
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (
      contentLength > 0 &&
      contentLength > MAX_FILE_SIZE + 64 * 1024
    ) {
      return respond("Upload must not exceed 5 MB.", 413);
    }

    // 4. Read uploaded CSV.
    let formData;

    try {
      formData = await request.formData();
    } catch {
      return respond("Invalid multipart upload.");
    }

    const file = formData.get("file");

    if (
      !file ||
      typeof file === "string" ||
      typeof file.text !== "function"
    ) {
      return respond("Please select a CSV file.");
    }

    if (!file.name?.toLowerCase().endsWith(".csv")) {
      return respond("Only CSV files are allowed.");
    }

    if (file.size === 0) {
      return respond("The uploaded file is empty.");
    }

    if (file.size > MAX_FILE_SIZE) {
      return respond("Upload must not exceed 5 MB.", 413);
    }

    const csvText = await file.text();

    // 5. Parse CSV on the server.
    let records;

    try {
      records = parse(csvText, {
        bom: true,
        skip_empty_lines: true,
        relax_column_count: false,
        max_record_size: 100_000,
      });
    } catch {
      return respond(
        "Invalid CSV format. Check quotes, commas and column counts."
      );
    }

    if (!records.length || records.length < 2) {
      return respond("CSV must contain headers and product rows.");
    }

    const headers = records[0].map((header) =>
      normalize(header).toLowerCase()
    );

    if (headers.some((header) => !header)) {
      return respond("CSV contains an empty column header.");
    }

    if (new Set(headers).size !== headers.length) {
      return respond("CSV contains duplicate column headers.");
    }

    const unknownHeaders = headers.filter(
      (header) => !ALLOWED_HEADERS.includes(header)
    );

    if (unknownHeaders.length) {
      return respond(
        `Unknown columns: ${unknownHeaders.join(", ")}. Use the Gali Bazar template.`
      );
    }

    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length) {
      return respond(
        `Missing required columns: ${missingHeaders.join(", ")}.`
      );
    }

    const csvRows = records.slice(1);

    if (csvRows.length > MAX_ROWS) {
      return respond(`Maximum ${MAX_ROWS} products per upload.`, 413);
    }

    totalRows = csvRows.length;

    // 6. Detect duplicate SKUs inside this CSV.
    const skuCounts = new Map();

    for (const values of csvRows) {
      const skuIndex = headers.indexOf("sku");
      const sku = normalize(values[skuIndex]).toLowerCase();

      if (sku) {
        skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
      }
    }

    const duplicateSKUs = new Set(
      [...skuCounts.entries()]
        .filter(([, count]) => count > 1)
        .map(([sku]) => sku)
    );

    // 7. Validate each row and preserve original CSV values.
    const results = [];

    for (let index = 0; index < csvRows.length; index++) {
      const values = csvRows[index];
      const rowData = {};

      headers.forEach((header, columnIndex) => {
        rowData[header] = normalize(values[columnIndex]);
      });

      const result = validateRow(
        rowData,
        index + 2,
        duplicateSKUs
      );

      result.sourceData = rowData;
      results.push(result);
    }

    // 8. Load active categories.
    const activeCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    const categoriesByName = new Map();

    for (const category of activeCategories) {
      const key = category.name.trim().toLowerCase();
      const matches = categoriesByName.get(key) || [];

      matches.push(category);
      categoriesByName.set(key, matches);
    }

    // 9. Create history record before importing products.
    const upload = await prisma.bulkUpload.create({
      data: {
        sellerProfileId,
        fileName: file.name.slice(0, 255),
        totalRows,
        importedRows: 0,
        failedRows: 0,
        status: "PROCESSING",
      },
      select: { id: true },
    });

    uploadId = upload.id;

    // 10. Import valid rows, each in its own transaction.
    for (const result of results) {
      if (!result.valid) continue;

      const data = result.data;

      const categoryMatches =
        categoriesByName.get(data.category.toLowerCase()) || [];

      if (categoryMatches.length === 0) {
        result.valid = false;
        result.errors.push("Category does not exist or is inactive.");
        continue;
      }

      if (categoryMatches.length > 1) {
        result.valid = false;
        result.errors.push(
          "Category name is ambiguous. Use a unique category name."
        );
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          // Check SKU uniqueness across all sellers.
          const existingSKU = await tx.productVariant.findFirst({
            where: {
              sku: {
                equals: data.sku,
                mode: "insensitive",
              },
            },
            select: { id: true },
          });

          if (existingSKU) {
            const error = new Error("SKU_ALREADY_EXISTS");
            error.code = "SKU_ALREADY_EXISTS";
            throw error;
          }

          const slug = `${makeSlug(data.name)}-${randomUUID().slice(0, 8)}`;

          await tx.product.create({
            data: {
              name: data.name,
              slug,
              description: data.description || null,
              brand: data.brand || null,
              status: "DRAFT",
              sellerProfileId,
              categoryId: categoryMatches[0].id,

              ...(data.imageUrl
                ? {
                    images: {
                      create: {
                        imageUrl: data.imageUrl,
                        altText: data.name,
                        sortOrder: 0,
                      },
                    },
                  }
                : {}),

              variants: {
                create: {
                  sku: data.sku,
                  barcode: data.barcode || null,
                  title: data.variantTitle || null,
                  price: data.price.toFixed(2),
                  compareAtPrice:
                    data.compareAtPrice === null
                      ? null
                      : data.compareAtPrice.toFixed(2),
                  costPrice:
                    data.costPrice === null
                      ? null
                      : data.costPrice.toFixed(2),
                  weightGrams: data.weightGrams,
                  isActive: true,

                  inventory: {
                    create: {
                      quantity: data.quantity,
                      reservedQuantity: 0,
                      lowStockThreshold: data.lowStockThreshold,

                      movements: {
                        create: {
                          type: "OPENING_STOCK",
                          quantity: data.quantity,
                          note: "Initial stock from bulk product upload",
                          reference: "BULK_PRODUCT_CREATION",
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        result.imported = true;
        importedRows++;
      } catch (error) {
        result.valid = false;

        if (
          error?.code === "SKU_ALREADY_EXISTS" ||
          error?.code === "P2002"
        ) {
          result.errors.push("SKU already exists. Use a unique SKU.");
        } else {
          console.error("BULK_PRODUCT_ROW_IMPORT_ERROR:", {
            rowNumber: result.rowNumber,
            code: error?.code,
          });

          result.errors.push(
            "Could not import this product. Check its data and try again."
          );
        }
      }
    }

    // 11. Persist the result for every CSV row.
    const rowHistory = results.map((result) => ({
      uploadId,
      rowNumber: result.rowNumber,
      sku: result.data.sku || null,
      productName: result.data.name || null,
      imported: result.imported === true,
      errors: jsonSafe(result.errors),
      data: jsonSafe(result.sourceData),
    }));

    if (rowHistory.length > 0) {
      await prisma.bulkUploadRow.createMany({
        data: rowHistory,
      });
    }

    // 12. Update upload summary and final status.
    const failed = results.length - importedRows;

    const status =
      failed === 0
        ? "COMPLETED"
        : importedRows === 0
          ? "FAILED"
          : "COMPLETED_WITH_ERRORS";

    await prisma.bulkUpload.update({
      where: { id: uploadId },
      data: {
        totalRows: results.length,
        importedRows,
        failedRows: failed,
        status,
      },
    });

    // 13. Return results to the existing frontend.
    return NextResponse.json(
      {
        success: failed === 0,
        message:
          failed === 0
            ? "All products imported successfully."
            : "Import completed with some failed rows.",
        uploadId,
        summary: {
          total: results.length,
          imported: importedRows,
          failed,
        },
        results: results.map((result) => ({
          rowNumber: result.rowNumber,
          sku: result.data.sku,
          name: result.data.name,
          imported: result.imported === true,
          errors: result.errors,
          data: result.sourceData,
        })),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("SELLER_BULK_UPLOAD_ERROR:", error);

    // If history was created, try to mark it failed.
    if (uploadId && sellerProfileId) {
      try {
        await prisma.bulkUpload.updateMany({
          where: {
            id: uploadId,
            sellerProfileId,
          },
          data: {
            status: "FAILED",
            totalRows,
            importedRows,
            failedRows: Math.max(0, totalRows - importedRows),
          },
        });
      } catch (historyError) {
        console.error("BULK_UPLOAD_HISTORY_UPDATE_ERROR:", {
          code: historyError?.code,
        });
      }
    }

    return respond("Unable to process the CSV upload.", 500);
  }
}


export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return respond("Please log in to continue.", 401);
    }

    if (session.role !== "SELLER") {
      return respond("Seller access required.", 403);
    }

    const seller = await prisma.user.findFirst({
      where: {
        id: session.userId,
        role: "SELLER",
        isActive: true,
        sellerProfile: {
          is: { status: "APPROVED" },
        },
      },
      select: {
        sellerProfile: {
          select: { id: true },
        },
      },
    });

    if (!seller?.sellerProfile) {
      return respond("An approved seller account is required.", 403);
    }

    const uploads = await prisma.bulkUpload.findMany({
      where: {
        sellerProfileId: seller.sellerProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        fileName: true,
        totalRows: true,
        importedRows: true,
        failedRows: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        uploads,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("SELLER_BULK_UPLOAD_HISTORY_ERROR:", error);
    return respond("Unable to load upload history.", 500);
  }
}