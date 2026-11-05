
import { shopRepository } from "./shop.repository.js";

const EARTH_RADIUS_KM = 6371;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate geographical coordinates.
const isValidCoordinate = (value, min, max) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
};

// Calculate distance using Haversine formula.
const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLng = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const normalizePagination = (options = {}) => {
  const requestedSkip = Number(options.skip);
  const requestedTake = Number(options.take);

  return {
    skip:
      Number.isSafeInteger(requestedSkip) && requestedSkip >= 0
        ? requestedSkip
        : 0,

    take:
      Number.isSafeInteger(requestedTake) && requestedTake > 0
        ? Math.min(requestedTake, 50)
        : 20,
  };
};

export const shopService = {
  // Get nearby approved shops.
  async getNearbyShops({
    latitude,
    longitude,
    radiusKm = 5,
    pincode,
    skip = 0,
    take = 20,
  } = {}) {
    if (!isValidCoordinate(latitude, -90, 90)) {
      throw createError("Valid customer latitude is required.");
    }

    if (!isValidCoordinate(longitude, -180, 180)) {
      throw createError("Valid customer longitude is required.");
    }

    if (
      typeof radiusKm !== "number" ||
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 50
    ) {
      throw createError("Radius must be between 0 and 50 km.");
    }

    if (pincode !== undefined && pincode !== null) {
      if (
        typeof pincode !== "string" ||
        !/^\d{6}$/.test(pincode)
      ) {
        throw createError("Invalid pincode.");
      }
    }

    const pagination = normalizePagination({ skip, take });

    // Fetch approved shops with coordinates.
    const shops = await shopRepository.findNearbyShops({
      pincode,
      skip: 0,
      take: 500,
    });

    // Calculate actual distance and filter by radius.
    const nearbyShops = shops
      .map((shop) => {
        const distanceKm = calculateDistance(
          latitude,
          longitude,
          shop.latitude,
          shop.longitude
        );

        return {
          ...shop,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((shop) => shop.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const total = nearbyShops.length;

    return {
      shops: nearbyShops.slice(
        pagination.skip,
        pagination.skip + pagination.take
      ),
      pagination: {
        total,
        skip: pagination.skip,
        take: pagination.take,
        hasMore:
          pagination.skip + pagination.take < total,
      },
      location: {
        latitude,
        longitude,
        radiusKm,
      },
    };
  },

  // Get individual shop details.
  async getShopById(shopId) {
    if (!shopId || typeof shopId !== "string") {
      throw createError("Valid shop ID is required.");
    }

    const shop = await shopRepository.findById(shopId);

    if (!shop) {
      throw createError("Shop not found.", 404);
    }

    return shop;
  },
};
