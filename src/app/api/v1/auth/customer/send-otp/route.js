
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { authService } from "@/modules/auth/auth.service.js";
import { validatePhone } from "@/modules/auth/auth.validation.js";
import { otpSendLimiter } from "@/lib/rate-limit.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone } = body;

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

    // Hash the phone so the raw number isn't used as the Redis key.
    const identifier = createHash("sha256")
      .update(normalizedPhone)
      .digest("hex");

    const rateLimitResult = await otpSendLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Too many OTP requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const result = await authService.sendOtp(normalizedPhone);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error.message || "Something went wrong.";

    const status = message.includes("valid Indian mobile number")
      ? 400
      : message.includes("wait before requesting")
        ? 429
        : 500;

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

