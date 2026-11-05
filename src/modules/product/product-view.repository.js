
import { prisma } from "@/lib/prisma";

const VIEW_DEDUPLICATION_MINUTES = 30;
const VIEW_RETENTION_DAYS = 30;
const MAX_RECENT_PRODUCTS = 50;

/**
 * Record a product view.
 * Same product viewed again within 30 minutes updates
 * the existing record instead of creating a duplicate.
 */
export async function recordProductView({
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

  const deduplicationTime = new Date(
    Date.now() - VIEW_DEDUPLICATION_MINUTES * 60 * 1000
  );

  return prisma.$transaction(async (tx) => {
    // Identify the customer or guest session.
    const identityFilter = userId
      ? { userId }
      : { sessionId };

    // Check whether this product was viewed recently.
    const existingView = await tx.productView.findFirst({
      where: {
        productId,
        ...identityFilter,
        viewedAt: {
          gte: deduplicationTime,
        },
      },
      select: {
        id: true,
      },
    });

    let view;

    if (existingView) {
      // Update the timestamp instead of creating a duplicate.
      view = await tx.productView.update({
        where: {
          id: existingView.id,
        },
        data: {
          viewedAt: new Date(),
        },
      });
    } else {
      // Create a new product view.
      view = await tx.productView.create({
        data: {
          productId,
          userId,
          sessionId,
        },
      });
    }

    // Keep only the latest 50 unique products
    // for this user or guest session.
    const olderViews = await tx.productView.findMany({
      where: identityFilter,
      orderBy: {
        viewedAt: "desc",
      },
      skip: MAX_RECENT_PRODUCTS,
      select: {
        id: true,
      },
    });

    if (olderViews.length > 0) {
      await tx.productView.deleteMany({
        where: {
          id: {
            in: olderViews.map((item) => item.id),
          },
        },
      });
    }

    return view;
  });
}

/**
 * Delete product views older than 30 days.
 * This function can be called by a scheduled cleanup job.
 */
export async function deleteExpiredProductViews() {
  const retentionDate = new Date(
    Date.now() - VIEW_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  const result = await prisma.productView.deleteMany({
    where: {
      viewedAt: {
        lt: retentionDate,
      },
    },
  });

  return {
    deletedCount: result.count,
  };
}
