
import { NextResponse } from "next/server";
import { checkDeliveryAvailability } from "@/modules/delivery-zone/delivery-zone.service";

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await checkDeliveryAvailability(body.pincode);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELIVERY CHECK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to check delivery availability.",
      },
      { status: 400 }
    );
  }
}
