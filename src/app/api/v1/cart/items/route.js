
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addItemToCart } from "@/modules/cart/cart.service";
import { addToCartSchema } from "@/modules/cart/cart.validation";

// ==========================================
// POST - ADD ITEM TO CART
// POST /api/v1/cart/items
// ==========================================

export async function POST(request) {
  try {
    // 1. Get customer session
    const session = await getSession();

    console.log("Cart API Session:", {
      userId: session?.userId,
      role: session?.role,
    });

    // 2. Check authentication
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHENTICATED",
          message: "Please login to continue.",
        },
        { status: 401 }
      );
    }

    // 3. Normalize role
    const role = String(session.role || "")
      .trim()
      .toUpperCase();

    // 4. Customer role validation
    if (role !== "CUSTOMER") {
      console.warn("Cart access denied:", {
        userId: session.userId,
        receivedRole: session.role,
      });

      return NextResponse.json(
        {
          success: false,
          code: "CUSTOMER_ACCESS_ONLY",
          message: "Only customers can add products to cart.",
        },
        { status: 403 }
      );
    }

    // 5. Parse request body
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // 6. Validate request data
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CART_DATA",
          message: "Invalid cart data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { variantId, quantity } = validation.data;

    // 7. Add product to cart
    const cart = await addItemToCart(
      session.userId,
      variantId,
      quantity
    );

    // 8. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Product added to cart successfully.",
        data: cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/v1/cart/items error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.statusCode
          ? error.message
          : "Unable to add product to cart.",
      },
      {
        status: error.statusCode || 500,
      }
    );
  }
}
