
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { adminDeliveryPartnerService } from "@/modules/admin/delivery-partner.service.js";

function errorResponse(message, status) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export async function PATCH(request, { params }) {
  try {
    // 1. Authenticate admin.
    const session = await getSession();

    if (!session?.userId) {
      return errorResponse("Please login to continue.", 401);
    }

    // 2. Authorize admin role.
    if (session.role !== "ADMIN") {
      return errorResponse("Admin access required.", 403);
    }

    // 3. Get application ID (Next.js 16).
    const { id } = await params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return errorResponse(
        "Valid application ID is required.",
        400
      );
    }

    // 4. Parse request body safely.
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(
        "Request body must be a JSON object.",
        400
      );
    }

    // 5. Validate status.
    const status = body.status;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return errorResponse(
        "Status must be APPROVED or REJECTED.",
        400
      );
    }

    // 6. Validate rejection reason.
    const reason = body.reason;

    if (status === "REJECTED") {
      if (typeof reason !== "string" || !reason.trim()) {
        return errorResponse(
          "Rejection reason is required.",
          400
        );
      }

      if (reason.trim().length < 5) {
        return errorResponse(
          "Rejection reason must be at least 5 characters.",
          400
        );
      }

      if (reason.trim().length > 1000) {
        return errorResponse(
          "Rejection reason cannot exceed 1000 characters.",
          400
        );
      }
    }

    // 7. Update application.
    const application =
      await adminDeliveryPartnerService.updateApplicationStatus(
        id.trim(),
        status,
        {
          reason: status === "REJECTED" ? reason.trim() : null,
          reviewedById: session.userId,
        }
      );

    // 8. Return updated application.
    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? "Delivery partner approved successfully."
          : "Delivery partner application rejected successfully.",
      application,
    });
  } catch (error) {
    const message = error?.message;

    const knownErrors = {
      "Valid application ID is required.": 400,
      "Delivery partner application not found.": 404,
      "Application is no longer pending.": 409,
      "Status must be APPROVED or REJECTED.": 400,
      "Valid admin ID is required.": 403,
      "Rejection reason is required.": 400,
      "Rejection reason must be at least 5 characters.": 400,
      "Rejection reason cannot exceed 1000 characters.": 400,
    };

    if (message && knownErrors[message]) {
      return errorResponse(message, knownErrors[message]);
    }

    console.error(
      "Admin delivery partner PATCH error:",
      error
    );

    return errorResponse(
      "Unable to update application status.",
      500
    );
  }
}
