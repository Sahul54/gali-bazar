
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changeDeliveryZoneStatus } from "@/modules/delivery-zone/delivery-zone.service";

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be true or false.",
        },
        { status: 400 }
      );
    }

    const zone = await changeDeliveryZoneStatus(id, body.isActive);

    return NextResponse.json({
      success: true,
      message: `Delivery zone ${body.isActive ? "activated" : "deactivated"} successfully.`,
      data: zone,
    });
  } catch (error) {
    console.error("UPDATE DELIVERY ZONE STATUS ERROR:", error);

    const notFound =
      error.code === "P2025" ||
      error.message === "Delivery zone not found.";

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update delivery zone status.",
      },
      { status: notFound ? 404 : 400 }
    );
  }
}
