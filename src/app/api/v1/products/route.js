
import { NextResponse } from "next/server";
import { productService } from "@/modules/product/product.service.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const shopId = searchParams.get("shopId") || undefined;

    const skip = searchParams.has("skip")
      ? Number(searchParams.get("skip"))
      : 0;

    const take = searchParams.has("take")
      ? Number(searchParams.get("take"))
      : 20;

    const result = await productService.getProducts({
      search,
      categoryId,
      shopId,
      skip,
      take,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Products fetched successfully.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products.",
      },
      { status: error.statusCode || 500 }
    );
  }
}
