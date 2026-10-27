
import { prisma } from "../../lib/prisma.js";

export const customerRepository = {
  // Find an existing customer or create a new one.
  async findOrCreateCustomer(phone) {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      if (existingUser.role !== "CUSTOMER") {
        throw new Error(
          "This phone number is registered with another account type."
        );
      }

      return existingUser;
    }

    return prisma.user.create({
      data: {
        phone,
        role: "CUSTOMER",
      },
    });
  },

  // Find a customer by ID.
  async findCustomerById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  // Update a customer's name.
  async updateCustomerName(userId, name) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
      },
    });
  },
};
