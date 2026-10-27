import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function makeSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140) || "product";
}

async function getApprovedSeller() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      error: errorResponse("Please log in to continue.", 401),
    };
  }

  if (session.role !== "SELLER") {
    return {
      error: errorResponse("Seller access required.", 403),
    };
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
    return {
      error: errorResponse(
        "An approved seller account is required.",
        403
      ),
    };
  }

  return { sellerProfileId: seller.sellerProfile.id };
}

function formatProduct(product) {
  const variant = product.variants[0];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    brand: product.brand ?? "",
    slug: product.slug,
    status: product.status,
    categoryId: product.categoryId,
    category: product.category,
    imageUrl: product.images[0]?.imageUrl ?? "",
    sku: variant?.sku ?? "",
    barcode: variant?.barcode ?? "",
    variantTitle: variant?.title ?? "",
    price: variant?.price?.toString() ?? "",
    compareAtPrice: variant?.compareAtPrice?.toString() ?? "",
    costPrice: variant?.costPrice?.toString() ?? "",
    weightGrams: variant?.weightGrams?.toString() ?? "",
    quantity: variant?.inventory?.quantity ?? 0,
    reservedQuantity: variant?.inventory?.reservedQuantity ?? 0,
    lowStockThreshold: variant?.inventory?.lowStockThreshold ?? 10,
  };
}

// GET /api/v1/seller/products/[productId]
export async function GET(_request, { params }) {
  try {
    const auth = await getApprovedSeller();

    if (auth.error) return auth.error;

    const { productId } = await params;

    if (!productId) {
      return errorResponse("Product ID is required.");
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerProfileId: auth.sellerProfileId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        variants: {
          orderBy: { createdAt: "asc" },
          take: 1,
          include: { inventory: true },
        },
      },
    });

    if (!product) {
      return errorResponse("Product not found.", 404);
    }

    return NextResponse.json({
      success: true,
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("GET_SELLER_PRODUCT_ERROR:", error);

    return errorResponse("Unable to load this product.", 500);
  }
}

