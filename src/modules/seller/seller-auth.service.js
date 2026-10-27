
import { otpService } from "../auth/otp.service.js";
import { sellerRepository } from "./seller.repository.js";

export const sellerAuthService = {
  async sendOtp(phone) {
    return otpService.sendOtp(phone);
  },

  async verifyOtp(phone, otp) {
    // Step 1: Verify OTP using shared authentication logic.
    const result = await otpService.verifyOtp(phone, otp);

    // Step 2: Find or create a Seller account.
    const user = await sellerRepository.findOrCreateSellerUser(
      result.phone
    );

    // Step 3: Reject inactive accounts.
    if (!user.isActive) {
      throw new Error(
        "Your account is inactive. Please contact support."
      );
    }

    // Step 4: Return Seller details.
    return {
      message: "Seller OTP verified successfully.",
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    };
  },
};
