
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  changePincodeStatus,
  deleteZonePincode,
} from "@/modules/delivery-zone/delivery-zone.service";

async function verifyAdmin() {
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

  return null;
}

// PATCH: Activate or deactivate a pincode
export async function PATCH(request, { params }) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { pincodeId } = await params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be true or false." },
        { status: 400 }
      );
    }

    const pincode = await changePincodeStatus(
      pincodeId,
      body.isActive
    );

    return NextResponse.json({
      success: true,
      message: `Pincode ${body.isActive ? "activated" : "deactivated"} successfully.`,
      data: pincode,
    });
  } catch (error) {
    console.error("UPDATE PINCODE STATUS ERROR:", error);

    const notFound = error.code === "P2025";

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update pincode.",
      },
      { status: notFound ? 404 : 400 }
    );
  }
}

// DELETE: Remove pincode from its zone
export async function DELETE(request, { params }) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { pincodeId } = await params;

    await deleteZonePincode(pincodeId);

    return NextResponse.json({
      success: true,
      message: "Pincode removed successfully.",
    });
  } catch (error) {
    console.error("DELETE PINCODE ERROR:", error);

    const notFound = error.code === "P2025";

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove pincode.",
      },
      { status: notFound ? 404 : 400 }
    );
  }
}
