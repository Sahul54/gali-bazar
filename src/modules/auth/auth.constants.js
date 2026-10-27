
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 30,
};

export const AUTH_MESSAGES = {
  INVALID_PHONE: "Please enter a valid Indian mobile number.",
  OTP_SENT: "OTP sent successfully.",
  INVALID_OTP: "Invalid or expired OTP.",
  OTP_EXPIRED: "OTP has expired. Please request a new OTP.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please request a new OTP.",
  UNAUTHORIZED: "Please login to continue.",
};

export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  DELIVERY_PARTNER: "DELIVERY_PARTNER",
  ADMIN: "ADMIN",
};

export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};
