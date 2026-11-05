
import { prisma } from "@/lib/prisma";
import { getProductSalesAnalytics } from "./product-analytics.repository";

const POPULARITY_WEIGHTS = {
  sales: 0.5,
  views: 0.25,
  recency: 0.15,
  stock: 0.1,
};

const ANALYTICS_DAYS = 30;

/**
 * Normalize a value against the highest value.
 * Returns a score between 0 and 100.
 */
function normalizeScore(value, maxValue) {
  if (!maxValue || maxValue <= 0) return 0;

  return Math.min(100, (value / maxValue) * 100);
}

/**
 * Calculate product freshness score.
 * Newer products receive a higher score.
 */
function calculateRecencyScore(createdAt) {
  const ageInDays =
    (Date.now() - new Date(createdAt).getTime()) /
    (1000 * 60 * 60 * 24);

  return Math.max(
    0,
    100 - (ageInDays / ANALYTICS_DAYS) * 100
  );
}

/**
 * Get popular products based on sales, views,
 * product freshness and stock availability.
 */
export async function getPopularProducts({ limit = 8 } = {}) {
  const safeLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 8, 1),
    50
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - ANALYTICS_DAYS);

  // Fetch sales and views analytics in parallel.
  const [salesAnalytics, viewsAnalytics, products] =
    await Promise.all([
      getProductSalesAnalytics({
        days: ANALYTICS_DAYS,
      }),

      prisma.productView.groupBy({
        by: ["productId"],
        where: {
          viewedAt: {
            gte: startDate,
          },
        },
        _count: {
          _all: true,
        },
        _max: {
          viewedAt: true,
        },
      }),

      prisma.product.findMany({
        where: {
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
      }),
    ]);

  // Create lookup maps for analytics.
  const salesMap = new Map(
    salesAnalytics.map((item) => [
      item.productId,
      item.soldQuantity,
    ])
  );

  const viewsMap = new Map(
    viewsAnalytics.map((item) => [
      item.productId,
      {
        totalViews: item._count._all,
        lastViewedAt: item._max.viewedAt,
      },
    ])
  );

  // Calculate maximum values for normalization.
  const maxSales = Math.max(
    0,
    ...salesAnalytics.map((item) => item.soldQuantity)
  );

  const maxViews = Math.max(
    0,
    ...viewsAnalytics.map((item) => item._count._all)
  );

  // Calculate popularity score for each product.
  const rankedProducts = products.map((product) => {
    const soldQuantity = salesMap.get(product.id) || 0;

    const viewData = viewsMap.get(product.id) || {
      totalViews: 0,
      lastViewedAt: null,
    };

    const availableStock = product.variants.reduce(
      (total, variant) => {
        const inventory = variant.inventory;

        if (!inventory) return total;

        return (
          total +
          Math.max(
            0,
            inventory.quantity - inventory.reservedQuantity
          )
        );
      },
      0
    );

    const salesScore = normalizeScore(
      soldQuantity,
      maxSales
    );

    const viewsScore = normalizeScore(
      viewData.totalViews,
      maxViews
    );

    const recencyScore = calculateRecencyScore(
      product.createdAt
    );

    const stockScore = availableStock > 0 ? 100 : 0;

    const popularityScore =
      salesScore * POPULARITY_WEIGHTS.sales +
      viewsScore * POPULARITY_WEIGHTS.views +
      recencyScore * POPULARITY_WEIGHTS.recency +
      stockScore * POPULARITY_WEIGHTS.stock;

    return {
      ...product,
      popularityScore: Number(popularityScore.toFixed(2)),
      popularityMetrics: {
        soldQuantity,
        totalViews: viewData.totalViews,
        lastViewedAt: viewData.lastViewedAt,
        availableStock,
        salesScore: Number(salesScore.toFixed(2)),
        viewsScore: Number(viewsScore.toFixed(2)),
        recencyScore: Number(recencyScore.toFixed(2)),
        stockScore,
      },
    };
  });

  // Highest popularity score first.
  rankedProducts.sort((a, b) => {
    if (b.popularityScore !== a.popularityScore) {
      return b.popularityScore - a.popularityScore;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return rankedProducts.slice(0, safeLimit);
}
