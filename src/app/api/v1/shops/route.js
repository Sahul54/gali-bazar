import { NextResponse } from "next/server";
import { shopService } from "@/modules/shop/shop.service.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const latitude = Number(searchParams.get("latitude"));
    const longitude = Number(searchParams.get("longitude"));

    const radiusKm = searchParams.has("radiusKm")
      ? Number(searchParams.get("radiusKm"))
      : 5;

    const skip = searchParams.has("skip")
      ? Number(searchParams.get("skip"))
      : 0;

    const take = searchParams.has("take")
      ? Number(searchParams.get("take"))
      : 20;

    const pincode = searchParams.get("pincode") || undefined;

    const result = await shopService.getNearbyShops({
      latitude,
      longitude,
      radiusKm,
      pincode,
      skip,
      take,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Nearby shops fetched successfully.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/shops error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch nearby shops.",
      },
      { status: error.statusCode || 500 }
    );
  }
}