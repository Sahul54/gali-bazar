import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin.js";
import { adminSellerService } from "@/modules/admin/admin-seller.service.js";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const business = await adminSellerService.updateSellerStatus(
      id,
      body?.status
    );

    return NextResponse.json({
      success: true,
      message: `Seller application ${business.status.toLowerCase()} successfully.`,
      business,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (
      message === "Valid seller profile ID is required." ||
      message === "Status must be APPROVED or REJECTED."
    ) {
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    if (
      message === "Seller application not found." ||
      message === "Only pending seller applications can be updated."
    ) {
      return NextResponse.json(
        { success: false, message },
        { status: 404 }
      );
    }

    console.error("Update seller status failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update seller status.",
      },
      { status: 500 }
    );
  }
}