
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addZonePincodes } from "@/modules/delivery-zone/delivery-zone.service";

export async function POST(request, { params }) {
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

    if (!Array.isArray(body.pincodes)) {
      return NextResponse.json(
        { success: false, message: "Pincodes must be an array." },
        { status: 400 }
      );
    }

    const zone = await addZonePincodes(id, body.pincodes);

    return NextResponse.json({
      success: true,
      message: "Pincodes added successfully.",
      data: zone,
    });
  } catch (error) {
    console.error("ADD ZONE PINCODES ERROR:", error);

    const notFound = error.message === "Delivery zone not found.";
    const duplicate = error.code === "P2002";

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add pincodes.",
      },
      { status: notFound ? 404 : duplicate ? 409 : 400 }
    );
  }
}
