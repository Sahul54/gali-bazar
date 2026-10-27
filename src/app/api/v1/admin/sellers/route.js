import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin.js";
import { adminSellerService } from "@/modules/admin/admin-seller.service.js";

export async function GET(request) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const sellers = await adminSellerService.getSellers({
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (
      message ===
        "Status must be PENDING, APPROVED, or REJECTED." ||
      message === "Search must be a string."
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }

    console.error("Fetch sellers failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch sellers.",
      },
      { status: 500 }
    );
  }
}