// PATCH /api/v1/seller/products/[productId]
export async function PATCH(request, { params }) {
  try {
    const auth = await getApprovedSeller();

    if (auth.error) return auth.error;

    const { productId } = await params;

    if (!productId) {
      return errorResponse("Product ID is required.");
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.");
    }

    const {
      name,
      description,
      brand,
      categoryId,
      imageUrl,
      sku,
      barcode,
      price,
      compareAtPrice,
      costPrice,
      quantity,
      lowStockThreshold,
      variantTitle,
      weightGrams,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 160
    ) {
      return errorResponse(
        "Product name is required and must be at most 160 characters."
      );
    }

    if (typeof categoryId !== "string" || !categoryId.trim()) {
      return errorResponse("Please select a category.");
    }

    if (
      typeof sku !== "string" ||
      !sku.trim() ||
      sku.trim().length > 100
    ) {
      return errorResponse("A valid SKU is required.");
    }

    if (
      description != null &&
      (typeof description !== "string" || description.length > 5000)
    ) {
      return errorResponse("Description must be at most 5000 characters.");
    }

    if (
      brand != null &&
      (typeof brand !== "string" || brand.trim().length > 100)
    ) {
      return errorResponse("Brand must be at most 100 characters.");
    }

    if (
      variantTitle != null &&
      (typeof variantTitle !== "string" ||
        variantTitle.trim().length > 100)
    ) {
      return errorResponse("Variant name must be at most 100 characters.");
    }

    if (
      barcode != null &&
      (typeof barcode !== "string" || barcode.trim().length > 100)
    ) {
      return errorResponse("Barcode must be at most 100 characters.");
    }

    const sellingPrice = Number(price);
    const mrp = optionalNumber(compareAtPrice);
    const purchaseCost = optionalNumber(costPrice);
    const openingQuantity = Number(quantity);
    const stockThreshold = Number(lowStockThreshold ?? 10);
    const weight = optionalNumber(weightGrams);

    if (
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      return errorResponse("Enter a valid selling price greater than zero.");
    }

    if (
      mrp !== null &&
      (!Number.isFinite(mrp) || mrp < 0)
    ) {
      return errorResponse("MRP must be a valid non-negative amount.");
    }

    if (
      purchaseCost !== null &&
      (!Number.isFinite(purchaseCost) || purchaseCost < 0)
    ) {
      return errorResponse("Cost price must be a valid non-negative amount.");
    }

    if (
      !Number.isSafeInteger(openingQuantity) ||
      openingQuantity < 0
    ) {
      return errorResponse("Stock must be a non-negative whole number.");
    }

    if (
      !Number.isSafeInteger(stockThreshold) ||
      stockThreshold < 0
    ) {
      return errorResponse(
        "Low-stock threshold must be a non-negative whole number."
      );
    }

    if (
      weight !== null &&
      (!Number.isSafeInteger(weight) || weight < 1)
    ) {
      return errorResponse("Weight must be a positive whole number of grams.");
    }

    let normalizedImageUrl = null;

    if (imageUrl != null && imageUrl !== "") {
      if (typeof imageUrl !== "string") {
        return errorResponse("Invalid image URL.");
      }

      try {
        const parsedUrl = new URL(imageUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return errorResponse("Image URL must use HTTP or HTTPS.");
        }

        normalizedImageUrl = parsedUrl.toString();
      } catch {
        return errorResponse("Enter a valid image URL.");
      }
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!category) {
      return errorResponse(
        "Selected category does not exist or is inactive."
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ownership check: sellers can only update their own products.
      const existingProduct = await tx.product.findFirst({
        where: {
          id: productId,
          sellerProfileId: auth.sellerProfileId,
        },
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: { inventory: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      });

      if (!existingProduct) {
        const notFound = new Error("PRODUCT_NOT_FOUND");
        throw notFound;
      }

      const variant = existingProduct.variants[0];

      if (!variant) {
        const missingVariant = new Error("PRODUCT_VARIANT_MISSING");
        throw missingVariant;
      }

      if (!variant.inventory) {
        const missingInventory = new Error("PRODUCT_INVENTORY_MISSING");
        throw missingInventory;
      }

      if (openingQuantity < variant.inventory.reservedQuantity) {
        const reservedError = new Error("STOCK_BELOW_RESERVED");
        throw reservedError;
      }

      // Check SKU uniqueness without exposing another seller's product.
      const duplicateSku = await tx.productVariant.findFirst({
        where: {
          sku: sku.trim(),
          NOT: { id: variant.id },
        },
        select: { id: true },
      });

      if (duplicateSku) {
        const skuError = new Error("DUPLICATE_SKU");
        throw skuError;
      }

      let slug = makeSlug(name.trim());

      if (slug !== existingProduct.slug) {
        const slugExists = await tx.product.findFirst({
          where: {
            sellerProfileId: auth.sellerProfileId,
            slug,
            NOT: { id: existingProduct.id },
          },
          select: { id: true },
        });

        if (slugExists) {
          slug = `${slug}-${randomUUID().slice(0, 8)}`;
        }
      }

      const product = await tx.product.update({
        where: { id: existingProduct.id },
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          brand: brand?.trim() || null,
          categoryId: category.id,
        },
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          sku: sku.trim(),
          barcode: barcode?.trim() || null,
          title: variantTitle?.trim() || null,
          price: sellingPrice.toFixed(2),
          compareAtPrice: mrp === null ? null : mrp.toFixed(2),
          costPrice:
            purchaseCost === null ? null : purchaseCost.toFixed(2),
          weightGrams: weight,
        },
      });

      const quantityDifference =
        openingQuantity - variant.inventory.quantity;

      if (quantityDifference !== 0) {
        await tx.inventory.update({
          where: { id: variant.inventory.id },
          data: {
            quantity: openingQuantity,
            lowStockThreshold: stockThreshold,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            type: "ADJUSTMENT",
            quantity: quantityDifference,
            note: "Stock adjusted while editing product",
            reference: "PRODUCT_EDIT",
            inventoryId: variant.inventory.id,
          },
        });
      } else {
        await tx.inventory.update({
          where: { id: variant.inventory.id },
          data: {
            lowStockThreshold: stockThreshold,
          },
        });
      }

      // A blank image URL preserves the existing image.
      // A new URL replaces the first image or creates one if absent.
      if (normalizedImageUrl) {
        if (existingProduct.images[0]) {
          await tx.productImage.update({
            where: { id: existingProduct.images[0].id },
            data: {
              imageUrl: normalizedImageUrl,
              altText: name.trim(),
            },
          });
        } else {
          await tx.productImage.create({
            data: {
              imageUrl: normalizedImageUrl,
              altText: name.trim(),
              productId: existingProduct.id,
            },
          });
        }
      }

      return tx.product.findFirst({
        where: {
          id: product.id,
          sellerProfileId: auth.sellerProfileId,
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          variants: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: { inventory: true },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: formatProduct(result),
    });
  } catch (error) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return errorResponse("Product not found.", 404);
    }

    if (error.message === "PRODUCT_VARIANT_MISSING") {
      return errorResponse("This product has no variant to update.", 409);
    }

    if (error.message === "PRODUCT_INVENTORY_MISSING") {
      return errorResponse("This product has no inventory record.", 409);
    }

    if (error.message === "STOCK_BELOW_RESERVED") {
      return errorResponse(
        "Stock cannot be lower than the quantity already reserved."
      );
    }

    if (error.message === "DUPLICATE_SKU" || error.code === "P2002") {
      return errorResponse(
        "This SKU is already in use. Please enter a unique SKU.",
        409
      );
    }

    console.error("UPDATE_SELLER_PRODUCT_ERROR:", error);

    return errorResponse("Unable to update product.", 500);
  }
}
