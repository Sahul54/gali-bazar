
import { prisma } from "@/lib/prisma";

const MAX_RECENT_PRODUCTS = 50;

/**
 * Get recently viewed products for a logged-in customer
 * or guest session.
 */
export async function getRecentlyViewedProducts({
  userId = null,
  sessionId = null,
  limit = 8,
}) {
  if (!userId && !sessionId) {
    throw new Error("User ID or session ID is required.");
  }

  const safeLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 8, 1),
    MAX_RECENT_PRODUCTS
  );

  // Logged-in user takes priority.
  // Do not force the other identity field to null.
  const identityFilter = userId
    ? { userId }
    : { sessionId };

  const views = await prisma.productView.findMany({
    where: {
      ...identityFilter,

      product: {
        is: {
          status: "ACTIVE",
        },
      },
    },

    orderBy: {
      viewedAt: "desc",
    },

    take: MAX_RECENT_PRODUCTS,

    select: {
      id: true,
      userId: true,
      sessionId: true,
      productId: true,
      viewedAt: true,

      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          description: true,
          status: true,
          sellerProfileId: true,

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          sellerProfile: {
            select: {
              id: true,
              businessName: true,
              status: true,
            },
          },

          images: {
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
          },

          variants: {
            where: {
              isActive: true,
            },
            include: {
              inventory: true,
            },
          },
        },
      },
    },
  });

  // Remove duplicate products while preserving latest viewed order.
  const uniqueProducts = [];
  const seenProductIds = new Set();

  for (const view of views) {
    const product = view.product;

    if (!product || seenProductIds.has(product.id)) {
      continue;
    }

    seenProductIds.add(product.id);

    uniqueProducts.push({
      ...product,
      lastViewedAt: view.viewedAt,
    });

    if (uniqueProducts.length >= safeLimit) {
      break;
    }
  }

  return uniqueProducts;
}
