import { prisma } from "../../lib/prisma.js";

export const adminSellerRepository = {
  async findPendingSellers() {
    return prisma.sellerProfile.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        businessName: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findSellers({ status, search }) {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          businessName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            is: {
              phone: {
                contains: search,
              },
            },
          },
        },
      ];
    }

    return prisma.sellerProfile.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findSellerProfileById(profileId) {
    return prisma.sellerProfile.findUnique({
      where: {
        id: profileId,
      },
      select: {
        id: true,
        businessName: true,
        status: true,
        userId: true,
      },
    });
  },

  async updateSellerStatus(profileId, status) {
    return prisma.sellerProfile.update({
      where: {
        id: profileId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        businessName: true,
        status: true,
        createdAt: true,
      },
    });
  },
};