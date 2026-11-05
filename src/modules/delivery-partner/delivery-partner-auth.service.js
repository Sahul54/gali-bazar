
import { otpService } from "../auth/otp.service.js";
import { deliveryPartnerRepository } from "./delivery-partner.repository.js";

export const deliveryPartnerAuthService = {
  // Send OTP using shared authentication service.
  async sendOtp(phone) {
    return otpService.sendOtp(phone);
  },

  // Verify OTP and authenticate Delivery Partner.
  async verifyOtp(phone, otp) {
    // 1. Verify OTP.
    const result = await otpService.verifyOtp(phone, otp);

    // 2. Find or create Delivery Partner account.
    const user =
      await deliveryPartnerRepository.findOrCreateDeliveryPartnerUser(
        result.phone
      );

    // 3. Reject inactive accounts.
    if (!user.isActive) {
      throw new Error(
        "Your account is inactive. Please contact support."
      );
    }

    // 4. Fetch current Delivery Partner profile.
    const partner =
      await deliveryPartnerRepository.findDeliveryPartnerById(
        user.id
      );

    if (!partner) {
      throw new Error("Delivery partner account not found.");
    }

    const profile = partner.deliveryProfile;

    let nextPath = "/delivery-partner/register";

    // 5. Determine next page based on application status.
    if (profile) {
      switch (profile.status) {
        case "APPROVED":
          nextPath = "/delivery-partner/dashboard";
          break;

        case "PENDING":
          nextPath = "/delivery-partner/status";
          break;

        case "REJECTED":
          nextPath = "/delivery-partner/status";
          break;

        default:
          nextPath = "/delivery-partner/status";
      }
    }

    return {
      message: "Delivery Partner OTP verified successfully.",

      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },

      profile: profile
        ? {
            id: profile.id,
            status: profile.status,
            rejectionReason: profile.rejectionReason,
            reviewedAt: profile.reviewedAt,
            reapplyCount: profile.reapplyCount,
            isOnline: profile.isOnline,
          }
        : null,

      nextPath,
    };
  },
};
