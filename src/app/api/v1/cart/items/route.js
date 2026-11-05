
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
    // 1. Authentication
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        { status: 401 }
      );
    }

    // 2. Customer role check
    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Customer access only.",
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();

    // 4. Validate request
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { variantId, quantity } = validation.data;

    // 5. Add item to cart
    const cart = await addItemToCart(
      session.userId,
      variantId,
      quantity
    );

    // 6. Success response
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
      { status: error.statusCode || 500 }
    );
  }
}
