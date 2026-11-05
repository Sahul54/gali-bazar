
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

  const identityFilter = userId
    ? { userId }
    : { sessionId };

  const views = await prisma.productView.findMany({
    where: {
      ...identityFilter,

      product: {
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
    },

    orderBy: {
      viewedAt: "desc",
    },

    // Fetch extra records because duplicate product views
    // will be removed before applying the final limit.
    take: MAX_RECENT_PRODUCTS,

    select: {
      id: true,
      viewedAt: true,

      product: {
        include: {
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

  // Keep only the latest view of each unique product.
  const uniqueProducts = [];
  const seenProductIds = new Set();

  for (const view of views) {
    const product = view.product;

    if (seenProductIds.has(product.id)) {
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
