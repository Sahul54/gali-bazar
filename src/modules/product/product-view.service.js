
import { prisma } from "@/lib/prisma";
import {
  recordProductView,
  deleteExpiredProductViews,
} from "./product-view.repository";

/**
 * Record a product view after validating product availability.
 */
export async function trackProductView({
  productId,
  userId = null,
  sessionId = null,
}) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  if (!userId && !sessionId) {
    throw new Error("User ID or session ID is required.");
  }

  if (sessionId && sessionId.length > 128) {
    throw new Error("Invalid session ID.");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: "ACTIVE",
      sellerProfile: {
        status: "APPROVED",
        user: {
          isActive: true,
        },
      },
      category: {
        isActive: true,
      },
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new Error("Product not found or unavailable.");
  }

  return recordProductView({
    productId,
    userId,
    sessionId,
  });
}

/**
 * Remove product views older than 30 days.
 */
export async function cleanupProductViews() {
  return deleteExpiredProductViews();
}
