
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { deliveryPartnerService } from "@/modules/delivery-partner/delivery-partner.service.js";

function errorResponse(message, status) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export async function GET() {
  try {
    // 1. Authenticate user.
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    // 2. Authorize Delivery Partner.
    if (session.role !== "DELIVERY_PARTNER") {
      return errorResponse("Access denied.", 403);
    }

    // 3. Fetch authenticated partner profile.
    const result = await deliveryPartnerService.getMyProfile(
      session.userId
    );

    // 4. Return profile details.
    return NextResponse.json({
      success: true,
      user: result.user,
      profile: result.profile,
    });
  } catch (error) {
    const message = error?.message;

    if (
      message ===
      "Delivery partner profile has not been submitted yet."
    ) {
      return errorResponse(message, 404);
    }

    if (
      message === "Active delivery partner account not found."
    ) {
      return errorResponse(message, 403);
    }

    console.error("Delivery partner profile API error:", error);

    return errorResponse(
      "Unable to load your profile.",
      500
    );
  }
}
