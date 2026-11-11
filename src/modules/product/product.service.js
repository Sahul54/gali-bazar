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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
};

const formatProduct = (product) => {
  return {
    ...product,

    variants: product.variants.map((variant) => {
      const inventory = variant.inventory;

      const availableStock = inventory
        ? Math.max(0, inventory.quantity - inventory.reservedQuantity)
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
  async getProducts({
    skip = 0,
    take = 20,
    search,
    categoryId,
    shopId,
    latitude,
    longitude,
    radiusKm = 5,
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

    const hasLatitude = latitude !== undefined && latitude !== "";
    const hasLongitude = longitude !== undefined && longitude !== "";

    if (hasLatitude !== hasLongitude) {
      throw createError("Both latitude and longitude are required.");
    }

    // Without browsing location, retain existing product listing.
    if (!hasLatitude) {
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
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusKm);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw createError("Invalid location coordinates.");
    }

    if (!Number.isFinite(radius) || radius <= 0 || radius > 100) {
      throw createError("Radius must be between 0 and 100 km.");
    }

    const nearbyProducts =
      await productRepository.findNearbyActiveProducts({
        ...filters,
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
      });

    const filteredProducts = nearbyProducts
      .map((product) => {
        const sellerLat = Number(product.sellerProfile.latitude);
        const sellerLng = Number(product.sellerProfile.longitude);

        const distanceKm = calculateDistance(
          lat,
          lng,
          sellerLat,
          sellerLng
        );

        return {
          ...product,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((product) => product.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const total = filteredProducts.length;

    const products = filteredProducts
      .slice(
        pagination.skip,
        pagination.skip + pagination.take
      )
      .map(formatProduct);

    return {
      products,
      pagination: {
        total,
        skip: pagination.skip,
        take: pagination.take,
        hasMore: pagination.skip + pagination.take < total,
      },
      location: {
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
      },
    };
  },

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