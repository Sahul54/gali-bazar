
import { prisma } from "@/lib/prisma";

/**
 * Get delivered sales analytics for products.
 *
 * Returns:
 * - productId
 * - soldQuantity
 * - orderCount
 */
export async function getProductSalesAnalytics({
  days = 30,
} = {}) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: "DELIVERED",
        createdAt: {
          gte: startDate,
        },
      },
    },
    _sum: {
      quantity: true,
    },
    _count: {
      orderId: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
  });

  return sales.map((item) => ({
    productId: item.productId,
    soldQuantity: item._sum.quantity || 0,
    orderCount: item._count.orderId || 0,
  }));
}

/**
 * Get all-time delivered sales analytics.
 */
export async function getAllTimeProductSalesAnalytics() {
  const sales = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: "DELIVERED",
      },
    },
    _sum: {
      quantity: true,
    },
    _count: {
      orderId: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
  });

  return sales.map((item) => ({
    productId: item.productId,
    soldQuantity: item._sum.quantity || 0,
    orderCount: item._count.orderId || 0,
  }));
}
