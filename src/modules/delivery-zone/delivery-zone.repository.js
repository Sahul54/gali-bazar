
import { prisma } from "@/lib/prisma";

// Get all delivery zones with their pincodes
export async function findAllDeliveryZones() {
  return prisma.deliveryZone.findMany({
    include: {
      pincodes: {
        orderBy: {
          pincode: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Find delivery zone by ID
export async function findDeliveryZoneById(id) {
  return prisma.deliveryZone.findUnique({
    where: { id },
    include: {
      pincodes: {
        orderBy: {
          pincode: "asc",
        },
      },
    },
  });
}

// Find delivery zone by code
export async function findDeliveryZoneByCode(code) {
  return prisma.deliveryZone.findUnique({
    where: { code },
  });
}

// Find a zone using pincode
export async function findDeliveryZoneByPincode(pincode) {
  return prisma.deliveryZonePincode.findUnique({
    where: { pincode },
    include: {
      deliveryZone: true,
    },
  });
}

// Create delivery zone with pincodes
export async function createDeliveryZone(data) {
  return prisma.deliveryZone.create({
    data: {
      name: data.name,
      code: data.code,
      expressFee: data.expressFee,
      scheduledFee: data.scheduledFee,
      isActive: data.isActive ?? true,

      pincodes: {
        create: data.pincodes.map((pincode) => ({
          pincode,
          isActive: true,
        })),
      },
    },
    include: {
      pincodes: true,
    },
  });
}

// Update delivery zone details
export async function updateDeliveryZone(id, data) {
  return prisma.deliveryZone.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.expressFee !== undefined && {
        expressFee: data.expressFee,
      }),
      ...(data.scheduledFee !== undefined && {
        scheduledFee: data.scheduledFee,
      }),
    },
    include: {
      pincodes: {
        orderBy: {
          pincode: "asc",
        },
      },
    },
  });
}

// Update zone active/inactive status
export async function updateDeliveryZoneStatus(id, isActive) {
  return prisma.deliveryZone.update({
    where: { id },
    data: { isActive },
    include: {
      pincodes: true,
    },
  });
}

// Add pincodes to an existing zone
export async function addPincodesToZone(deliveryZoneId, pincodes) {
  return prisma.deliveryZonePincode.createMany({
    data: pincodes.map((pincode) => ({
      deliveryZoneId,
      pincode,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}

// Update individual pincode status
export async function updatePincodeStatus(id, isActive) {
  return prisma.deliveryZonePincode.update({
    where: { id },
    data: { isActive },
  });
}

// Remove a pincode from a zone
export async function removePincodeFromZone(id) {
  return prisma.deliveryZonePincode.delete({
    where: { id },
  });
}

// Delete delivery zone
export async function deleteDeliveryZone(id) {
  return prisma.deliveryZone.delete({
    where: { id },
  });
}
