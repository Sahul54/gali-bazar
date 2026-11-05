
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

export async function GET(request) {
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

    // 3. Read query parameters.
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = searchParams.get("page") || "1";

    // 4. Fetch applications.
    const result =
      await adminDeliveryPartnerService.getApplications({
        status,
        search,
        page,
      });

    // 5. Return applications and summary.
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error?.message;

    if (
      message === "Invalid application status." ||
      message === "Invalid page number."
    ) {
      return errorResponse(message, 400);
    }

    console.error(
      "Admin delivery partners API error:",
      error
    );

    return errorResponse(
      "Unable to load delivery partner applications.",
      500
    );
  }
}
