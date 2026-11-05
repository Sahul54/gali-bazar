
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

    const { latitude, longitude } = body;

    // 4. Update location
    const profile = await deliveryPartnerService.updateLocation(
      session.userId,
      {
        latitude,
        longitude,
      }
    );

    // 5. Return response
    return NextResponse.json({
      success: true,
      message: "Location updated successfully.",
      profile,
    });
  } catch (error) {
    const message = error?.message;

    const knownErrors = [
      "Valid delivery partner ID is required.",
      "Valid latitude and longitude are required.",
      "Active delivery partner account not found.",
      "Delivery partner profile not found.",
      "Your application must be approved before updating location.",
    ];

    if (knownErrors.includes(message)) {
      return errorResponse(message, 400);
    }

    console.error("Delivery partner location API error:", error);

    return errorResponse(
      "Unable to update location.",
      500
    );
  }
}
