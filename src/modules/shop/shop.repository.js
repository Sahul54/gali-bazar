
import { prisma } from "@/lib/prisma.js";

export const shopRepository = {
  // Find approved shops with valid location.
  async findNearbyShops({
    skip = 0,
    take = 20,
    pincode,
  } = {}) {
    return prisma.sellerProfile.findMany({
      where: {
        status: "APPROVED",
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        user: {
          isActive: true,
        },
        ...(pincode ? { pincode } : {}),
      },
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        category: true,
        address: true,
        pincode: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });
  },

  // Count approved shops.
  async countNearbyShops({ pincode } = {}) {
    return prisma.sellerProfile.count({
      where: {
        status: "APPROVED",
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        user: {
          isActive: true,
        },
        ...(pincode ? { pincode } : {}),
      },
    });
  },

  // Find shop by ID.
  async findById(shopId) {
    return prisma.sellerProfile.findFirst({
      where: {
        id: shopId,
        status: "APPROVED",
        user: {
          isActive: true,
        },
      },
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        category: true,
        address: true,
        pincode: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        products: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            brand: true,
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
              select: {
                imageUrl: true,
                altText: true,
              },
            },
            variants: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                sku: true,
                title: true,
                price: true,
                inventory: {
                  select: {
                    quantity: true,
                    reservedQuantity: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  },
};
