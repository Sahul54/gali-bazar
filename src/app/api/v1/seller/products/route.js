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

function toOptionalNumber(value) {
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
    .slice(0, 140);
}

function isValidOptionalPrice(value) {
  return value === null || (
    Number.isFinite(value) && value >= 0
  );
}

export async function POST(request) {
  try {
    // 1. Verify authentication
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse(
        "Please log in to continue.",
        401
      );
    }

    if (session.role !== "SELLER") {
      return errorResponse(
        "Seller access required.",
        403
      );
    }

    // 2. Verify seller is active and approved
    const seller = await prisma.user.findFirst({
      where: {
        id: session.userId,
        role: "SELLER",
        isActive: true,
        sellerProfile: {
          is: {
            status: "APPROVED",
          },
        },
      },
      select: {
        sellerProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!seller?.sellerProfile) {
      return errorResponse(
        "An approved seller account is required.",
        403
      );
    }

    // 3. Parse request body
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

    // 4. Validate required text fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 160
    ) {
      return errorResponse(
        "Product name is required and must be at most 160 characters."
      );
    }

    if (
      typeof categoryId !== "string" ||
      !categoryId.trim()
    ) {
      return errorResponse("Please select a category.");
    }

    if (
      typeof sku !== "string" ||
      !sku.trim() ||
      sku.trim().length > 100
    ) {
      return errorResponse(
        "A valid SKU is required."
      );
    }

    if (
      description != null &&
      (typeof description !== "string" ||
        description.length > 5000)
    ) {
      return errorResponse(
        "Description must be at most 5000 characters."
      );
    }

    if (
      brand != null &&
      (typeof brand !== "string" ||
        brand.trim().length > 100)
    ) {
      return errorResponse(
        "Brand must be at most 100 characters."
      );
    }

    if (
      variantTitle != null &&
      (typeof variantTitle !== "string" ||
        variantTitle.trim().length > 100)
    ) {
      return errorResponse(
        "Variant name must be at most 100 characters."
      );
    }

    if (
      barcode != null &&
      (typeof barcode !== "string" ||
        barcode.trim().length > 100)
    ) {
      return errorResponse(
        "Barcode must be at most 100 characters."
      );
    }

    // 5. Validate prices
    const sellingPrice = Number(price);
    const mrp = toOptionalNumber(compareAtPrice);
    const purchaseCost = toOptionalNumber(costPrice);

    if (
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      return errorResponse(
        "Enter a valid selling price greater than zero."
      );
    }

    if (
      !isValidOptionalPrice(mrp) ||
      !isValidOptionalPrice(purchaseCost)
    ) {
      return errorResponse(
        "MRP and cost price must be valid non-negative amounts."
      );
    }

    // 6. Validate inventory values
    const openingQuantity = Number(quantity);
    const stockThreshold = Number(lowStockThreshold ?? 10);
    const weight = toOptionalNumber(weightGrams);

    if (
      !Number.isSafeInteger(openingQuantity) ||
      openingQuantity < 0
    ) {
      return errorResponse(
        "Opening quantity must be a non-negative whole number."
      );
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
      return errorResponse(
        "Weight must be a positive whole number of grams."
      );
    }

    // 7. Validate optional image URL
    let normalizedImageUrl = null;

    if (imageUrl != null && imageUrl !== "") {
      if (typeof imageUrl !== "string") {
        return errorResponse("Invalid image URL.");
      }

      try {
        const parsedUrl = new URL(imageUrl);

        if (
          !["http:", "https:"].includes(parsedUrl.protocol)
        ) {
          return errorResponse(
            "Image URL must use HTTP or HTTPS."
          );
        }

        normalizedImageUrl = parsedUrl.toString();
      } catch {
        return errorResponse("Enter a valid image URL.");
      }
    }

    // 8. Ensure category exists and is active
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return errorResponse(
        "Selected category does not exist or is inactive."
      );
    }

    const sellerProfileId = seller.sellerProfile.id;
    const cleanName = name.trim();
    const baseSlug = makeSlug(cleanName) || "product";

    // 9. Create all product records atomically
    const result = await prisma.$transaction(async (tx) => {
      let slug = baseSlug;

      const existingSlug = await tx.product.findFirst({
        where: {
          sellerProfileId,
          slug,
        },
        select: {
          id: true,
        },
      });

      if (existingSlug) {
        slug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
      }

      const product = await tx.product.create({
        data: {
          name: cleanName,
          slug,
          description: description?.trim() || null,
          brand: brand?.trim() || null,
          status: "DRAFT",
          sellerProfileId,
          categoryId: category.id,
          ...(normalizedImageUrl
            ? {
                images: {
                  create: {
                    imageUrl: normalizedImageUrl,
                    altText: cleanName,
                    sortOrder: 0,
                  },
                },
              }
            : {}),
          variants: {
            create: {
              sku: sku.trim(),
              barcode: barcode?.trim() || null,
              title: variantTitle?.trim() || null,
              price: sellingPrice.toFixed(2),
              compareAtPrice:
                mrp === null ? null : mrp.toFixed(2),
              costPrice:
                purchaseCost === null
                  ? null
                  : purchaseCost.toFixed(2),
              weightGrams: weight,
              isActive: true,
              inventory: {
                create: {
                  quantity: openingQuantity,
                  reservedQuantity: 0,
                  lowStockThreshold: stockThreshold,
                  movements: {
                    create: {
                      type: "OPENING_STOCK",
                      quantity: openingQuantity,
                      note: "Initial stock when product was created",
                      reference: "PRODUCT_CREATION",
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          images: true,
          variants: {
            include: {
              inventory: true,
            },
          },
        },
      });

      return product;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product created successfully as a draft.",
        product: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "P2002") {
      const fields = error.meta?.target;
      const isSkuConflict =
        Array.isArray(fields) && fields.includes("sku");

      return errorResponse(
        isSkuConflict
          ? "This SKU already exists. Please use a unique SKU."
          : "A duplicate value already exists. Please check the SKU and try again.",
        409
      );
    }

    console.error("CREATE_SELLER_PRODUCT_ERROR:", error);

    return errorResponse(
      "Unable to create product. Please try again.",
      500
    );
  }
}


export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Please log in to continue." },
        { status: 401 }
      );
    }

    if (session.role !== "SELLER") {
      return NextResponse.json(
        { success: false, message: "Seller access required." },
        { status: 403 }
      );
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
      return NextResponse.json(
        { success: false, message: "Approved seller account required." },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        sellerProfileId: seller.sellerProfile.id,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { imageUrl: true, altText: true },
        },
        variants: {
          orderBy: { createdAt: "asc" },
          include: {
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                lowStockThreshold: true,
              },
            },
          },
        },
      },
    });

    const formattedProducts = products.map((product) => {
      const variants = product.variants || [];

      const stock = variants.reduce(
        (total, variant) =>
          total + (variant.inventory?.quantity ?? 0),
        0
      );

      const availableStock = variants.reduce(
        (total, variant) =>
          total +
          Math.max(
            0,
            (variant.inventory?.quantity ?? 0) -
              (variant.inventory?.reservedQuantity ?? 0)
          ),
        0
      );

      const lowStock = variants.some((variant) => {
        const inventory = variant.inventory;
        return (
          inventory &&
          inventory.quantity <= inventory.lowStockThreshold
        );
      });

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        status: product.status,
        category: product.category,
        image: product.images[0]?.imageUrl ?? null,
        sku: variants.map((variant) => variant.sku).join(", ") || "—",
        price: variants[0]?.price?.toString() ?? "0.00",
        stock,
        availableStock,
        lowStock,
        variantCount: variants.length,
        updatedAt: product.updatedAt,
      };
    });

    const stats = {
      total: formattedProducts.length,
      active: formattedProducts.filter(
        (product) => product.status === "ACTIVE"
      ).length,
      lowStock: formattedProducts.filter(
        (product) => product.lowStock
      ).length,
    };

    return NextResponse.json(
      {
        success: true,
        products: formattedProducts,
        stats,
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (error) {
    console.error("GET_SELLER_PRODUCTS_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load products." },
      { status: 500 }
    );
  }
}
