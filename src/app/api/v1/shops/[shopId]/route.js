import { NextResponse } from "next/server";
import { shopService } from "@/modules/shop/shop.service.js";

export async function GET(request, { params }) {
  try {
    const { shopId } = await params;

    const shop = await shopService.getShopById(shopId);

    return NextResponse.json(
      {
        success: true,
        message: "Shop details fetched successfully.",
        data: shop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/shops/[shopId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch shop details.",
      },
      { status: error.statusCode || 500 }
    );
  }
}