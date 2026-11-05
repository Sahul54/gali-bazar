
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth.js";
import { deliveryPartnerAuthService } from "@/modules/delivery-partner/delivery-partner-auth.service.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, otp } = body ?? {};

    if (
      typeof phone !== "string" ||
      typeof otp !== "string" ||
      !phone.trim() ||
      !otp.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and OTP are required.",
        },
        { status: 400 }
      );
    }

    // Verify OTP and fetch delivery partner account.
    const result = await deliveryPartnerAuthService.verifyOtp(
      phone,
      otp
    );

    // Create authenticated session cookie.
    await createSession(result.user);

    // Return login result.
    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      profile: result.profile,
      nextPath: result.nextPath,
    });

    return response;
  } catch (error) {
    const message =
      error?.message || "Unable to verify OTP.";

    const status =
      message.toLowerCase().includes("otp") ||
      message.toLowerCase().includes("phone") ||
      message.toLowerCase().includes("wait")
        ? 400
        : message.includes("another account type")
          ? 409
          : message.includes("inactive")
            ? 403
            : 500;

    if (status === 500) {
      console.error("Delivery partner OTP verification error:", error);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          status === 500
            ? "Unable to verify OTP."
            : message,
      },
      { status }
    );
  }
}
