
import { NextResponse } from "next/server";
import { getPopularProducts } from "@/modules/product/product-popularity.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Number.parseInt(
      searchParams.get("limit") || "8",
      10
    );

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Limit must be between 1 and 50.",
        },
        { status: 400 }
      );
    }

    const products = await getPopularProducts({ limit });

    return NextResponse.json({
      success: true,
      message: "Popular products fetched successfully.",
      data: {
        products,
        count: products.length,
      },
    });
  } catch (error) {
    console.error("Popular products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch popular products.",
      },
      { status: 500 }
    );
  }
}
