
import {
  getRecentlyViewedProducts,
} from "./recently-viewed.repository";

const MAX_RECENT_PRODUCTS = 50;

/**
 * Get recently viewed products for a customer.
 */
export async function getRecentlyViewed({
  userId = null,
  sessionId = null,
  limit = 8,
} = {}) {
  if (!userId && !sessionId) {
    throw new Error("User ID or session ID is required.");
  }

  if (
    sessionId &&
    (typeof sessionId !== "string" ||
      sessionId.length < 10 ||
      sessionId.length > 128)
  ) {
    throw new Error("Invalid session ID.");
  }

  const parsedLimit = Number.parseInt(limit, 10);

  const safeLimit = Math.min(
    Math.max(Number.isNaN(parsedLimit) ? 8 : parsedLimit, 1),
    MAX_RECENT_PRODUCTS
  );

  const products = await getRecentlyViewedProducts({
    userId,
    sessionId,
    limit: safeLimit,
  });

  return {
    products,
    count: products.length,
  };
}
