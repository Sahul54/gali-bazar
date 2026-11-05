
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

function respond(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function PATCH(request, { params }) {
  try {
    // 1. Authenticate seller
    const session = await getSession();

    if (!session?.userId) {
      return respond("Please log in to continue.", 401);
    }

    if (session.role !== "SELLER") {
      return respond("Seller access required.", 403);
    }

    // 2. Verify approved seller
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

    const { productId } = await params;

    if (!productId) {
      return respond("Product ID is required.");
    }

    // 3. Read requested status
    let body;

    try {
      body = await request.json();
    } catch {
      return respond("Invalid JSON request body.");
    }

    const { status } = body;

    if (!["ACTIVE", "DRAFT"].includes(status)) {
      return respond("Only ACTIVE or DRAFT status is allowed.");
    }

    // 4. Find product belonging to this seller
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerProfileId: seller.sellerProfile.id,
      },
      select: {
        id: true,
        name: true,
        status: true,
        category: {
          select: {
            isActive: true,
          },
        },
        variants: {
          select: {
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      return respond("Product not found.", 404);
    }

    // 5. Validate before publishing
    if (status === "ACTIVE") {
      if (product.status === "ARCHIVED") {
        return respond(
          "Archived products cannot be published. Restore the product first."
        );
      }

      if (!product.category?.isActive) {
        return respond("Product category is inactive.");
      }

      const hasValidVariant = product.variants.some(
        (variant) =>
          variant.isActive &&
          Number.isFinite(Number(variant.price)) &&
          Number(variant.price) > 0
      );

      if (!hasValidVariant) {
        return respond(
          "Add at least one active variant with a valid selling price before publishing."
        );
      }
    }

    // 6. Update product status
    const updatedProduct = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          status === "ACTIVE"
            ? "Product published successfully."
            : "Product unpublished successfully.",
        product: updatedProduct,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("UPDATE_SELLER_PRODUCT_STATUS_ERROR:", error);

    return respond("Unable to update product status.", 500);
  }
}
