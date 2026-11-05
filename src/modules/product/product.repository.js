import { prisma } from "@/lib/prisma.js";

export const productRepository = {
  // Fetch active products with filters.
  async findActiveProducts({
    skip = 0,
    take = 20,
    search,
    categoryId,
    shopId,
  } = {}) {
    return prisma.product.findMany({
      where: {
        status: "ACTIVE",

        ...(shopId ? { sellerProfileId: shopId } : {}),

        ...(categoryId ? { categoryId } : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  brand: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brand: true,

        sellerProfile: {
          select: {
            id: true,
            businessName: true,
            address: true,
            pincode: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

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
            compareAtPrice: true,
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
              },
            },
          },
        },

        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take,
    });
  },

  // Count products with the same filters.
  async countActiveProducts({ search, categoryId, shopId } = {}) {
    return prisma.product.count({
      where: {
        status: "ACTIVE",

        ...(shopId ? { sellerProfileId: shopId } : {}),

        ...(categoryId ? { categoryId } : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  brand: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
    });
  },

  // Fetch one active product by ID.
  async findActiveProductById(productId) {
    return prisma.product.findFirst({
      where: {
        id: productId,
        status: "ACTIVE",
        sellerProfile: {
          status: "APPROVED",
          user: {
            isActive: true,
          },
        },
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brand: true,

        sellerProfile: {
          select: {
            id: true,
            businessName: true,
            address: true,
            pincode: true,
            latitude: true,
            longitude: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
          },
        },

        variants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            sku: true,
            barcode: true,
            title: true,
            attributes: true,
            price: true,
            compareAtPrice: true,
            weightGrams: true,
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                lowStockThreshold: true,
              },
            },
            bulkPriceTiers: {
              orderBy: {
                minQuantity: "asc",
              },
              select: {
                id: true,
                minQuantity: true,
                maxQuantity: true,
                unitPrice: true,
              },
            },
          },
        },

        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
