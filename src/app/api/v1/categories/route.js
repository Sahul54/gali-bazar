
import { NextResponse } from "next/server";
import { categoryService } from "@/modules/category/category.service.js";

export async function GET() {
  try {
    const categories = await categoryService.getCategories();

    return NextResponse.json(
      {
        success: true,
        message: "Categories fetched successfully.",
        data: {
          categories,
          total: categories.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch categories.",
      },
      { status: error.statusCode || 500 }
    );
  }
}
