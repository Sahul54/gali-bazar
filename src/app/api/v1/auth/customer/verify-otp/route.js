
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { authService } from "@/modules/auth/auth.service.js";
import { createSession } from "@/lib/auth.js";
import { validatePhone } from "@/modules/auth/auth.validation.js";
import { otpVerifyLimiter } from "@/lib/rate-limit.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    // Validate and normalize the phone before rate limiting.
    const validation = validatePhone(phone);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    const normalizedPhone = validation.phone;

    // Avoid storing the raw phone number in the Redis key.
    const identifier = createHash("sha256")
      .update(normalizedPhone)
      .digest("hex");

    const rateLimitResult = await otpVerifyLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Too many OTP verification attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const result = await authService.verifyOtp(normalizedPhone, otp);

    // Create the session only after successful OTP verification.
    await createSession(result.user);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: result.user,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error.message || "Something went wrong.";

    let status = 500;

    if (
      message.includes("valid Indian mobile number") ||
      message.includes("exactly 6 digits") ||
      message.includes("expired") ||
      message.includes("Invalid") ||
      message.includes("attempts")
    ) {
      status = 400;
    } else if (message.includes("wait before requesting")) {
      status = 429;
    }

    return NextResponse.json(
      {
        success: false,
        message:
          status === 500
            ? "Something went wrong. Please try again later."
            : message,
      },
      { status }
    );
  }
}
