
import { NextResponse } from "next/server";
import { deliveryPartnerAuthService } from "@/modules/delivery-partner/delivery-partner-auth.service.js";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const phone = body?.phone;

    if (typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    const result = await deliveryPartnerAuthService.sendOtp(
      phone.trim()
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error?.message || "Unable to send OTP.";

    const isRateLimited = message.includes("wait before");
    const isValidationError =
      message.toLowerCase().includes("required") ||
      message.toLowerCase().includes("valid") ||
      message.toLowerCase().includes("phone");

    const status = isRateLimited
      ? 429
      : isValidationError
        ? 400
        : 500;

    if (status === 500) {
      console.error("Delivery partner send OTP error:", error);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          status === 500
            ? "Unable to send OTP."
            : message,
      },
      { status }
    );
  }
}
