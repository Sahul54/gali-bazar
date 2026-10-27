import { prisma } from "../../lib/prisma.js";

export const adminRepository = {
  async findAdminByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
  },
};