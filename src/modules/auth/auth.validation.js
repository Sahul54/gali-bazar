
import { AUTH_MESSAGES } from "./auth.constants.js";

export function validatePhone(phone) {
  if (typeof phone !== "string") {
    return {
      valid: false,
      error: AUTH_MESSAGES.INVALID_PHONE,
    };
  }

  // Remove spaces and an optional +91 prefix.
  const normalizedPhone = phone.trim().replace(/^\+91/, "");

  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    return {
      valid: false,
      error: AUTH_MESSAGES.INVALID_PHONE,
    };
  }

  return {
    valid: true,
    phone: normalizedPhone,
  };
}

export function validateOtp(otp) {
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return {
      valid: false,
      error: "OTP must be exactly 6 digits.",
    };
  }

  return {
    valid: true,
    otp,
  };
}
