
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAllDeliveryZones,
  addDeliveryZone,
} from "@/modules/delivery-zone/delivery-zone.service";

async function verifyAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

// GET: Fetch all delivery zones
export async function GET() {
  try {
    const auth = await verifyAdmin();

    if (!auth.authorized) return auth.response;

    const zones = await getAllDeliveryZones();

    return NextResponse.json({
      success: true,
      message: "Delivery zones fetched successfully.",
      data: zones,
    });
  } catch (error) {
    console.error("GET DELIVERY ZONES ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch delivery zones." },
      { status: 500 }
    );
  }
}

// POST: Create a new delivery zone
export async function POST(request) {
  try {
    const auth = await verifyAdmin();

    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const zone = await addDeliveryZone(body);

    return NextResponse.json(
      {
        success: true,
        message: "Delivery zone created successfully.",
        data: zone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE DELIVERY ZONE ERROR:", error);

    const isDuplicate = error.code === "P2002";

    return NextResponse.json(
      {
        success: false,
        message: isDuplicate
          ? "This zone code or one of its pincodes is already in use."
          : error.message || "Failed to create delivery zone.",
      },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}
