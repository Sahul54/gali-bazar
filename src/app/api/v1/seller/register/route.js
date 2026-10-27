
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";
import { sellerService } from "@/modules/seller/seller.service.js";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to register your business.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "SELLER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only seller accounts can register a business.",
        },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    const business = await sellerService.registerBusiness(
      session.userId,
      {
        businessName: body.businessName,
        ownerName: body.ownerName,
        category: body.category,
        address: body.address,
        pincode: body.pincode,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Business submitted successfully. Awaiting admin approval.",
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message.includes("already been submitted")) {
      return NextResponse.json(
        { success: false, message },
        { status: 409 }
      );
    }

    if (
      message.includes("required") ||
      message.includes("characters") ||
      message.includes("exceed") ||
      message.includes("valid business category") ||
      message.includes("PIN code")
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }

    if (message.includes("inactive")) {
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      );
    }

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, message },
        { status: 404 }
      );
    }

    console.error("Seller registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
