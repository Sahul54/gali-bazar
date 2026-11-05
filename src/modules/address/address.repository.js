
import { prisma } from "@/lib/prisma.js";

// Get all addresses of a customer
export async function findAddressesByUserId(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });
}

// Get a single address belonging to a customer
export async function findAddressById(id, userId) {
  return prisma.address.findFirst({
    where: {
      id,
      userId,
    },
  });
}

// Create a new address
export async function createAddress(data) {
  return prisma.address.create({
    data,
  });
}

// Update an existing customer address
export async function updateAddress(id, userId, data) {
  const result = await prisma.address.updateMany({
    where: {
      id,
      userId,
    },
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return findAddressById(id, userId);
}

// Delete an address
export async function deleteAddress(id, userId) {
  const result = await prisma.address.deleteMany({
    where: {
      id,
      userId,
    },
  });

  return result.count > 0;
}

// Set an address as default
export async function setDefaultAddress(id, userId) {
  return prisma.$transaction(async (tx) => {
    // Check address ownership
    const address = await tx.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      return null;
    }

    // Remove default from all customer addresses
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set selected address as default
    return tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });
}
