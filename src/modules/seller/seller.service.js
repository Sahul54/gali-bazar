
import { prisma } from "../../lib/prisma.js";
import { sellerRepository } from "./seller.repository.js";
import { sellerValidation } from "./seller.validation.js";

export const sellerService = {
  async registerBusiness(
    userId,
    { businessName, ownerName, category, address, pincode } = {}
  ) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid seller ID is required.");
    }

    // Validate business name.
    const nameValidation =
      sellerValidation.validateBusinessName(businessName);

    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Validate the remaining business details.
    const detailsValidation =
      sellerValidation.validateBusinessDetails({
        ownerName,
        category,
        address,
        pincode,
      });

    if (!detailsValidation.valid) {
      throw new Error(detailsValidation.error);
    }

    // Verify seller account.
    const seller = await sellerRepository.findSellerById(userId);

    if (!seller) {
      throw new Error("Seller account not found.");
    }

    if (!seller.isActive) {
      throw new Error("Your account is inactive.");
    }

    // Prevent duplicate registration.
    if (seller.sellerProfile) {
      throw new Error("Business profile has already been submitted.");
    }

    try {
      return await prisma.sellerProfile.create({
        data: {
          userId: seller.id,
          businessName: nameValidation.businessName,
          ownerName: detailsValidation.details.ownerName,
          category: detailsValidation.details.category,
          address: detailsValidation.details.address,
          pincode: detailsValidation.details.pincode,
          status: "PENDING",
        },
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          category: true,
          address: true,
          pincode: true,
          status: true,
          createdAt: true,
        },
      });
    } catch (error) {
      // Handle concurrent duplicate registration requests.
      if (error?.code === "P2002") {
        throw new Error("Business profile has already been submitted.");
      }

      throw error;
    }
  },
};
