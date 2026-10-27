
import {
  randomInt,
  createHash,
  timingSafeEqual,
} from "node:crypto";

import { authRepository } from "./auth.repository.js";
import { validatePhone, validateOtp } from "./auth.validation.js";
import { OTP_CONFIG, AUTH_MESSAGES } from "./auth.constants.js";

const hashOtp = (phone, otp) =>
  createHash("sha256")
    .update(`${phone}:${otp}`)
    .digest("hex");

const compareOtp = (phone, otp, storedHash) => {
  const actual = Buffer.from(hashOtp(phone, otp), "hex");
  const expected = Buffer.from(storedHash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
};

export const otpService = {
  async sendOtp(phone) {
    const validation = validatePhone(phone);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const normalizedPhone = validation.phone;

    const latestRequest =
      await authRepository.findLatestOtpRequest(normalizedPhone);

    if (latestRequest) {
      const elapsedSeconds =
        (Date.now() - latestRequest.createdAt.getTime()) / 1000;

      if (elapsedSeconds < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
        throw new Error(
          "Please wait before requesting another OTP."
        );
      }
    }

    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const otpHash = hashOtp(normalizedPhone, otp);

    const expiresAt = new Date(
      Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
    );

    await authRepository.createOtp({
      phone: normalizedPhone,
      otpHash,
      expiresAt,
    });

    // Development only: never log OTPs in production.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[DEV OTP] ${normalizedPhone}: ${otp}`);
    }

    return {
      message: AUTH_MESSAGES.OTP_SENT,
    };
  },

  async verifyOtp(phone, otp) {
    const phoneValidation = validatePhone(phone);

    if (!phoneValidation.valid) {
      throw new Error(phoneValidation.error);
    }

    const otpValidation = validateOtp(otp);

    if (!otpValidation.valid) {
      throw new Error(otpValidation.error);
    }

    const normalizedPhone = phoneValidation.phone;

    const record =
      await authRepository.findLatestOtp(normalizedPhone);

    if (!record) {
      throw new Error(AUTH_MESSAGES.OTP_EXPIRED);
    }

    if (record.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      throw new Error(AUTH_MESSAGES.TOO_MANY_ATTEMPTS);
    }

    if (
      !compareOtp(
        normalizedPhone,
        otpValidation.otp,
        record.otpHash
      )
    ) {
      const attemptResult =
        await authRepository.incrementOtpAttempts(
          record.id,
          OTP_CONFIG.MAX_ATTEMPTS
        );

      if (attemptResult.count === 0) {
        throw new Error(AUTH_MESSAGES.TOO_MANY_ATTEMPTS);
      }

      throw new Error(AUTH_MESSAGES.INVALID_OTP);
    }

    const verificationResult =
      await authRepository.markOtpVerified(record.id);

    if (verificationResult.count !== 1) {
      throw new Error(AUTH_MESSAGES.OTP_EXPIRED);
    }

    return {
      phone: normalizedPhone,
      message: "OTP verified successfully.",
    };
  },
};
