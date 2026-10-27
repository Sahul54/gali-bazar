
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { sellerAuthService } from "@/modules/seller/seller-auth.service.js";
import { validatePhone, validateOtp } from "@/modules/auth/auth.validation.js";
import { otpVerifyLimiter } from "@/lib/rate-limit.js";
import { createSession } from "@/lib/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneValidation = validatePhone(body.phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, message: phoneValidation.error },
        { status: 400 }
      );
    }

    const otpValidation = validateOtp(body.otp);
    if (!otpValidation.valid) {
      return NextResponse.json(
        { success: false, message: otpValidation.error },
        { status: 400 }
      );
    }

    const phone = phoneValidation.phone;

    // Rate-limit OTP verification attempts by phone.
    const phoneKey = createHash("sha256")
      .update(phone)
      .digest("hex");

    const { success, reset } = await otpVerifyLimiter.limit(phoneKey);

    if (!success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Too many verification attempts. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    // Verify OTP and apply Seller-specific account logic.
    const result = await sellerAuthService.verifyOtp(phone, otpValidation.otp);

    // Create a session only after successful Seller verification.
    await createSession(result.user);

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OTP verification failed.";

    const status = message.includes("Too many")
      ? 429
      : message.includes("inactive")
        ? 403
        : 400;

    return NextResponse.json(
      { success: false, message },
      { status }
    );
  }
}
