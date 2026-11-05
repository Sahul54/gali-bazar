
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecentlyViewed } from "@/modules/product/recently-viewed.service";

// ============================================
// GET: Fetch recently viewed products
// ============================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawLimit = searchParams.get("limit") || "8";
    const limit = Number(rawLimit);

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Limit must be between 1 and 50.",
        },
        { status: 400 }
      );
    }

    const session = await getSession();
    const userId = session?.userId || null;

    let sessionId = null;

    if (!userId) {
      sessionId = searchParams.get("sessionId");

      if (
        typeof sessionId !== "string" ||
        sessionId.length < 10 ||
        sessionId.length > 128
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid guest session ID is required.",
          },
          { status: 400 }
        );
      }
    }

    const result = await getRecentlyViewed({
      userId,
      sessionId,
      limit,
    });

    return NextResponse.json({
      success: true,
      message: "Recently viewed products fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Recently viewed GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch recently viewed products.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST: Save recently viewed product
// ============================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Valid product ID is required.",
        },
        { status: 400 }
      );
    }

    const session = await getSession();
    const userId = session?.userId || null;

    let sessionId = null;

    if (!userId) {
      sessionId = body.sessionId;

      if (
        typeof sessionId !== "string" ||
        sessionId.length < 10 ||
        sessionId.length > 128
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid guest session ID is required.",
          },
          { status: 400 }
        );
      }
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // Find existing view for the same identity
    const existingView = await prisma.productView.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { sessionId }),
      },
      select: { id: true },
    });

    if (existingView) {
      await prisma.productView.update({
        where: { id: existingView.id },
        data: {
          viewedAt: new Date(),
        },
      });
    } else {
      await prisma.productView.create({
        data: {
          productId,
          userId,
          sessionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product view saved successfully.",
    });
  } catch (error) {
    console.error("Recently viewed POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save recently viewed product.",
      },
      { status: 500 }
    );
  }
}
