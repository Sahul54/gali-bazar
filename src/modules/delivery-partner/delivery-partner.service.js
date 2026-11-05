import { deliveryPartnerRepository } from "./delivery-partner.repository.js";
import { deliveryPartnerValidation } from "./delivery-partner.validation.js";

export const deliveryPartnerService = {
  // Register delivery partner profile for the first time.
  async registerVehicle(userId, input = {}) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid delivery partner ID is required.");
    }

    const validation =
      deliveryPartnerValidation.validateRegistration(input);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(userId);

    if (!partner || !partner.isActive) {
      throw new Error("Active delivery partner account not found.");
    }

    if (partner.deliveryProfile) {
      throw new Error(
        "Delivery partner profile has already been submitted."
      );
    }

    try {
      return await deliveryPartnerRepository.createProfile(
        partner.id,
        validation.details
      );
    } catch (error) {
      if (error?.code === "P2002") {
        throw new Error(
          "Delivery partner profile has already been submitted."
        );
      }

      throw error;
    }
  },

  // Reapply after rejection using the same profile.
  async reapplyApplication(userId, input = {}) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid delivery partner ID is required.");
    }

    // Validate reapplication details.
    const validation =
      deliveryPartnerValidation.validateReapplication(input);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Verify delivery partner account.
    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(userId);

    if (!partner || !partner.isActive) {
      throw new Error("Active delivery partner account not found.");
    }

    const profile = partner.deliveryProfile;

    if (!profile) {
      throw new Error(
        "Please submit your delivery partner profile first."
      );
    }

    // Only REJECTED applications can be resubmitted.
    if (profile.status === "APPROVED") {
      throw new Error(
        "Your application is already approved. Reapplication is not allowed."
      );
    }

    if (profile.status === "PENDING") {
      throw new Error(
        "Your application is already under review."
      );
    }

    if (profile.status !== "REJECTED") {
      throw new Error(
        "This application cannot be resubmitted."
      );
    }

    // Repository handles atomic update and history creation.
    try {
      const application =
        await deliveryPartnerRepository.reapplyApplication(
          userId,
          validation.details
        );

      return application;
    } catch (error) {
      if (error?.code === "P2002") {
        throw new Error(
          "Some submitted details are already registered."
        );
      }

      throw error;
    }
  },

  // Get authenticated delivery partner profile.
  async getMyProfile(userId) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid delivery partner ID is required.");
    }

    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(userId);

    if (!partner || !partner.isActive) {
      throw new Error("Active delivery partner account not found.");
    }

    if (!partner.deliveryProfile) {
      throw new Error(
        "Delivery partner profile has not been submitted yet."
      );
    }

    return {
      user: {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
        role: partner.role,
      },
      profile: partner.deliveryProfile,
    };
  },

  // Update online/offline availability.
  async updateAvailability(userId, isOnline) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid delivery partner ID is required.");
    }

    if (typeof isOnline !== "boolean") {
      throw new Error("isOnline must be true or false.");
    }

    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(userId);

    if (!partner || !partner.isActive) {
      throw new Error("Active delivery partner account not found.");
    }

    const profile = partner.deliveryProfile;

    if (!profile) {
      throw new Error(
        "Please register your delivery partner profile first."
      );
    }

    if (profile.status !== "APPROVED") {
      throw new Error(
        "Your application must be approved before changing availability."
      );
    }

    // Require a fresh location before going online.
    if (isOnline) {
      const latestProfile =
        await deliveryPartnerRepository.findProfileByUserId(userId);

      if (
        latestProfile?.latitude == null ||
        latestProfile?.longitude == null ||
        !latestProfile.lastLocationAt
      ) {
        throw new Error(
          "Please update your location before going online."
        );
      }

      const LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

      const locationAge =
        Date.now() -
        new Date(latestProfile.lastLocationAt).getTime();

      if (
        !Number.isFinite(locationAge) ||
        locationAge < 0 ||
        locationAge > LOCATION_MAX_AGE_MS
      ) {
        throw new Error(
          "Your location is outdated. Please update your location and try again."
        );
      }
    }

    return deliveryPartnerRepository.updateAvailability(
      userId,
      isOnline
    );
  },

  // Update current location.
  // Approved partners can update location while online or offline.
  async updateLocation(userId, { latitude, longitude } = {}) {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid delivery partner ID is required.");
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Valid latitude and longitude are required.");
    }

    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(userId);

    if (!partner || !partner.isActive) {
      throw new Error("Active delivery partner account not found.");
    }

    const profile = partner.deliveryProfile;

    if (!profile) {
      throw new Error("Delivery partner profile not found.");
    }

    if (profile.status !== "APPROVED") {
      throw new Error(
        "Your application must be approved before updating location."
      );
    }

    return deliveryPartnerRepository.updateLocation(userId, {
      latitude,
      longitude,
    });
  },
};