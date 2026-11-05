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
    // 1. Authenticate user.
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    // 2. Authorize delivery partner.
    if (session.role !== "DELIVERY_PARTNER") {
      return errorResponse(
        "Only delivery partners can reapply.",
        403
      );
    }

    // 3. Parse JSON body safely.
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

    // 4. Reapply using existing profile.
    const application =
      await deliveryPartnerService.reapplyApplication(
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

    // 5. Return updated application.
    return NextResponse.json(
      {
        success: true,
        message: "Application resubmitted successfully.",
        application,
        nextPath: "/delivery-partner/status",
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error?.message;

    const knownErrors = {
      "Valid delivery partner ID is required.": 400,
      "Active delivery partner account not found.": 403,
      "Delivery partner profile not found.": 404,
      "Please submit your delivery partner profile first.": 404,
      "Your application is already approved. Reapplication is not allowed.": 409,
      "Your application is already under review.": 409,
      "Only rejected applications can be resubmitted.": 409,
      "This application cannot be resubmitted.": 409,
      "Application status changed. Please refresh and try again.": 409,
    };

    if (message && knownErrors[message]) {
      return errorResponse(message, knownErrors[message]);
    }

    // Validation errors.
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

    console.error("Delivery partner reapplication error:", error);

    return errorResponse(
      "Unable to resubmit application. Please try again.",
      500
    );
  }
}