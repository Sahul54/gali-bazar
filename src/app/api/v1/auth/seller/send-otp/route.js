
import { NextResponse } from "next/server";

import { sellerAuthService } from "@/modules/seller/seller-auth.service.js";
import { validatePhone } from "@/modules/auth/auth.validation.js";
import { otpSendLimiter } from "@/lib/rate-limit.js";
import { createHash } from "node:crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validatePhone(body.phone);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const phone = validation.phone;

    // Apply rate limiting using a hashed phone number.
    const phoneKey = createHash("sha256")
      .update(phone)
      .digest("hex");

    const { success, reset } = await otpSendLimiter.limit(phoneKey);

    if (!success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Too many OTP requests. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    const result = await sellerAuthService.sendOtp(phone);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unable to send OTP.";

    const status = message.includes("wait before requesting")
      ? 429
      : 400;

    return NextResponse.json(
      { success: false, message },
      { status }
    );
  }
}
