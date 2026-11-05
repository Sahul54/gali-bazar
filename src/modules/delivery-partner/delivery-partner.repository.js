
import { prisma } from "../../lib/prisma.js";

export const deliveryPartnerRepository = {
  // Find an existing Delivery Partner user or create a new one.
  async findOrCreateDeliveryPartnerUser(phone) {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      if (existingUser.role !== "DELIVERY_PARTNER") {
        throw new Error(
          "This phone number is registered with another account type."
        );
      }

      return existingUser;
    }

    return prisma.user.create({
      data: {
        phone,
        role: "DELIVERY_PARTNER",
      },
    });
  },

  // Find Delivery Partner account with profile.
  async findDeliveryPartnerById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        role: "DELIVERY_PARTNER",
      },
      include: {
        deliveryProfile: true,
      },
    });
  },

  // Find Delivery Partner by phone.
  async findDeliveryPartnerByPhone(phone) {
    return prisma.user.findFirst({
      where: {
        phone,
        role: "DELIVERY_PARTNER",
      },
      include: {
        deliveryProfile: true,
      },
    });
  },

  // Create profile and update user's name atomically.
  async createProfile(userId, details) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: userId,
          role: "DELIVERY_PARTNER",
          isActive: true,
        },
      });

      if (!user) {
        throw new Error("Active delivery partner account not found.");
      }

      const existingProfile =
        await tx.deliveryPartnerProfile.findUnique({
          where: { userId },
        });

      if (existingProfile) {
        throw new Error(
          "Delivery partner profile has already been submitted."
        );
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          name: details.fullName,
        },
      });

      return tx.deliveryPartnerProfile.create({
        data: {
          userId,
          vehicleType: details.vehicleType,
          vehicleNumber: details.vehicleNumber,
          vehicleModel: details.vehicleModel,
          licenseNumber: details.licenseNumber,
          licenseDocumentUrl: details.licenseDocumentUrl,
          vehicleDocumentUrl: details.vehicleDocumentUrl,
          status: "PENDING",
          isOnline: false,
        },
        select: {
          id: true,
          vehicleType: true,
          vehicleNumber: true,
          vehicleModel: true,
          licenseNumber: true,
          status: true,
          isOnline: true,
          createdAt: true,
        },
      });
    });
  },

  // Get the current Delivery Partner profile.
  async findProfileByUserId(userId) {
    return prisma.deliveryPartnerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        vehicleType: true,
        vehicleNumber: true,
        vehicleModel: true,
        licenseNumber: true,
        licenseDocumentUrl: true,
        vehicleDocumentUrl: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        reapplyCount: true,
        isOnline: true,
        latitude: true,
        longitude: true,
        lastLocationAt: true,
        maxDeliveryRadiusKm: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Reapply after rejection using the same profile.
async reapplyApplication(userId, details) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify active delivery partner.
    const user = await tx.user.findFirst({
      where: {
        id: userId,
        role: "DELIVERY_PARTNER",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("Active delivery partner account not found.");
    }

    // 2. Find existing profile.
    const profile = await tx.deliveryPartnerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!profile) {
      throw new Error("Delivery partner profile not found.");
    }

    // 3. Only rejected applications can reapply.
    if (profile.status !== "REJECTED") {
      throw new Error(
        "Only rejected applications can be resubmitted."
      );
    }

    // 4. Atomic conditional update.
    // This prevents duplicate reapplications from concurrent requests.
    const result = await tx.deliveryPartnerProfile.updateMany({
      where: {
        id: profile.id,
        userId,
        status: "REJECTED",
      },
      data: {
        vehicleType: details.vehicleType,
        vehicleNumber: details.vehicleNumber,
        vehicleModel: details.vehicleModel || null,
        licenseNumber: details.licenseNumber,

        licenseDocumentUrl: details.licenseDocumentUrl,
        vehicleDocumentUrl: details.vehicleDocumentUrl,

        status: "PENDING",

        rejectionReason: null,
        reviewedAt: null,
        reviewedById: null,

        reapplyCount: {
          increment: 1,
        },

        isOnline: false,
        latitude: null,
        longitude: null,
        lastLocationAt: null,
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "Application status changed. Please refresh and try again."
      );
    }

    // 5. Update user's name.
    await tx.user.update({
      where: { id: userId },
      data: {
        name: details.fullName,
      },
    });

    // 6. Save application history.
    await tx.deliveryPartnerApplicationHistory.create({
      data: {
        previousStatus: "REJECTED",
        newStatus: "PENDING",
        reason: "Partner updated details and reapplied.",
        deliveryPartnerProfileId: profile.id,
      },
    });

    // 7. Return updated profile.
    return tx.deliveryPartnerProfile.findUnique({
      where: {
        id: profile.id,
      },
      select: {
        id: true,
        vehicleType: true,
        vehicleNumber: true,
        vehicleModel: true,
        licenseNumber: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        reapplyCount: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
},

  // Update online/offline status.
  async updateAvailability(userId, isOnline) {
    if (isOnline) {
      const result = await prisma.deliveryPartnerProfile.updateMany({
        where: {
          userId,
          status: "APPROVED",
          user: {
            is: {
              isActive: true,
            },
          },
        },
        data: {
          isOnline: true,
        },
      });

      if (result.count === 0) {
        throw new Error(
          "Only active and approved delivery partners can go online."
        );
      }

      return prisma.deliveryPartnerProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          isOnline: true,
          latitude: true,
          longitude: true,
          lastLocationAt: true,
        },
      });
    }

    return prisma.deliveryPartnerProfile.update({
      where: { userId },
      data: {
        isOnline: false,
        latitude: null,
        longitude: null,
        lastLocationAt: null,
      },
      select: {
        id: true,
        status: true,
        isOnline: true,
        latitude: true,
        longitude: true,
        lastLocationAt: true,
      },
    });
  },

  // Update the partner's latest location.
  // Approved partners can update location while online or offline.
  async updateLocation(userId, { latitude, longitude }) {
    const result = await prisma.deliveryPartnerProfile.updateMany({
      where: {
        userId,
        status: "APPROVED",
        user: {
          is: {
            isActive: true,
          },
        },
      },
      data: {
        latitude,
        longitude,
        lastLocationAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new Error(
        "Only active and approved delivery partners can update location."
      );
    }

    return prisma.deliveryPartnerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        lastLocationAt: true,
      },
    });
  },
};
