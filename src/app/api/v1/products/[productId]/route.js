import { NextResponse } from "next/server";
import { productService } from "@/modules/product/product.service.js";

export async function GET(request, { params }) {
  try {
    const { productId } = await params;

    const product = await productService.getProductById(productId);

    return NextResponse.json(
      {
        success: true,
        message: "Product details fetched successfully.",
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/products/[productId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch product details.",
      },
      { status: error.statusCode || 500 }
    );
  }
}