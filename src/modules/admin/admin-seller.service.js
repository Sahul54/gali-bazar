import { adminSellerRepository } from "./admin-seller.repository.js";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const adminSellerService = {
  async getPendingSellers() {
    return adminSellerRepository.findPendingSellers();
  },

  async getSellers({ status, search } = {}) {
    let normalizedStatus;

    if (status) {
      if (
        typeof status !== "string" ||
        !VALID_STATUSES.includes(status)
      ) {
        throw new Error(
          "Status must be PENDING, APPROVED, or REJECTED."
        );
      }

      normalizedStatus = status;
    }

    if (search !== undefined && typeof search !== "string") {
      throw new Error("Search must be a string.");
    }

    const normalizedSearch = search?.trim().slice(0, 100) || undefined;

    return adminSellerRepository.findSellers({
      status: normalizedStatus,
      search: normalizedSearch,
    });
  },

  async updateSellerStatus(profileId, status) {
    if (
      typeof profileId !== "string" ||
      profileId.trim().length === 0
    ) {
      throw new Error("Valid seller profile ID is required.");
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      throw new Error("Status must be APPROVED or REJECTED.");
    }

    const sellerProfile =
      await adminSellerRepository.findSellerProfileById(
        profileId.trim()
      );

    if (!sellerProfile) {
      throw new Error("Seller application not found.");
    }

    if (sellerProfile.status !== "PENDING") {
      throw new Error(
        "Only pending seller applications can be updated."
      );
    }

    return adminSellerRepository.updateSellerStatus(
      sellerProfile.id,
      status
    );
  },
};