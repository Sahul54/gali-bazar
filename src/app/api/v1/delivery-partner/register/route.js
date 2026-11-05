
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

export async function POST(request) {
  try {
    // 1. Authenticate using the existing session cookie.
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    // 2. Authorize delivery partner role.
    if (session.role !== "DELIVERY_PARTNER") {
      return errorResponse(
        "Only delivery partners can register.",
        403
      );
    }

    // 3. Parse request body safely.
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return errorResponse(
        "Request body must be a JSON object.",
        400
      );
    }

    const {
      fullName,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      licenseNumber,
      licenseDocumentUrl,
      vehicleDocumentUrl,
    } = body;

    // 4. Register the delivery partner profile.
    const profile = await deliveryPartnerService.registerVehicle(
      session.userId,
      {
        fullName,
        vehicleType,
        vehicleNumber,
        vehicleModel,
        licenseNumber,
        licenseDocumentUrl,
        vehicleDocumentUrl,
      }
    );

    // 5. Return the submitted application.
    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully.",
        profile,
        nextPath: "/delivery-partner/status",
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error?.message;

    if (error?.code && error.code !== "P2002") {
      console.error(
        "Delivery partner registration error:",
        error
      );
    }

    if (error?.code === "P2002") {
      return errorResponse(
        "Delivery partner profile has already been submitted.",
        409
      );
    }

    const knownErrors = {
      "Valid delivery partner ID is required.": 400,
      "Active delivery partner account not found.": 403,
      "Delivery partner profile has already been submitted.": 409,
    };

    if (message && knownErrors[message]) {
      return errorResponse(message, knownErrors[message]);
    }

    const validationErrorPatterns = [
      /required/i,
      /valid/i,
      /cannot exceed/i,
      /must be between/i,
      /please select/i,
    ];

    if (
      message &&
      validationErrorPatterns.some((pattern) =>
        pattern.test(message)
      )
    ) {
      return errorResponse(message, 400);
    }

    console.error(
      "Delivery partner registration failed:",
      error
    );

    return errorResponse(
      "Unable to register delivery partner. Please try again.",
      500
    );
  }
}
