
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

export async function PATCH(request) {
  try {
    // 1. Authenticate user
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    // 2. Authorize delivery partner
    if (session.role !== "DELIVERY_PARTNER") {
      return errorResponse("Access denied.", 403);
    }

    // 3. Parse request body
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body.", 400);
    }

    const { isOnline } = body;

    if (typeof isOnline !== "boolean") {
      return errorResponse(
        "isOnline must be a boolean value.",
        400
      );
    }

    // 4. Update availability
    const profile =
      await deliveryPartnerService.updateAvailability(
        session.userId,
        isOnline
      );

    // 5. Return response
    return NextResponse.json({
      success: true,
      message: isOnline
        ? "You are now online."
        : "You are now offline.",
      profile,
    });
  } catch (error) {
    const message = error?.message;

    const knownErrors = [
      "Active delivery partner account not found.",
      "Delivery partner profile not found.",
      "Only approved delivery partners can go online.",
      "Please update your location before going online.",
      "Your location is outdated. Please update your location.",
    ];

    if (knownErrors.includes(message)) {
      return errorResponse(message, 400);
    }

    console.error("Delivery partner availability API error:", error);

    return errorResponse(
      message || "Unable to update availability.",
      500
    );
  }
}
