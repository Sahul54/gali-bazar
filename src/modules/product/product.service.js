
import { productRepository } from "./product.repository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizePagination = ({ skip = 0, take = 20 } = {}) => {
  const parsedSkip = Number(skip);
  const parsedTake = Number(take);

  return {
    skip:
      Number.isSafeInteger(parsedSkip) && parsedSkip >= 0
        ? parsedSkip
        : 0,
    take:
      Number.isSafeInteger(parsedTake) && parsedTake > 0
        ? Math.min(parsedTake, 50)
        : 20,
  };
};

// Convert Prisma Decimal values and calculate available stock.
const formatProduct = (product) => {
  return {
    ...product,

    variants: product.variants.map((variant) => {
      const inventory = variant.inventory;

      const availableStock = inventory
        ? Math.max(
            0,
            inventory.quantity - inventory.reservedQuantity
          )
        : 0;

      return {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,

        price: Number(variant.price),

        compareAtPrice:
          variant.compareAtPrice !== null
            ? Number(variant.compareAtPrice)
            : null,

        availableStock,
        inStock: availableStock > 0,

        // Quantity-based bulk pricing.
        bulkPriceTiers: (variant.bulkPriceTiers || []).map((tier) => ({
          id: tier.id,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          unitPrice: Number(tier.unitPrice),
        })),
      };
    }),
  };
};

export const productService = {
  // Get products with optional search, category and shop filters.
  async getProducts({
    skip = 0,
    take = 20,
    search,
    categoryId,
    shopId,
  } = {}) {
    if (search !== undefined && typeof search !== "string") {
      throw createError("Invalid search query.");
    }

    if (categoryId !== undefined && typeof categoryId !== "string") {
      throw createError("Invalid category ID.");
    }

    if (shopId !== undefined && typeof shopId !== "string") {
      throw createError("Invalid shop ID.");
    }

    const pagination = normalizePagination({ skip, take });

    const filters = {
      search: search?.trim() || undefined,
      categoryId: categoryId?.trim() || undefined,
      shopId: shopId?.trim() || undefined,
    };

    const [products, total] = await Promise.all([
      productRepository.findActiveProducts({
        ...pagination,
        ...filters,
      }),

      productRepository.countActiveProducts(filters),
    ]);

    return {
      products: products.map(formatProduct),

      pagination: {
        total,
        skip: pagination.skip,
        take: pagination.take,
        hasMore: pagination.skip + pagination.take < total,
      },
    };
  },

  // Get one product's details.
  async getProductById(productId) {
    if (!productId || typeof productId !== "string") {
      throw createError("Valid product ID is required.");
    }

    const product =
      await productRepository.findActiveProductById(productId);

    if (!product) {
      throw createError("Product not found.", 404);
    }

    return formatProduct(product);
  },
};
