import { NextResponse } from "next/server";
import { productService } from "@/modules/product/product.service.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const shopId = searchParams.get("shopId") || undefined;

    const latitude = searchParams.get("latitude") || undefined;
    const longitude = searchParams.get("longitude") || undefined;
    const radiusKm = searchParams.has("radiusKm")
      ? Number(searchParams.get("radiusKm"))
      : 5;

    const hasPage = searchParams.has("page");
    const hasLimit = searchParams.has("limit");

    const page = hasPage ? Number(searchParams.get("page")) : 1;
    const limit = hasLimit ? Number(searchParams.get("limit")) : 20;

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters.",
        },
        { status: 400 }
      );
    }

    if (
      (latitude === undefined) !== (longitude === undefined)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Both latitude and longitude are required.",
        },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const result = await productService.getProducts({
      search,
      categoryId,
      shopId,
      latitude,
      longitude,
      radiusKm,
      skip,
      take: limit,
    });

    const { total, take } = result.pagination;

    return NextResponse.json(
      {
        success: true,
        message: "Products fetched successfully.",
        data: {
          products: result.products,
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
          hasMore: result.pagination.hasMore,
          location: result.location || null,
        },
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