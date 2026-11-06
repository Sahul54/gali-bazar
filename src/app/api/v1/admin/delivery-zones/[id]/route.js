
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getDeliveryZoneById,
  editDeliveryZone,
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

// GET: Fetch one delivery zone
export async function GET(request, { params }) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { id } = await params;
    const zone = await getDeliveryZoneById(id);

    return NextResponse.json({
      success: true,
      message: "Delivery zone fetched successfully.",
      data: zone,
    });
  } catch (error) {
    console.error("GET DELIVERY ZONE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch delivery zone.",
      },
      { status: error.message === "Delivery zone not found." ? 404 : 500 }
    );
  }
}

// PATCH: Update delivery zone details
export async function PATCH(request, { params }) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const zone = await editDeliveryZone(id, body);

    return NextResponse.json({
      success: true,
      message: "Delivery zone updated successfully.",
      data: zone,
    });
  } catch (error) {
    console.error("UPDATE DELIVERY ZONE ERROR:", error);

    const isDuplicate = error.code === "P2002";
    const notFound = error.code === "P2025";

    return NextResponse.json(
      {
        success: false,
        message: isDuplicate
          ? "This zone code is already in use."
          : error.message || "Failed to update delivery zone.",
      },
      {
        status: isDuplicate ? 409 : notFound ? 404 : 400,
      }
    );
  }
}
