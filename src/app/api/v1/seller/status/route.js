
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth.js";
import { sellerRepository } from "@/modules/seller/seller.repository.js";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "SELLER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only sellers can access this resource.",
        },
        { status: 403 }
      );
    }

    const seller = await sellerRepository.findSellerById(session.userId);

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller account not found.",
        },
        { status: 404 }
      );
    }

    const sellerProfile = seller.sellerProfile ?? null;

    const status = sellerProfile?.status ?? "NOT_SUBMITTED";

    return NextResponse.json(
      {
        success: true,
        seller: {
          id: seller.id,
          phone: seller.phone,
          businessName: sellerProfile?.businessName ?? null,
          status,
          isRegistered: Boolean(sellerProfile),
          canAccessDashboard: status === "APPROVED",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Seller status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch seller status.",
      },
      { status: 500 }
    );
  }
}

