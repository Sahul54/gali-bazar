import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function getStockDetails(inventory) {
  const quantity = inventory?.quantity ?? 0;
  const reservedQuantity = inventory?.reservedQuantity ?? 0;
  const availableStock = Math.max(0, quantity - reservedQuantity);
  const lowStockThreshold = inventory?.lowStockThreshold ?? 10;

  return {
    quantity,
    reservedQuantity,
    availableStock,
    lowStockThreshold,
    lowStock:
      availableStock > 0 &&
      availableStock <= lowStockThreshold,
    outOfStock: availableStock === 0,
  };
}

export async function GET(request) {
  try {
    // 1. Authenticate user
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse(
        "Please log in to access inventory.",
        401
      );
    }

    // 2. Validate pagination parameters
    const { searchParams } = new URL(request.url);

    const requestedPage = Number(searchParams.get("page") ?? 1);
    const requestedLimit = Number(
      searchParams.get("limit") ?? DEFAULT_LIMIT
    );

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1
    ) {
      return errorResponse(
        "Page must be a positive integer.",
        400
      );
    }

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return errorResponse(
        "Limit must be a positive integer.",
        400
      );
    }

    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const page = requestedPage;
    const skip = (page - 1) * limit;

    // 3. Verify seller is active and approved
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

    const sellerProfileId = seller?.sellerProfile?.id;

    if (!sellerProfileId) {
      return errorResponse(
        "Only active, approved sellers can access inventory.",
        403
      );
    }

    const productWhere = { sellerProfileId };

    // 4. Fetch only the requested page.
    // Summary query loads only the compact variant/stock fields.
    const [products, totalProducts, summaryVariants] =
      await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          orderBy: [
            { updatedAt: "desc" },
            { id: "desc" },
          ],
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            brand: true,
            status: true,

            category: {
              select: {
                id: true,
                name: true,
              },
            },

            images: {
              take: 1,
              orderBy: { sortOrder: "asc" },
              select: {
                imageUrl: true,
                altText: true,
              },
            },

            variants: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                title: true,
                sku: true,
                price: true,
                isActive: true,

                inventory: {
                  select: {
                    id: true,
                    quantity: true,
                    reservedQuantity: true,
                    lowStockThreshold: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        }),

        prisma.product.count({
          where: productWhere,
        }),

        prisma.productVariant.findMany({
          where: {
            product: {
              sellerProfileId,
            },
          },
          select: {
            isActive: true,
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                lowStockThreshold: true,
              },
            },
          },
        }),
      ]);

    // 5. Format the products on the current page
    const inventoryProducts = products.map((product) => {
      const variants = product.variants.map((variant) => {
        const stock = getStockDetails(variant.inventory);

        return {
          variantId: variant.id,
          inventoryId: variant.inventory?.id ?? null,
          title: variant.title,
          sku: variant.sku,
          price: Number(variant.price),
          isActive: variant.isActive,
          ...stock,
          inventoryUpdatedAt:
            variant.inventory?.updatedAt ?? null,
        };
      });

      const totalStock = variants.reduce(
        (sum, variant) => sum + variant.quantity,
        0
      );

      const totalReserved = variants.reduce(
        (sum, variant) => sum + variant.reservedQuantity,
        0
      );

      const totalAvailable = variants.reduce(
        (sum, variant) => sum + variant.availableStock,
        0
      );

      const activeVariants = variants.filter(
        (variant) => variant.isActive
      );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        status: product.status,
        category: product.category,

        image: product.images[0]?.imageUrl ?? null,
        imageAlt:
          product.images[0]?.altText ?? product.name,

        variants,
        variantCount: variants.length,
        totalStock,
        totalReserved,
        totalAvailable,

        lowStock: activeVariants.some(
          (variant) => variant.lowStock
        ),

        outOfStock:
          activeVariants.length > 0 &&
          activeVariants.every(
            (variant) => variant.outOfStock
          ),

        hasOutOfStock: activeVariants.some(
          (variant) => variant.outOfStock
        ),
      };
    });

    // 6. Calculate summary across ALL seller variants,
    // not just the products displayed on this page.
    const activeSummaryVariants = summaryVariants.filter(
      (variant) => variant.isActive
    );

    const summary = {
      totalProducts,

      totalVariants: summaryVariants.length,

      totalStock: summaryVariants.reduce(
        (sum, variant) =>
          sum + getStockDetails(variant.inventory).quantity,
        0
      ),

      totalReserved: summaryVariants.reduce(
        (sum, variant) =>
          sum +
          getStockDetails(variant.inventory).reservedQuantity,
        0
      ),

      totalAvailable: summaryVariants.reduce(
        (sum, variant) =>
          sum +
          getStockDetails(variant.inventory).availableStock,
        0
      ),

      lowStockVariants: activeSummaryVariants.filter(
        (variant) =>
          getStockDetails(variant.inventory).lowStock
      ).length,

      outOfStockVariants: activeSummaryVariants.filter(
        (variant) =>
          getStockDetails(variant.inventory).outOfStock
      ).length,
    };

    // 7. Pagination metadata
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json(
      {
        success: true,
        summary,
        products: inventoryProducts,
        pagination: {
          page,
          limit,
          totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Seller inventory GET error:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });

    return errorResponse(
      "Unable to load inventory. Please check the server logs.",
      500
    );
  }
}