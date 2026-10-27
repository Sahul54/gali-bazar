
import { otpService } from "./otp.service.js";
import { customerRepository } from "../customer/customer.repository.js";

export const authService = {
  async sendOtp(phone) {
    return otpService.sendOtp(phone);
  },

  async verifyOtp(phone, otp) {
    // Step 1: Verify OTP using shared authentication logic.
    const result = await otpService.verifyOtp(phone, otp);

    // Step 2: Find or create a customer account.
    const user = await customerRepository.findOrCreateCustomer(
      result.phone
    );

    // Step 3: Ensure the account is active.
    if (!user.isActive) {
      throw new Error("Your account is inactive. Please contact support.");
    }

    // Step 4: Return the authenticated customer details.
    return {
      message: "OTP verified successfully.",
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    };
  },
};
