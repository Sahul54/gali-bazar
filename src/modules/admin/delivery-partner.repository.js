
import { prisma } from "../../lib/prisma.js";

export const adminDeliveryPartnerRepository = {
  // ==========================================
  // 1. APPLICATION SUMMARY
  // ==========================================

  async getSummary() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.deliveryPartnerProfile.count(),

      prisma.deliveryPartnerProfile.count({
        where: { status: "PENDING" },
      }),

      prisma.deliveryPartnerProfile.count({
        where: { status: "APPROVED" },
      }),

      prisma.deliveryPartnerProfile.count({
        where: { status: "REJECTED" },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  },

  // ==========================================
  // 2. GET APPLICATIONS
  // ==========================================

  async getApplications({ status, search, skip, take }) {
    const where = {
      ...(status ? { status } : {}),

      ...(search
        ? {
            OR: [
              {
                vehicleNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                licenseNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                user: {
                  is: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
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
            ],
          }
        : {}),
    };

    const [applications, total] = await Promise.all([
      prisma.deliveryPartnerProfile.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take,

        select: {
          id: true,
          status: true,

          vehicleType: true,
          vehicleNumber: true,
          vehicleModel: true,
          licenseNumber: true,

          licenseDocumentUrl: true,
          vehicleDocumentUrl: true,

          rejectionReason: true,
          reviewedAt: true,
          reapplyCount: true,

          isOnline: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              isActive: true,
            },
          },
        },
      }),

      prisma.deliveryPartnerProfile.count({
        where,
      }),
    ]);

    return {
      applications,
      total,
    };
  },

  // ==========================================
  // 3. FIND APPLICATION BY ID
  // ==========================================

  async findApplicationById(id) {
    return prisma.deliveryPartnerProfile.findUnique({
      where: { id },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },

        applicationHistory: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            reviewedBy: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  },

  // ==========================================
  // 4. APPROVE / REJECT APPLICATION
  // ==========================================

  async updateApplicationStatus(
    id,
    status,
    { reason = null, reviewedById }
  ) {
    return prisma.$transaction(async (tx) => {
      // Read current application
      const existing = await tx.deliveryPartnerProfile.findUnique({
        where: { id },

        select: {
          id: true,
          status: true,
        },
      });

      if (!existing) {
        throw new Error("Delivery partner application not found.");
      }

      if (existing.status !== "PENDING") {
        throw new Error("Application is no longer pending.");
      }

      // Atomic status transition
      const result = await tx.deliveryPartnerProfile.updateMany({
        where: {
          id,
          status: "PENDING",
        },

        data: {
          status,
          rejectionReason: status === "REJECTED" ? reason : null,
          reviewedAt: new Date(),
          reviewedById,
          isOnline: false,
        },
      });

      // Prevent simultaneous admin decisions
      if (result.count !== 1) {
        throw new Error("Application is no longer pending.");
      }

      // Preserve review history
      await tx.deliveryPartnerApplicationHistory.create({
        data: {
          previousStatus: existing.status,
          newStatus: status,
          reason: status === "REJECTED" ? reason : null,

          deliveryPartnerProfileId: id,
          reviewedById,
        },
      });

      // Return updated application
      return tx.deliveryPartnerProfile.findUnique({
        where: { id },

        select: {
          id: true,
          status: true,
          rejectionReason: true,
          reviewedAt: true,
          reviewedById: true,
          reapplyCount: true,
          isOnline: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });
    });
  },

  // ==========================================
  // 5. REAPPLY APPLICATION
  // ==========================================

  async reapplyApplication(id, userId, data) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.deliveryPartnerProfile.findUnique({
        where: { userId },

        select: {
          id: true,
          status: true,
          reapplyCount: true,
        },
      });

      if (!existing || existing.id !== id) {
        throw new Error("Delivery partner application not found.");
      }

      if (existing.status !== "REJECTED") {
        throw new Error(
          "Only rejected applications can be resubmitted."
        );
      }

      // Update the existing profile, never create a duplicate
      const result = await tx.deliveryPartnerProfile.updateMany({
        where: {
          id,
          userId,
          status: "REJECTED",
        },

        data: {
          vehicleType: data.vehicleType,
          vehicleNumber: data.vehicleNumber,
          vehicleModel: data.vehicleModel,
          licenseNumber: data.licenseNumber,

          licenseDocumentUrl: data.licenseDocumentUrl,
          vehicleDocumentUrl: data.vehicleDocumentUrl,

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

      // Preserve the reapplication event
      await tx.deliveryPartnerApplicationHistory.create({
        data: {
          previousStatus: "REJECTED",
          newStatus: "PENDING",
          reason: "Partner updated details and reapplied.",

          deliveryPartnerProfileId: id,
        },
      });

      return tx.deliveryPartnerProfile.findUnique({
        where: { id },

        select: {
          id: true,
          status: true,
          rejectionReason: true,
          reapplyCount: true,
          vehicleType: true,
          vehicleNumber: true,
          vehicleModel: true,
          licenseNumber: true,
          updatedAt: true,
        },
      });
    });
  },
};
