
import { adminDeliveryPartnerRepository } from "./delivery-partner.repository.js";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
const DECISION_STATUSES = ["APPROVED", "REJECTED"];

export const adminDeliveryPartnerService = {
  // Get summary and paginated delivery partner applications
  async getApplications(params = {}) {
    const search =
      typeof params.search === "string"
        ? params.search.trim().slice(0, 100)
        : "";

    const status =
      typeof params.status === "string"
        ? params.status.trim().toUpperCase()
        : "";

    if (status && !VALID_STATUSES.includes(status)) {
      throw new Error("Invalid application status.");
    }

    const page = Math.max(
      1,
      Number.parseInt(params.page, 10) || 1
    );

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    if (!Number.isSafeInteger(skip) || skip > 1000000) {
      throw new Error("Invalid page number.");
    }

    const [summary, result] = await Promise.all([
      adminDeliveryPartnerRepository.getSummary(),

      adminDeliveryPartnerRepository.getApplications({
        status: status || undefined,
        search,
        skip,
        take: pageSize,
      }),
    ]);

    return {
      summary,
      applications: result.applications,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    };
  },

  // Get one delivery partner application
  async getApplicationById(id) {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Valid application ID is required.");
    }

    const application =
      await adminDeliveryPartnerRepository.findApplicationById(
        id.trim()
      );

    if (!application) {
      throw new Error("Delivery partner application not found.");
    }

    return application;
  },

  // Approve or reject a pending application
  async updateApplicationStatus(id, status, options = {}) {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Valid application ID is required.");
    }

    if (!DECISION_STATUSES.includes(status)) {
      throw new Error("Status must be APPROVED or REJECTED.");
    }

    const reviewedById = options.reviewedById;

    if (
      typeof reviewedById !== "string" ||
      !reviewedById.trim()
    ) {
      throw new Error("Valid admin ID is required.");
    }

    let reason = null;

    if (status === "REJECTED") {
      if (typeof options.reason !== "string") {
        throw new Error("Rejection reason is required.");
      }

      reason = options.reason.trim();

      if (!reason) {
        throw new Error("Rejection reason is required.");
      }

      if (reason.length < 5) {
        throw new Error(
          "Rejection reason must be at least 5 characters."
        );
      }

      if (reason.length > 1000) {
        throw new Error(
          "Rejection reason cannot exceed 1000 characters."
        );
      }
    }

    // Ensure the application exists and is pending.
    const application = await this.getApplicationById(id.trim());

    if (application.status !== "PENDING") {
      throw new Error("Application is no longer pending.");
    }

    return adminDeliveryPartnerRepository.updateApplicationStatus(
      id.trim(),
      status,
      {
        reason,
        reviewedById: reviewedById.trim(),
      }
    );
  },
};
