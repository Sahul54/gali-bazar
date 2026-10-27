
import { prisma } from "../../lib/prisma.js";

export const sellerRepository = {
  async findOrCreateSellerUser(phone) {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      if (existingUser.role !== "SELLER") {
        throw new Error(
          "This phone number is registered with another account type."
        );
      }

      return existingUser;
    }

    return prisma.user.create({
      data: {
        phone,
        role: "SELLER",
      },
    });
  },

  async findSellerById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        role: "SELLER",
      },
      include: {
        sellerProfile: true,
      },
    });
  },
};
